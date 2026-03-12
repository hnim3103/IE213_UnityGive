import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  }

}, {
  timestamps: false
});

favoriteSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);