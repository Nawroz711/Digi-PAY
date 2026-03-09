import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosClient from '../lib/axiosClient'
import { useAuthStore } from '../store/authStore'

export function useProfile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [confirmName, setConfirmName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axiosClient.get('/users/profile')
        const profile = response?.data?.data
        if (profile) {
          setUser(profile)
          setFormData({
            name: profile.name || '',
            phone: profile.phone || '',
          })
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [setUser])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Phone is required')
      return
    }

    if (formData.phone.trim().length < 7 || formData.phone.trim().length > 20) {
      toast.error('Phone number length is invalid')
      return
    }

    setIsSaving(true)

    try {
      const response = await axiosClient.put('/users/profile', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      })
      const updated = response?.data?.data
      if (updated) {
        setUser(updated)
      }
      toast.success(response?.data?.message || 'Profile updated successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerifyPhone = async () => {
    if (!formData.phone.trim()) {
      toast.error('Add a phone number before verification')
      return
    }

    setIsVerifying(true)
    try {
      const response = await axiosClient.put('/users/profile/verify-phone', {
        phone: formData.phone.trim(),
      })
      const updated = response?.data?.data
      if (updated) {
        setUser(updated)
      }
      toast.success(response?.data?.message || 'Phone verified successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to verify phone')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirmName.trim()) {
      toast.error('Type your name to confirm deletion')
      return
    }

    setIsDeleting(true)
    try {
      const response = await axiosClient.delete('/users/profile', {
        data: { confirmName: confirmName.trim() },
      })
      toast.success(response?.data?.message || 'Account deleted')
      logout()
      window.location.href = '/signin'
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    user,
    formData,
    confirmName,
    isLoading,
    isSaving,
    isVerifying,
    isDeleting,
    handleChange,
    handleSubmit,
    setConfirmName,
    handleVerifyPhone,
    handleDeleteAccount,
  }
}
