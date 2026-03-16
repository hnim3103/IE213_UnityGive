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

// POST /api/favourites    body: { campaignId }
router.post("/", authenticate, addFavorite);

// GET /api/favourites    -> get favorites for authenticated user
router.get("/", authenticate, getFavoritesByUser);

// DELETE /api/favourites   body: { campaignId }
router.delete("/", authenticate, removeFavorite);

export default router;
