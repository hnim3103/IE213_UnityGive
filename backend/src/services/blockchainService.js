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
        
        // Update campaign currentAmount
        // currentAmount in contract is net of fees, event 'amount' is also net in the contract logic:
        // emit DonationReceived(campaignId, msg.sender, added);
        // where added = toCampaign - fee
        
        // We use string addition for Wei safety
        const currentWei = BigInt(campaign.currentAmount || "0");
        const newTotal = currentWei + BigInt(amount.toString());
        campaign.currentAmount = newTotal.toString();
        
        if (newTotal >= BigInt(campaign.totalGoalAmount)) {
          campaign.status = "COMPLETED";
        }
        await campaign.save();

        // Create donation record if it doesn't exist
        const txHash = event.log.transactionHash;
        const existingDonation = await Donation.findOne({ txHash });

        if (!existingDonation) {
          await Donation.create({
            campaignId: campaign._id,
            donorId: user ? user._id : null, // If user not found, we still track the donation
            amount: amount.toString(),
            method: "crypto",
            txHash: txHash,
            status: "confirmed",
            currency: "ETH"
          });
          console.log(`[BlockchainService] Donation record created for TX: ${txHash}`);
        }
      } catch (err) {
        console.error("[BlockchainService] Error processing DonationReceived:", err);
      }
    });

    // 2. Listen for MilestoneApproved
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

    // 3. Listen for FundsReleased
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

    // 4. Listen for CampaignRegistered (Fallback Sync)
    contract.on("CampaignRegistered", async (campaignId, mongoId, goalAmount, requiredVotes) => {
        console.log(`[Event: CampaignRegistered] On-chain ID: ${campaignId}, Mongo ID: ${mongoId}`);
        
        try {
          const onChainId = Number(campaignId);
          let campaign;

          if (mongoId && ethers.isHexString(mongoId, 12)) {
             campaign = await Campaign.findById(mongoId);
          }

          if (!campaign) {
            // Fallback: search by goal and recent draft if mongoId was empty
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
