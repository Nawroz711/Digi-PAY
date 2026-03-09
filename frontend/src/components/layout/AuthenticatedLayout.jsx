import { Outlet } from 'react-router-dom'
import AuthHeader from './AuthHeader'

export default function AuthenticatedLayout() {
  return (
    <>
      <AuthHeader />
      <Outlet />
    </>
  )
}
