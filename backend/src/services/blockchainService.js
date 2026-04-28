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
        const existingDonation = await Donation.findOne({ txHash });

        let amountToAdd = 0n;

        if (existingDonation) {
          if (existingDonation.status !== "confirmed") {
            existingDonation.status = "confirmed";
            await existingDonation.save();
            amountToAdd = BigInt(amount.toString());
            console.log(`[BlockchainService] Pending donation confirmed for TX: ${txHash}`);
          } else {
            console.log(`[BlockchainService] Donation already confirmed for TX: ${txHash}. Skipping.`);
          }
        } else {
          await Donation.create({
            campaignId: campaign._id,
            donorId: user ? user._id : null,
            amount: amount.toString(),
            txHash: txHash,
            status: "confirmed"
          });
          amountToAdd = BigInt(amount.toString());
          console.log(`[BlockchainService] New donation record created for TX: ${txHash}`);
        }

        if (amountToAdd > 0n) {
          const currentWei = BigInt(campaign.currentAmount || "0");
          const newTotal = currentWei + amountToAdd;
          campaign.currentAmount = newTotal.toString();

          if (newTotal >= BigInt(campaign.totalGoalAmount)) {
            campaign.status = "COMPLETED";
          }
          await campaign.save();
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
