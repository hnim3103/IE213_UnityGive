import User from "../models/User.js";

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
            user: userResponse
        });
    } catch (error) {
        // Handle duplicate wallet address error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.walletAddress) {
            return res.status(400).json({ message: "Wallet address is already registered to another user" });
        }
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Get user by ID (Public profile)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-passwordHash -email -phone");
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
