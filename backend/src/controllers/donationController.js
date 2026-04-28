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
    const donationData = { ...req.body, status: "pending" };
    const donation = new Donation(donationData);
    await donation.save();

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

    res.status(200).json(updatedDonation);
  } catch (error) {
    console.error("Failed to execute updateDonation", error);
    res.status(500).json({ message: "An internal error occurred" });
  }
};
