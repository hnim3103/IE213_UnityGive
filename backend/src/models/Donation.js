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

  txHash: {
    type: String,
    unique: true,
    sparse: true  // allows multiple docs with no txHash, but enforces uniqueness when present
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending"
  }

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("Donation", donationSchema);