import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import axiosClient from '../lib/axiosClient'

// Query keys
export const walletKeys = {
  all: ['wallet'],
  details: () => [...walletKeys.all, 'detail'],
}

/**
 * Hook to fetch wallet data with React Query
 * Maintains backward compatibility with existing code
 */
export function useWallet() {
  const { data, isLoading, error, isFetching, refetch, ...rest } = useQuery({
    queryKey: walletKeys.details(),
    queryFn: async () => {
      const response = await axiosClient.get('/wallet')
      return response.data
    },
    refetchOnMount: true,
    staleTime: 0,
  })

  // Return in the format expected by existing components
  return {
    wallet: data?.data,
    isLoading,
    isProcessing: isFetching,
    error,
    refreshWallet: refetch,
    ...rest,
  }
}

/**
 * Hook to add funds to wallet
 */
export function useAddFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amount) => {
      const response = await axiosClient.post('/wallet/add-funds', { amount })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toast.success(data?.message || 'Funds added successfully')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add funds')
    },
  })
}

/**
 * Hook to withdraw funds from wallet
 */
export function useWithdrawFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amount) => {
      const response = await axiosClient.post('/wallet/withdraw', { amount })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toast.success(data?.message || 'Funds withdrawn successfully')
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to withdraw funds')
    },
  })
}
