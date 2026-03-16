import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },

  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: String, // Wei as string
    required: true
  },

  currency: {
    type: String,
    default: "USD"
  },

  method: {
    type: String,
    enum: ["fiat", "crypto"],
    required: true
  },

  txHash: String,

  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending"
  },

  message: String

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("Donation", donationSchema);