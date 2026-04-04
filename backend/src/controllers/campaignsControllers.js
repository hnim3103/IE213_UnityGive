import Campaign from "../models/Campaign.js";

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("orgId", "name logo orgWalletAddress isVerified")
      .populate("creatorId", "name avatar walletAddress")
      .sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Failed to execute getAllCampaigns", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const getCampaignByID = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("orgId", "name logo orgWalletAddress isVerified description website")
      .populate("creatorId", "name avatar walletAddress")
      .populate("ambassadors", "name avatar walletAddress");
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: "Error fetching campaign" });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const {
      title, description, totalGoalAmount, softCapAmount, requiredVotes,
      milestones, councilMembers, category, image,
      startDate, endDate, orgId, creatorId, ambassadors
    } = req.body;

    // In a production environment, you might dispatch the Web3 transaction here 
    // to UnityGive.sol via ethers.js. For now, we save the Multi-Sig struct to DB.

    const campaign = new Campaign({
      title,
      description,
      totalGoalAmount,
      softCapAmount,
      currentAmount: "0",
      requiredVotes: requiredVotes || 1,
      milestones: milestones || [],
      councilMembers: councilMembers || [],
      category,
      image,
      startDate,
      endDate,
      orgId,
      creatorId,
      ambassadors
    });

    const newCampaign = await campaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Failed to execute createCampaign", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const campaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign
    });
  } catch (error) {
    console.error("Failed to execute updateCampaign", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Failed to execute deleteCampaign", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};