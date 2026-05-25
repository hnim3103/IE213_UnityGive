import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     description: Returns a list of notifications for the authenticated user, sorted by newest first. Each notification may include populated campaign metadata.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized – JWT token missing or invalid
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/", verifyToken, getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Sets the `isRead` field to `true` for the specified notification. The notification must belong to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the notification
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized – JWT token missing or invalid
 *       403:
 *         description: Forbidden – Notification does not belong to the authenticated user
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put("/:id/read", verifyToken, markAsRead);

export default router;
