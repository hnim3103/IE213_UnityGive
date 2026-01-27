import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  title: {
    type: String,
    required: true,
    index: true //Using index to search faster
  },

  type: {
    type: String,
    enum: ['CHILDREN', 'COMMUNITY', "ENVIRONMENT", "WILD_ANIMAL", "MEDICAL", "EDUCATION", "DIFFICULT_CIRCUMSTANCES", "ELDERLY_LIVING_ALONE", "OTHER"],
    default: "OTHER"
  },

  cover_image_url: {
    type: String,
    required: true
  },

  story: {
    type: String,
    required: true
  },

  target_amount: {
    type: Number,
    required: true,
    min: 0
  },

  current_amount: {
    type: Number,
    default: 0, 
    min: 0
  },

  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CLOSED'],
    default: 'DRAFT'
  },

  start_date: Date,
  
  end_date: Date,
}, {
  timestamps: true,
})

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;