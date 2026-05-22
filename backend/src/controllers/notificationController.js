import Notification from "../models/Notification.js";

/**
 * @desc Get all notifications for the logged in user
 * @route GET /api/notifications
 * @access Private
 */
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("metadata.campaignId", "title slug");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("[NotificationController] Error fetching notifications:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error("[NotificationController] Error marking as read:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
