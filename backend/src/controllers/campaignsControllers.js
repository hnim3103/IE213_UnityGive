import Campaign from "../models/Campaign.js";

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Failed to execute getAllCampaigns", error);
    res.status(500).json({message: "An internal error occurred"});
  }
};

export const createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);

    const newCampaign = await campaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Failed to execute createCampaign", error);
    res.status(500).json({message: "An internal error occurred"});
  }
};

export const updateCampaign = (req, res) => {
  res.status(200).json({message: "Campaign updated successfully"});
};

export const deleteCampaign = (req, res) => {
  res.status(200).json({message: "Campaign deleted successfully"});
};