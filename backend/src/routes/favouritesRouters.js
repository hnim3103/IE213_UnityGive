import express from "express";
import { addFavorite, getFavoritesByUser, removeFavorite } from "../controllers/favouritesControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite management
 */

/**
 * @swagger
 * /api/favourites:
 *   post:
 *     summary: Add a campaign to authenticated user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId]
 *             properties:
 *               campaignId:
 *                 type: string
 *                 example: 664f1b2c9a1e2d3f4a5b6c7e
 *     responses:
 *       201:
 *         description: Favorite created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         description: Already favorited
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.post("/", authenticate, addFavorite);

/**
 * @swagger
 * /api/favourites:
 *   get:
 *     summary: Get authenticated user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites and populated campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get("/", authenticate, getFavoritesByUser);

/**
 * @swagger
 * /api/favourites:
 *   delete:
 *     summary: Remove a campaign from authenticated user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId]
 *             properties:
 *               campaignId:
 *                 type: string
 *                 example: 664f1b2c9a1e2d3f4a5b6c7e
 *     responses:
 *       200:
 *         description: Removed favorite
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Favorite not found
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.delete("/", authenticate, removeFavorite);

export default router;
