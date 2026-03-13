import Notification from '../models/notification.model.js'
import User from '../models/user.model.js'

// Create a notification for a user
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
    })
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query
    const userId = req.userId

    const query = { userId }
    if (unreadOnly === 'true') {
      query.isRead = false
    }

    const total = await Notification.countDocuments(query)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    return res.status(200).json({
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get notifications', error: error.message })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      data: notification,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark notification as read', error: error.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    )

    return res.status(200).json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark notifications as read', error: error.message })
  }
}

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const notification = await Notification.findOneAndDelete({ _id: id, userId })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.status(200).json({
      message: 'Notification deleted',
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete notification', error: error.message })
  }
}

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId
    const count = await Notification.countDocuments({ userId, isRead: false })

    return res.status(200).json({ count })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get unread count', error: error.message })
  }
}
