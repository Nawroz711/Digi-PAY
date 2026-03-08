import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
    confirmPassword: '',
  },
}

export function useAuth(mode) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState(initialForms[mode] ?? initialForms.signin)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (mode === 'signup') {
      if (!formData.name?.trim() || !formData.email?.trim() || !formData.password?.trim()) {
        return 'Name, email, and password are required.'
      }

      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters.'
      }

      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match.'
      }

      return ''
    }

    if (!formData.email?.trim() || !formData.password?.trim()) {
      return 'Email and password are required.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (mode === 'signup') {
        login({
          name: formData.name.trim(),
          email: formData.email.trim(),
        })
        navigate('/dashboard', { replace: true })
      } else {
        const fromPath = location.state?.from?.pathname || '/dashboard'
        login({ email: formData.email.trim() })
        navigate(fromPath, { replace: true })
      }
    } catch {
      setError(mode === 'signup' ? 'Unable to sign up. Please try again.' : 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    error,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}
