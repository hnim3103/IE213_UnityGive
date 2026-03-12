import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    required: true
  }

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("Comment", commentSchema);