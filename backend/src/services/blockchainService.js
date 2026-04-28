import { ethers } from "ethers";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import UnityGiveABI from "../lib/UnityGive.json" with { type: "json" };

let provider;
let contract;

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

    // 1. Listen for DonationReceived
    contract.on("DonationReceived", async (campaignId, donor, amount, event) => {
      console.log(`[Event: DonationReceived] Campaign: ${campaignId}, Donor: ${donor}, Amount: ${ethers.formatEther(amount)} ETH`);

      try {
        const onChainId = Number(campaignId);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (!campaign) {
          console.error(`[BlockchainService] Campaign with onChainId ${onChainId} not found in DB.`);
          return;
        }

        // Find user by wallet address
        const user = await User.findOne({ walletAddress: { $regex: new RegExp(`^${donor}$`, "i") } });

        const txHash = event.log.transactionHash;
        const previousDoc = await Donation.findOneAndUpdate(
          { txHash },
          {
            $setOnInsert: {
              campaignId: campaign._id,
              donorId: user ? user._id : null,
              amount: amount.toString(),
              txHash,
            },
            $set: { status: "confirmed" }
          },
          { upsert: true, new: false, setDefaultsOnInsert: true }
        );

        const wasAlreadyConfirmed = previousDoc?.status === "confirmed";

        let amountToAdd = 0n;
        if (!wasAlreadyConfirmed) {
          amountToAdd = BigInt(amount.toString());
          console.log(`[BlockchainService] Donation confirmed for TX: ${txHash}`);
        } else {
          console.log(`[BlockchainService] Donation already confirmed for TX: ${txHash}. Skipping amount update.`);
        }

        if (amountToAdd > 0n) {
          let currentWei;
          const storedStr = (campaign.currentAmount || "0").toString();
          if (storedStr.includes(".")) {
            // Legacy ETH float stored by fixAmounts.js → convert to Wei
            currentWei = ethers.parseEther(storedStr);
          } else {
            // Already Wei string (current standard)
            currentWei = BigInt(storedStr || "0");
          }

          const newTotal = currentWei + amountToAdd;
          // Always persist as Wei string going forward
          campaign.currentAmount = newTotal.toString();

          // totalGoalAmount may also be an ETH float (from fixAmounts.js migration)
          const goalStr = (campaign.totalGoalAmount || "0").toString();
          const goalWei = goalStr.includes(".")
            ? ethers.parseEther(goalStr)
            : BigInt(goalStr || "0");

          if (newTotal >= goalWei) {
            campaign.status = "COMPLETED";
          }
          await campaign.save();
          console.log(`[BlockchainService] Campaign ${campaign._id} currentAmount updated to ${ethers.formatEther(newTotal)} ETH`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing DonationReceived:", err);
      }
    });

    contract.on("MilestoneApproved", async (campaignId, milestoneIndex) => {
      console.log(`[Event: MilestoneApproved] Campaign: ${campaignId}, Milestone: ${milestoneIndex}`);

      try {
        const onChainId = Number(campaignId);
        const mIdx = Number(milestoneIndex);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (campaign && campaign.milestones[mIdx]) {
          campaign.milestones[mIdx].isApproved = true;
          await campaign.save();
          console.log(`[BlockchainService] Milestone ${mIdx} marked as approved in DB.`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing MilestoneApproved:", err);
      }
    });

    contract.on("FundsReleased", async (campaignId, milestoneIndex, orgWallet, amount) => {
      console.log(`[Event: FundsReleased] Campaign: ${campaignId}, Milestone: ${milestoneIndex}, Org: ${orgWallet}`);

      try {
        const onChainId = Number(campaignId);
        const mIdx = Number(milestoneIndex);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (campaign && campaign.milestones[mIdx]) {
          campaign.milestones[mIdx].isFunded = true;
          await campaign.save();
          console.log(`[BlockchainService] Milestone ${mIdx} marked as funded in DB.`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing FundsReleased:", err);
      }
    });

    contract.on("ProofUploaded", async (campaignId, milestoneIndex, ipfsCID) => {
      console.log(`[Event: ProofUploaded] Campaign: ${campaignId}, Milestone: ${milestoneIndex}, CID: ${ipfsCID}`);

      try {
        const onChainId = Number(campaignId);
        const mIdx = Number(milestoneIndex);
        const campaign = await Campaign.findOne({ onChainCampaignId: onChainId });

        if (campaign && campaign.milestones[mIdx]) {
          campaign.milestones[mIdx].ipfsEvidence = ipfsCID;
          await campaign.save();
          console.log(`[BlockchainService] Milestone ${mIdx} proof synced to DB: ${ipfsCID}`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing ProofUploaded:", err);
      }
    });

    contract.on("CampaignRegistered", async (campaignId, mongoId, goalAmount, requiredVotes) => {
      console.log(`[Event: CampaignRegistered] On-chain ID: ${campaignId}, Mongo ID: ${mongoId}`);

      try {
        const onChainId = Number(campaignId);
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
          campaign.onChainCampaignId = onChainId;
          campaign.status = "ACTIVE";
          await campaign.save();
          console.log(`[BlockchainService] Campaign ${campaign._id} synced with on-chain ID ${onChainId}`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing CampaignRegistered:", err);
      }
    });

  } catch (err) {
    console.error("[BlockchainService] Failed to initialize:", err);
  }
};
