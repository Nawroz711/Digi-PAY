import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const displayName = useMemo(() => user?.name || user?.email || 'User', [user])

  const handleLogout = () => {
    logout()
    navigate('/signin', { replace: true })
  }

  return (
    <main className="min-h-screen bg-dark px-6 py-12">
      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-secondary p-8 shadow ring-1 ring-slate-800">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome, {displayName}</h1>
        <p className="mt-3 text-slate-300">
          You are logged in. This page is protected and only visible to authenticated users.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-dark shadow-lg shadow-primary/20 transition hover:brightness-95"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  )
}
