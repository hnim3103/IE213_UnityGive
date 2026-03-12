import mongoose from "mongoose";

const campaignUpdateSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  }

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("CampaignUpdate", campaignUpdateSchema);