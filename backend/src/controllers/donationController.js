import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";

export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Failed to execute getAllDonations", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const getDonationByID = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json(donation);
  } catch (error) {
    console.error("Failed to execute getDonationByID", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const createDonation = async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    if (donation.status === "confirmed") {
      const campaign = await Campaign.findById(donation.campaignId);
      if (campaign) {
        const newAmount = (BigInt(campaign.currentAmount || "0") + BigInt(donation.amount || "0")).toString();
        campaign.currentAmount = newAmount;
        await campaign.save();
      }
    }
    res.status(201).json(donation);
  } catch (error) {
    console.error("Failed to execute createDonation", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const oldDonation = await Donation.findById(id);
    if (!oldDonation)
      return res.status(404).json({ message: "Donation not found" });
    const updatedDonation = await Donation.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    // If transitioning from unconfirmed to confirmed, add to campaign amount
    if (oldDonation.status !== "confirmed" && status === "confirmed") {
      const campaign = await Campaign.findById(updatedDonation.campaignId);
      if (campaign) {
        const newAmount = (BigInt(campaign.currentAmount || "0") + BigInt(updatedDonation.amount || "0")).toString();
        campaign.currentAmount = newAmount;
        await campaign.save();
      }
    }

    res.status(200).json(updatedDonation);
  } catch (error) {
    console.error("Failed to execute updateDonation", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};
