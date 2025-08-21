import Notification from "../models/notification.model.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch notifications and populate 'from' user data (username and profile image)
    const notifications = await Notification.find({ to: userId })
    .populate({
      path: "from",
      select: "username profileImg",
    })
    .sort({createdAt: -1});

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete all notifications for the authenticated user
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a specific notification by ID (only if it belongs to the user)
export const deleteNotificationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      to: userId, // Ensure the user can only delete their own notifications
    });

    if (!deletedNotification) {
      return res.status(404).json({
        message: "Notification not found or you're not authorized to delete it",
      });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification by ID:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
