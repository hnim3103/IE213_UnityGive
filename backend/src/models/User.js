import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String
  },

  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },

  nonce: {
    type: String,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },

  name: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["donor", "admin"],
    default: "donor"
  },

  phone: String,

  avatar: String,

  isVerified: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["active", "suspended", "deleted"],
    default: "active"
  },

  lastLogin: Date

}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.model("User", userSchema);