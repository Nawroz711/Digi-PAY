import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../lib/axiosClient'

// Query keys
export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (filters) => [...transactionKeys.lists(), filters],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (reference) => [...transactionKeys.details(), reference],
  stats: () => [...transactionKeys.all, 'stats'],
}

/**
 * Hook to fetch transactions with React Query
 * @param {Object} params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 */
export function useTransactions(params) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async () => {
      const response = await axiosClient.get('/transaction', { params })
      return response.data
    },
  })
}

/**
 * Hook to send money
 */
export function useSendMoney() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ recipient, amount, description }) => {
      const response = await axiosClient.post('/transaction/send', {
        recipient,
        amount: parseFloat(amount),
        description,
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate wallet and transaction queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Hook to fetch transaction by reference
 * @param {string} reference - Transaction reference
 */
export function useTransaction(reference) {
  return useQuery({
    queryKey: transactionKeys.detail(reference),
    queryFn: async () => {
      const response = await axiosClient.get(`/transaction/reference/${reference}`)
      return response.data
    },
    enabled: !!reference,
  })
}

/**
 * Hook to fetch transaction statistics
 */
export function useTransactionStats() {
  return useQuery({
    queryKey: transactionKeys.stats(),
    queryFn: async () => {
      const response = await axiosClient.get('/transaction/stats')
      return response.data
    },
  })
}
