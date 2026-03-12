import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import axiosClient from '../lib/axiosClient'

let stripePromise = null

const getStripe = () => {
  if (!stripePromise) {
    // This will be replaced with actual key from backend
    stripePromise = loadStripe('pk_test_placeholder')
  }
  return stripePromise
}

export function usePayment() {
  const [stripeKey, setStripeKey] = useState(null)
  const [isLoadingKey, setIsLoadingKey] = useState(true)

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axiosClient.get('/payment/stripe-key')
        const key = response?.data?.publishableKey
        if (key) {
          setStripeKey(key)
          stripePromise = loadStripe(key)
        }
      } catch (error) {
        console.error('Failed to load Stripe key:', error)
      } finally {
        setIsLoadingKey(false)
      }
    }

    fetchStripeKey()
  }, [])

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
