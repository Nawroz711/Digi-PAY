import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loadStripe } from '@stripe/stripe-js'
import axiosClient from '../lib/axiosClient'

// Query keys
export const paymentKeys = {
  all: ['payment'],
  stripeKey: () => [...paymentKeys.all, 'stripeKey'],
}

let stripePromise = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_placeholder')
  }
  return stripePromise
}

/**
 * Hook to fetch Stripe publishable key
 */
export function useStripeKey() {
  return useQuery({
    queryKey: paymentKeys.stripeKey(),
    queryFn: async () => {
      const response = await axiosClient.get('/payment/stripe-key')
      const key = response?.data?.publishableKey
      if (key) {
        stripePromise = loadStripe(key)
      }
      return key
    },
    staleTime: Infinity, // The key doesn't change often
  })
}

/**
 * Hook to create payment intent
 */
export function useCreatePaymentIntent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amount) => {
      const response = await axiosClient.post('/payment/create-payment-intent', { amount })
      return response?.data?.clientSecret
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

/**
 * Hook to confirm payment
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentIntentId) => {
      const response = await axiosClient.post('/payment/confirm-payment', { paymentIntentId })
      return response?.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

/**
 * Legacy hook - maintains backward compatibility
 * @deprecated Use useStripeKey, useCreatePaymentIntent, useConfirmPayment instead
 */
export function usePayment() {
  const { data: stripeKey, isLoading: isLoadingKey } = useStripeKey()

  const createPaymentIntent = async (amount) => {
    try {
      const response = await axiosClient.post('/payment/create-payment-intent', { amount })
      return response?.data?.clientSecret
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create payment'
    }
  }

  const confirmPayment = async (paymentIntentId) => {
    try {
      const response = await axiosClient.post('/payment/confirm-payment', { paymentIntentId })
      return response?.data
    } catch (error) {
      throw error.response?.data?.message || 'Failed to confirm payment'
    }
  }

  return {
    stripe: stripePromise,
    stripeKey,
    isLoadingKey,
    createPaymentIntent,
    confirmPayment,
    getStripe,
  }
}
