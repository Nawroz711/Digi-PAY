import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

// Get all notifications
router.get('/', authMiddleware, getNotifications)

// Get unread count
router.get('/unread-count', authMiddleware, getUnreadCount)

// Mark single notification as read
router.put('/:id/read', authMiddleware, markAsRead)

// Mark all notifications as read
router.put('/read-all', authMiddleware, markAllAsRead)

// Delete notification
router.delete('/:id', authMiddleware, deleteNotification)

export default router
