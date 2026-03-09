import { useState } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosClient from '../lib/axiosClient.js'
import { useAuthStore } from '../store/authStore'

const initialForms = {
  signin: {
    email: '',
    password: '',
  },
  signup: {
    name: '',
    email: '',
    password: '',
    phone: '',
  },
}

export function useAuth(mode) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState(initialForms[mode] ?? initialForms.signin)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (mode === 'signup') {
      if (!formData.name?.trim() || !formData.email?.trim() || !formData.password?.trim() || !formData.phone?.trim()) {
        return 'Name, email, password, and phone are required.'
      }

      if (formData.password.length < 8) {
        return 'Password must be at least 8 characters.'
      }

      if (formData.phone.trim().length < 7 || formData.phone.trim().length > 20) {
        return 'Phone number length is invalid.'
      }

      return ''
    }

    if (!formData.email?.trim() || !formData.password?.trim()) {
      return 'Email and password are required.'
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()

    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        const response = await axiosClient.post('/users/signup', formData)
        toast.success(response?.data?.message || 'Account created successfully')
        navigate('/signin', { replace: true })
        return
      }

      const response = await axiosClient.post('/users/signin', formData)
      const token = response?.data?.token
      const user = response?.data?.data

      if (!token || !user) {
        throw new Error('Invalid sign-in response')
      }

      login({ user, token })
      const fromPath = location.state?.from?.pathname || '/dashboard'
      navigate(fromPath, { replace: true })
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (mode === 'signup' ? 'Unable to sign up. Please try again.' : 'Unable to sign in. Please try again.')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}
