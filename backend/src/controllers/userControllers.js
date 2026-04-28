import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import bcrypt from "bcrypt";

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, avatar, walletAddress } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;
    user.walletAddress = walletAddress || user.walletAddress;

    const updatedUser = await user.save();

    // Convert Mongoose doc to raw object and remove password
    const userResponse = updatedUser.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    // Handle duplicate wallet address error
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.walletAddress
    ) {
      return res
        .status(400)
        .json({
          message: "Wallet address is already registered to another user",
        });
    }
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Change user password
// @route   POST /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Please fill in all password fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    // Get user with password hash
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get user by ID (Public profile)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-passwordHash -email -phone",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get dashboard metrics for current user
// @route   GET /api/users/profile/dashboard
// @access  Private
export const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get total impact (sum of confirmed donations)
    const userDonations = await Donation.find({
      donorId: userId,
      status: "confirmed",
    });
    const totalDonatedWei = userDonations.reduce(
      (acc, doc) => acc + BigInt((doc.amount || "0").toString().split(".")[0]),
      BigInt(0),
    );

    // 2. Get unique Campaigns supported
    const supportedCampaignIds = [
      ...new Set(userDonations.map((d) => d.campaignId.toString())),
    ];

    // 3. Get active campaigns created by user
    const activeCampaignsCount = await Campaign.countDocuments({
      creatorId: userId,
    });

    // 4. Get 'My Campaigns' (created campaigns + recently donated campaigns)
    const myCampaignsCreated = await Campaign.find({ creatorId: userId }).sort({
      createdAt: -1,
    });

    // Find campaigns the user supported but did not create
    const supportedNotCreatedIds = supportedCampaignIds.filter(
      (id) => !myCampaignsCreated.some((c) => c._id.toString() === id),
    );
    const myCampaignsSupported = await Campaign.find({
      _id: { $in: supportedNotCreatedIds },
    }).sort({ createdAt: -1 });

    const formattedMyCampaigns = [];

    myCampaignsCreated.forEach((c) => {
      formattedMyCampaigns.push({
        id: c._id,
        title: c.title,
        image:
          c.image ||
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000",
        donated: "Owner",
        category: c.category || "COMMUNITY",
        status: c.status || "ACTIVE",
        progress:
          Number(c.totalGoalAmount) > 0
            ? Math.min(100, Math.round(
              ((Number(c.currentAmount || 0) / 1e18) / Number(c.totalGoalAmount)) *
              100,
            ))
            : 0,
        currentMilestone: c.milestones?.length
          ? c.milestones.find((m) => !m.isApproved)?.title || "Completed"
          : "Fundraising",
        isOwned: true,
      });
    });

    // Calculate amount donated to each supported campaign
    myCampaignsSupported.forEach((c) => {
      const amountWei = userDonations
        .filter((d) => d.campaignId.toString() === c._id.toString())
        .reduce(
          (acc, d) => acc + BigInt((d.amount || "0").toString().split(".")[0]),
          BigInt(0),
        );

      const ethAmount = (Number(amountWei) / 1e18).toFixed(3);

      formattedMyCampaigns.push({
        id: c._id,
        title: c.title,
        image:
          c.image ||
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000",
        donated: `${ethAmount} ETH`,
        category: c.category || "COMMUNITY",
        status: c.status || "ACTIVE",
        progress:
          Number(c.totalGoalAmount) > 0
            ? Math.min(100, Math.round(
              ((Number(c.currentAmount || 0) / 1e18) / Number(c.totalGoalAmount)) *
              100,
            ))
            : 0,
        currentMilestone: c.milestones?.length
          ? c.milestones.find((m) => !m.isApproved)?.title || "Completed"
          : "Fundraising",
        isOwned: false,
      });
    });

    // 5. Impact Feed
    const allRelevantCamps = [
      ...supportedCampaignIds,
      ...myCampaignsCreated.map((c) => c._id.toString()),
    ];

    const recentDonations = await Donation.find({
      campaignId: { $in: allRelevantCamps },
      status: "confirmed",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("campaignId", "title");

    const impactFeed = recentDonations.map((d) => {
      const ethVal = (Number(d.amount) / 1e18).toFixed(3);
      return {
        id: d._id,
        type: "donation",
        project: d.campaignId ? d.campaignId.title : "UnityGive Campaign",
        event: `New donation of ${ethVal} ETH received`,
        time: "Just now",
      };
    });

    res.status(200).json({
      stats: {
        totalImpact: (Number(totalDonatedWei) / 1e18).toFixed(3) + " ETH",
        CampaignsSupported: supportedCampaignIds.length,
        activeCampaigns: activeCampaignsCount,
      },
      myCampaigns: formattedMyCampaigns,
      impactFeed: impactFeed.length
        ? impactFeed
        : [
          {
            id: 1,
            type: "system",
            message: "Welcome to UnityGive dashboard!",
            time: "Just now",
          },
        ],
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Submit KYC documents (Organizations)
// @route   POST /api/users/profile/kyc
// @access  Private
export const submitKyc = async (req, res) => {
  try {
    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: "Documents are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.kycDocuments = documents;
    user.kycStatus = "pending";
    await user.save();

    res
      .status(200)
      .json({ message: "KYC submitted successfully", kycStatus: "pending" });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all pending KYC applications
// @route   GET /api/users/kyc/pending
// @access  Private/Admin
export const getPendingKyc = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: "pending" }).select(
      "-passwordHash -nonce",
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending KYC applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update KYC status
// @route   PUT /api/users/kyc/:id/status
// @access  Private/Admin
export const updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.kycStatus = status;
    if (status === "approved") {
      user.isVerified = true;
    } else {
      user.isVerified = false;
    }
    await user.save();

    res.status(200).json({ message: `KYC application ${status}`, user });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update user role or status
// @route   PUT /api/users/:id/manage
// @access  Private/Admin
export const updateUserRoleStatus = async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role) {
      if (!["donor", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    if (status) {
      if (!["active", "suspended", "deleted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      user.status = status;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user role/status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
