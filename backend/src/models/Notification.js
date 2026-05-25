import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["MILESTONE_APPROVAL", "SYSTEM"],
      default: "MILESTONE_APPROVAL",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
      },
      milestoneIndex: {
        type: Number,
      },
      onChainCampaignId: {
        type: Number,
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
