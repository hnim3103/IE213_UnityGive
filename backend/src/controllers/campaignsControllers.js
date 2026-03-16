import Campaign from "../models/Campaign.js";

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Failed to execute getAllCampaigns", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const getCampaignByID = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
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
      title, description, totalGoalAmount, requiredVotes,
      milestones, councilMembers, category, image,
      startDate, endDate, orgId, creatorId, ambassadors
    } = req.body;

    // In a production environment, you might dispatch the Web3 transaction here 
    // to UnityGive.sol via ethers.js. For now, we save the Multi-Sig struct to DB.

    const campaign = new Campaign({
      title,
      description,
      totalGoalAmount,
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

export const updateCampaign = (req, res) => {
  res.status(200).json({ message: "Campaign updated successfully" });
};

export const deleteCampaign = (req, res) => {
  res.status(200).json({ message: "Campaign deleted successfully" });
};