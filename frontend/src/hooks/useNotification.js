import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../lib/axiosClient'

// Query keys
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), filters],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
}

/**
 * Hook to fetch notifications with React Query
 * @param {Object} params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {boolean} params.unreadOnly - Only unread notifications
 */
export function useNotifications(params) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const response = await axiosClient.get('/notifications', { params })
      return response.data
    },
  })
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await axiosClient.get('/notifications/unread-count')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosClient.put(`/notifications/${id}/read`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.put('/notifications/read-all')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosClient.delete(`/notifications/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
