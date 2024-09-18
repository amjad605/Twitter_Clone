import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .populate({ path: "from", select: "username profileImage" })
      .sort({ createdAt: -1 });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json({
      statusCode: 200,
      message: "Notification retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({
      statusCode: 200,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
