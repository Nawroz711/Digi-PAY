import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import SignIn from '../pages/Auth/SignIn'
import SignUp from '../pages/Auth/SignUp'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/Common/NotFound'
import { useAuthStore } from '../store/authStore'
import Profile from '../pages/Auth/Profile'
import Wallet from '../pages/Wallet/Wallet'
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <AuthenticatedLayout />
}

function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/signin',
        element: <SignIn />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/wallet',
        element: <Wallet />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
