import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('digipay_auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    }
  } catch {
    // Ignore local storage parse issues.
  }

  return config
})

export default axiosClient
