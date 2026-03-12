import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: String,

  licenseNumber: String,

  website: String,

  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  logo: String

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("Organization", organizationSchema);