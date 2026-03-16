import express from "express";
import {
  getAllDonations,
  getDonationByID,
  createDonation,
  updateDonation,
} from "../controllers/donationController.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation management
 */

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all donations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/", verifyAdmin, getAllDonations);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get a donation by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     description: MongoDB ObjectId of the donation
 *     responses:
 *       200:
 *         description: Donation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/:id", verifyToken, getDonationByID);

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Donation'
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/", verifyToken, createDonation);
/**
 * @swagger
 * /api/donations/{id}:
 *   put:
 *     summary: Update donation status (Confirm payment)
 *     description: Used by system/admin to update status and trigger amount increment.
 *     tags: [Donations]
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
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed]
 *               txHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", verifyAdmin, updateDonation);

export default router;
