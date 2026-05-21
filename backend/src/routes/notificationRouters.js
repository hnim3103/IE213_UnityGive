import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getUserNotifications);
router.put("/:id/read", verifyToken, markAsRead);

export default router;
