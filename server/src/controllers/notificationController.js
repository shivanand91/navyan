import { PushSubscription } from "../models/PushSubscription.js";
import { Notification } from "../models/Notification.js";

/**
 * Register or update user device push subscription token
 */
export const registerPushSubscription = async (req, res, next) => {
  try {
    const { subscriptionId, provider, browser, platform } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ message: "subscriptionId is required" });
    }

    const subscription = await PushSubscription.findOneAndUpdate(
      { subscriptionId },
      {
        user: req.user._id,
        provider: provider || "onesignal",
        browser,
        platform,
        isActive: true,
        lastSeenAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Subscription registered successfully", subscription });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve notifications for the current student
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark specific or all notifications as read
 */
export const markNotificationsAsRead = async (req, res, next) => {
  try {
    const { id } = req.body; // If undefined, mark all as read

    if (id) {
      await Notification.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isRead: true, readAt: new Date() }
      );
    } else {
      await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    }

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
