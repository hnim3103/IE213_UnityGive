import { ethers } from "ethers";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import UnityGiveABI from "../lib/UnityGive.json" with { type: "json" };

let provider;
let contract;

/**
 * Initializes the ethers.js provider and smart contract instance.
 * Sets up listeners for critical on-chain events (Donation, Milestone, Proofs)
 * and synchronizes them with the MongoDB database.
 * 
 * @returns {Promise<void>}
 */
export const initBlockchainListener = async () => {
  const rpcUrl = process.env.RPC_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress) {
    console.warn("[BlockchainService] RPC_URL or CONTRACT_ADDRESS not configured. Indexer disabled.");
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    contract = new ethers.Contract(contractAddress, UnityGiveABI.abi, provider);

    console.log(`[BlockchainService] Listening for events on ${contractAddress}...`);

    // ============================
    // DONATION RECEIVED
    // ============================
    contract.on("DonationReceived", async (campaignId, donor, amount, event) => {
      console.log(
        `[Event: DonationReceived] Campaign: ${campaignId}, Donor: ${donor}, Amount: ${ethers.formatEther(amount)} ETH`
      );

      try {
        const onChainId = Number(campaignId);

        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });
        if (!campaign) {
          console.error(`[BlockchainService] Campaign ${onChainId} not found`);
          return;
        }

        const user = await User.findOne({
          walletAddress: { $regex: new RegExp(`^${donor}$`, "i") }
        });

        const txHash = event.log.transactionHash;

        // ============================
        // SAFE INSERT OR UPDATE (ATOMIC UPSERT)
        // ============================
        // We use findOneAndUpdate with upsert: true and $setOnInsert to prevent race conditions.
        // If the frontend already created a 'pending' donation with this txHash, 
        // we update it to 'confirmed'. If not, we insert a new confirmed record.
        const previousDoc = await Donation.findOneAndUpdate(
          { txHash },
          {
            $setOnInsert: {
              campaignId: campaign._id,
              donorId: user ? user._id : null,
              txHash
            },
            $set: { 
              status: "confirmed",
              amount: amount.toString()
            }
          },
          {
            upsert: true,
            returnDocument: "before",
            setDefaultsOnInsert: true
          }
        );

        const wasAlreadyConfirmed = previousDoc?.status === "confirmed";
        const isNew = !wasAlreadyConfirmed;

        if (isNew) {
          console.log(`[BlockchainService] Donation confirmed for TX: ${txHash}`);
        } else {
          console.log(`[BlockchainService] Duplicate donation skipped: ${txHash}`);
        }

        // ============================
        // UPDATE CAMPAIGN TOTAL
        // ============================
        if (isNew) {
          let currentWei;

          const storedStr = (campaign.currentAmount || "0").toString();

          if (storedStr.includes(".")) {
            currentWei = ethers.parseEther(storedStr);
          } else {
            currentWei = BigInt(storedStr || "0");
          }

          const newTotal = currentWei + amount;

          campaign.currentAmount = newTotal.toString();

          // Normalize goal
          const goalStr = (campaign.totalGoalAmount || "0").toString();
          const goalWei = goalStr.includes(".")
            ? ethers.parseEther(goalStr)
            : BigInt(goalStr || "0");

          if (newTotal >= goalWei && goalWei > 0n) {
            campaign.status = "COMPLETED";
          }

          await campaign.save();

          console.log(
            `[BlockchainService] Campaign ${campaign._id} updated → ${ethers.formatEther(newTotal)} ETH`
          );
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing DonationReceived:", err);
      }
    });

    // ============================
    // MILESTONE APPROVED
    // ============================
    contract.on("MilestoneApproved", async (campaignId, milestoneIndex) => {
      try {
        const campaign = await Campaign.findOne({
          onChainCampaignId: Number(campaignId)
        });

        if (campaign && campaign.milestones[milestoneIndex]) {
          campaign.milestones[milestoneIndex].isApproved = true;
          await campaign.save();
        }
      } catch (err) {
        console.error("[MilestoneApproved Error]", err);
      }
    });

    // ============================
    // FUNDS RELEASED
    // ============================
    contract.on("FundsReleased", async (campaignId, milestoneIndex) => {
      try {
        const campaign = await Campaign.findOne({
          onChainCampaignId: Number(campaignId)
        });

        if (campaign && campaign.milestones[milestoneIndex]) {
          campaign.milestones[milestoneIndex].isFunded = true;
          await campaign.save();
        }
      } catch (err) {
        console.error("[FundsReleased Error]", err);
      }
    });

    // ============================
    // PROOF UPLOADED
    // ============================
    contract.on("ProofUploaded", async (campaignId, milestoneIndex, ipfsCID) => {
      try {
        const onChainId = Number(campaignId);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (campaign && campaign.milestones[milestoneIndex]) {
          campaign.milestones[milestoneIndex].ipfsEvidence = ipfsCID;
          await campaign.save();

          console.log(`[BlockchainService] Proof uploaded for Campaign ${onChainId}, Milestone ${milestoneIndex}. Notifying Top Donors...`);

          // Fetch top donors from smart contract
          for (let i = 0; i < 5; i++) {
            try {
              const donorAddress = await contract.topDonors(campaignId, i);
              if (donorAddress && donorAddress !== ethers.ZeroAddress) {
                // Find user by wallet address
                const user = await User.findOne({
                  walletAddress: { $regex: new RegExp(`^${donorAddress}$`, "i") }
                });

                if (user) {
                  // Create Notification
                  await Notification.create({
                    user: user._id,
                    message: `Campaign "${campaign.title}" is requesting approval for Milestone ${Number(milestoneIndex) + 1}. Please review the proof of impact and sign.`,
                    type: "MILESTONE_APPROVAL",
                    metadata: {
                      campaignId: campaign._id,
                      milestoneIndex: Number(milestoneIndex),
                      onChainCampaignId: onChainId
                    }
                  });
                  console.log(`[BlockchainService] Notified User ${user._id} (${donorAddress})`);
                }
              }
            } catch (err) {
              console.error(`[BlockchainService] Error fetching top donor at index ${i}:`, err);
            }
          }
        }
      } catch (err) {
        console.error("[ProofUploaded Error]", err);
      }
    });

    // ============================
    // CAMPAIGN REGISTERED
    // ============================
    contract.on("CampaignRegistered", async (campaignId, mongoId, goalAmount) => {
      try {
        let campaign;

        if (mongoId && ethers.isHexString(mongoId, 12)) {
          campaign = await Campaign.findById(mongoId);
        }

        if (!campaign) {
          campaign = await Campaign.findOne({
            onChainCampaignId: { $exists: false },
            totalGoalAmount: goalAmount.toString(),
            status: "DRAFT"
          }).sort({ createdAt: -1 });
        }

        if (campaign) {
          campaign.onChainCampaignId = Number(campaignId);
          campaign.status = "ACTIVE";
          await campaign.save();
        }
      } catch (err) {
        console.error("[CampaignRegistered Error]", err);
      }
    });

  } catch (err) {
    console.error("[BlockchainService] Failed to initialize:", err);
  }
};