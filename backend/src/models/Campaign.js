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

  totalGoalAmount: {
    type: String, // Stored as String to prevent Wei precision loss
    required: true
  },

  // THÊM MỚI: Mức vốn tối thiểu để chiến dịch được coi là thành công
  softCapAmount: {
    type: String,
    required: true,
    // Nên validate softCapAmount <= totalGoalAmount ở cấp độ Controller
  },

  currentAmount: {
    type: String,
    default: "0"
  },

  // CẬP NHẬT: Thêm các trạng thái xử lý thất bại
  status: {
    type: String,
    enum: [
      "DRAFT",
      "ACTIVE",
      "PAUSED",
      "COMPLETED", // Đạt Soft Cap hoặc Hard Cap
      "FAILED",    // Không đạt Soft Cap khi hết hạn
      "REFUNDING", // Đang trong quá trình cho phép user rút lại tiền
      "CANCELLED"
    ],
    default: "DRAFT"
  },

  // THÊM MỚI: Xử lý gia hạn thời gian
  isExtended: {
    type: Boolean,
    default: false
  },

  originalEndDate: {
    type: Date // Lưu lại mốc thời gian gốc nếu có sự gia hạn
  },


  onChainCampaignId: {
    type: Number
  },

  requiredVotes: {
    type: Number,
    default: 1
  },

  milestones: [{
    title: String,
    amount: String, // Wei String
    ipfsEvidence: String,
    isApproved: { type: Boolean, default: false },
    isFunded: { type: Boolean, default: false }
  }],

  councilMembers: [{
    type: String // Ethereum addresses
  }],

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