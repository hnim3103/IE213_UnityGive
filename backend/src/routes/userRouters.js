import express from "express";
import {
    getUserProfile,
    updateUserProfile,
    getUserDashboardData,
    getUserById,
    getAllUsers,
    submitKyc,
    getPendingKyc,
    updateKycStatus,
    updateUserRoleStatus
} from "../controllers/userControllers.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profiles
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile", verifyToken, getUserProfile);

/**
 * @swagger
 * /api/users/profile/dashboard:
 *   get:
 *     summary: Get user dashboard metrics and campaigns
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data including stats, campaigns, and impact feed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/profile/dashboard", verifyToken, getUserDashboardData);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               walletAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error or duplicate wallet
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/profile", verifyToken, updateUserProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       500:
 *         description: Internal server error
 */
router.get("/", verifyAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (Public profile)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: Public user profile data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /api/users/profile/kyc:
 *   post:
 *     summary: Submit KYC documents (Organizations only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post("/profile/kyc", verifyToken, submitKyc);

/**
 * @swagger
 * /api/users/kyc/pending:
 *   get:
 *     summary: Get all pending KYC applications (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/kyc/pending", verifyAdmin, getPendingKyc);

/**
 * @swagger
 * /api/users/kyc/{id}/status:
 *   put:
 *     summary: Approve or Reject a KYC application (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put("/kyc/:id/status", verifyAdmin, updateKycStatus);

/**
 * @swagger
 * /api/users/{id}/manage:
 *   put:
 *     summary: Manage user role and status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [donor, admin]
 *               status:
 *                 type: string
 *                 enum: [active, suspended, deleted]
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       500:
 *         description: Internal server error
 */
router.put("/:id/manage", verifyAdmin, updateUserRoleStatus);

export default router;
