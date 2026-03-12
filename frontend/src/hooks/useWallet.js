import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosClient from '../lib/axiosClient'

export function useWallet() {
  const [wallet, setWallet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axiosClient.get('/wallet')
        setWallet(response?.data?.data)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load wallet')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallet()
  }, [])

  const addFunds = async (amount) => {
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setIsProcessing(true)
    try {
      const response = await axiosClient.post('/wallet/add-funds', { amount })
      setWallet(response?.data?.data)
      toast.success(response?.data?.message || 'Funds added successfully')
      return true
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add funds')
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const withdrawFunds = async (amount) => {
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setIsProcessing(true)
    try {
      const response = await axiosClient.post('/wallet/withdraw', { amount })
      setWallet(response?.data?.data)
      toast.success(response?.data?.message || 'Funds withdrawn successfully')
      return true
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to withdraw funds')
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    wallet,
    isLoading,
    isProcessing,
    addFunds,
    withdrawFunds,
    refreshWallet: () => {
      setIsLoading(true)
      axiosClient.get('/wallet')
        .then((response) => setWallet(response?.data?.data))
        .catch((error) => toast.error(error?.response?.data?.message || 'Failed to load wallet'))
        .finally(() => setIsLoading(false))
    },
  }
}
