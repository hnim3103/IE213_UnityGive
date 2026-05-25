import { ethers } from "ethers";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import UnityGiveABI from "../lib/UnityGive.json" with { type: "json" };
import VotedABI from "../lib/Voted.json" with { type: "json" };
import { generateTop5Hash, generateSigningMessage, formatSigningMessageForNotification } from "../utils/top5DonorHash.js";

let provider;
let unityGiveContract;
let votedContract;
let votedContractAddress;

/**
 * Initializes the ethers.js provider and smart contract instances.
 * Sets up listeners for critical on-chain events (Donation, Milestone, Proofs)
 * and synchronizes them with the MongoDB database.
 * Also initializes Voted contract for top 5 donor multi-sig approvals.
 *
 * @returns {Promise<void>}
 */
export const initBlockchainListener = async () => {
  const rpcUrl = process.env.RPC_URL;
  const unityGiveContractAddress = process.env.CONTRACT_ADDRESS;
  const votedAddr = process.env.VOTED_CONTRACT_ADDRESS;

  if (!rpcUrl || !unityGiveContractAddress) {
    console.warn("[BlockchainService] RPC_URL or CONTRACT_ADDRESS not configured. Indexer disabled.");
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    unityGiveContract = new ethers.Contract(unityGiveContractAddress, UnityGiveABI.abi, provider);

    if (votedAddr) {
      votedContractAddress = votedAddr;
      votedContract = new ethers.Contract(votedAddr, VotedABI.abi, provider);
      console.log(`[BlockchainService] Voted contract initialized at ${votedAddr}`);
    }

    console.log(`[BlockchainService] Listening for events on ${unityGiveContractAddress}...`);

    // ============================
    // DONATION RECEIVED
    // ============================
    unityGiveContract.on("DonationReceived", async (campaignId, donor, amount, event) => {
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
    unityGiveContract.on("MilestoneApproved", async (campaignId, milestoneIndex) => {
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
    unityGiveContract.on("FundsReleased", async (campaignId, milestoneIndex) => {
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
    // PROOF UPLOADED - Enhanced with Voted Contract Integration
    // ============================
    unityGiveContract.on("ProofUploaded", async (campaignId, milestoneIndex, ipfsCID) => {
      try {
        const onChainId = Number(campaignId);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (campaign && campaign.milestones[milestoneIndex]) {
          campaign.milestones[milestoneIndex].ipfsEvidence = ipfsCID;
          await campaign.save();

          console.log(`[BlockchainService] Proof uploaded for Campaign ${onChainId}, Milestone ${milestoneIndex}. Notifying Top Donors...`);

          // Fetch top 5 donors from UnityGive smart contract
          const topDonors = [];
          for (let i = 0; i < 5; i++) {
            try {
              const donorAddress = await unityGiveContract.topDonors(campaignId, i);
              if (donorAddress && donorAddress !== ethers.ZeroAddress) {
                topDonors.push(donorAddress);
              }
            } catch (err) {
              console.error(`[BlockchainService] Error fetching top donor at index ${i}:`, err);
            }
          }

          // If we have 5 donors and Voted contract is configured, register milestone on Voted
          if (topDonors.length === 5 && votedContract && votedContractAddress) {
            try {
              // Generate Poseidon hash of top 5 donors (ZKP proof)
              const top5Hash = generateTop5Hash(topDonors);
              console.log(`[BlockchainService] Generated Poseidon hash for top 5 donors: ${top5Hash}`);

              // Get milestone amount to disburse (from campaign configuration or hardcoded)
              const milestoneAmount = campaign.milestones[milestoneIndex]?.amount || ethers.parseEther("0");

              // Register milestone on Voted contract
              try {
                // Note: This requires a signer account. In production, use a relayer account.
                // For now, this is logged for manual execution or automated via a relayer service.
                console.log(`[BlockchainService] Would register milestone on Voted contract:`);
                console.log(`  - Campaign ID: ${onChainId}`);
                console.log(`  - Milestone Index: ${milestoneIndex}`);
                console.log(`  - Top 5 Hash: ${top5Hash}`);
                console.log(`  - Amount: ${ethers.formatEther(milestoneAmount)} ETH`);
                console.log(`  - Recipient: ${campaign.organizationWallet}`);
              } catch (err) {
                console.error("[BlockchainService] Error registering milestone on Voted:", err);
              }

              // Generate signing message for donors
              const chainId = (await provider.getNetwork()).chainId;
              const messageHash = generateSigningMessage({
                chainId,
                votedContractAddress,
                campaignId: onChainId,
                milestoneIndex: Number(milestoneIndex),
                poseidonHash: top5Hash,
              });

              console.log(`[BlockchainService] Generated signing message hash: ${messageHash}`);

              // Create notifications for each top 5 donor with signing details
              for (const donorAddress of topDonors) {
                try {
                  const user = await User.findOne({
                    walletAddress: { $regex: new RegExp(`^${donorAddress}$`, "i") }
                  });

                  if (user) {
                    // Create Notification with signing information
                    await Notification.create({
                      user: user._id,
                      message: `Campaign "${campaign.title}" is requesting approval for Milestone ${Number(milestoneIndex) + 1}. You are in the top 5 donors. Please review the proof of impact and sign to approve.`,
                      type: "MILESTONE_APPROVAL",
                      metadata: {
                        campaignId: campaign._id,
                        milestoneIndex: Number(milestoneIndex),
                        onChainCampaignId: onChainId,
                        // ZKP & Signing data
                        messageHash,
                        top5Hash,
                        chainId,
                        votedContractAddress,
                        donorAddresses: topDonors,
                        displayText: `Sign to approve Milestone ${Number(milestoneIndex) + 1} of Campaign ${campaign.title}`
                      }
                    });
                    console.log(`[BlockchainService] Notified top donor ${user._id} (${donorAddress}) with signing details`);
                  }
                } catch (err) {
                  console.error(`[BlockchainService] Error creating notification for top donor ${donorAddress}:`, err);
                }
              }
            } catch (err) {
              console.error("[BlockchainService] Error processing Voted contract integration:", err);
            }
          } else if (topDonors.length < 5) {
            console.warn(`[BlockchainService] Only ${topDonors.length} top donors found, need 5 for Voted contract`);
          }
        }
      } catch (err) {
        console.error("[ProofUploaded Error]", err);
      }
    });

    // ============================
    // CAMPAIGN REGISTERED
    // ============================
    unityGiveContract.on("CampaignRegistered", async (campaignId, mongoId, goalAmount) => {
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

/**
 * Register a milestone on the Voted contract (for top 5 donor multi-sig approval)
 * This should be called by a relayer account with funds to pay for gas
 *
 * @param {number} campaignId - Campaign ID on-chain
 * @param {number} milestoneIndex - Milestone index
 * @param {string[]} topDonors - Array of 5 donor addresses
 * @param {BigInt} amount - Amount to disburse in Wei
 * @param {string} recipientWallet - Organization wallet to receive funds
 * @param {ethers.Signer} signer - Signer account to execute transaction
 * @returns {Promise<object>} - Transaction receipt
 */
export const registerVotedMilestone = async (campaignId, milestoneIndex, topDonors, amount, recipientWallet, signer) => {
  if (!votedContract) {
    throw new Error("Voted contract not initialized. Set VOTED_CONTRACT_ADDRESS environment variable.");
  }

  try {
    // Generate Poseidon hash of top 5 donors
    const top5Hash = generateTop5Hash(topDonors);

    console.log(`[BlockchainService] Registering milestone on Voted contract:`);
    console.log(`  - Campaign ID: ${campaignId}`);
    console.log(`  - Milestone Index: ${milestoneIndex}`);
    console.log(`  - Top 5 Hash: ${top5Hash}`);
    console.log(`  - Amount: ${ethers.formatEther(amount)} ETH`);

    // Create signer contract instance
    const votedSigner = votedContract.connect(signer);

    // Call registerCampaignMilestone
    const tx = await votedSigner.registerCampaignMilestone(
      campaignId,
      milestoneIndex,
      top5Hash,
      amount,
      recipientWallet
    );

    console.log(`[BlockchainService] Milestone registration transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`[BlockchainService] Milestone registered successfully in block ${receipt.blockNumber}`);

    return receipt;
  } catch (err) {
    console.error("[BlockchainService] Error registering milestone on Voted:", err);
    throw err;
  }
};