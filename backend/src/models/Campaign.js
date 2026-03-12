import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },

  description: {
    type: String,
    required: true
  },

  goalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  contractAddress: {
    type: String
  },

  category: {
    type: String,
    enum: [
      "CHILDREN",
      "COMMUNITY",
      "ENVIRONMENT",
      "WILD_ANIMAL",
      "MEDICAL",
      "EDUCATION",
      "DIFFICULT_CIRCUMSTANCES",
      "ELDERLY_LIVING_ALONE",
      "OTHER"
    ],
    default: "OTHER"
  },

  status: {
    type: String,
    enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"],
    default: "DRAFT"
  },

  image: {
    type: String,
    required: true
  },

  startDate: Date,

  endDate: Date,

  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ambassadors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

}, {
  timestamps: true
});

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;