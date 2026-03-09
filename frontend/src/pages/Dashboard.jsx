import { useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  HandCoins,
  House,
  LogOut,
  ScanLine,
  Search,
  SendHorizontal,
  Settings,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import { useAuthStore } from '../store/authStore'

const dockMenus = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'send', label: 'Send', icon: SendHorizontal },
  { id: 'receive', label: 'Receive', icon: ArrowDownToLine },
  { id: 'request', label: 'Request', icon: HandCoins },
  { id: 'topup', label: 'Top Up', icon: Smartphone },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [activeMenu, setActiveMenu] = useState('home')

  const displayName = useMemo(() => user?.name || user?.email || 'User', [user])
  const avatarChar = (displayName?.[0] || 'U').toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/signin', { replace: true })
  }

  return (
    <main className="min-h-screen bg-dark pb-28">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#121317]/75 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <p className="logo shrink-0 text-2xl sm:text-[30px]">DigiPay</p>

            <div className="relative w-36 sm:w-48 md:w-64 lg:w-72">
              <Search
                size={16}
                strokeWidth={1.25}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full rounded-lg border border-slate-700 bg-secondary py-2 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              title="Scan"
              className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
            >
              <ScanLine size={16} strokeWidth={1.25} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-dark">
              {avatarChar}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="cursor-pointer rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-primary hover:text-primary"
            >
              <LogOut size={16} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6">
        <DashboardOverview />
      </div>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-white/10 bg-[#1e1f24]/45 px-2 py-2 shadow-2xl backdrop-blur-sm sm:bottom-5">
        <ul className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {dockMenus.map((menu) => {
            const Icon = menu.icon
            const isActive = activeMenu === menu.id

            return (
              <li key={menu.id} className="min-w-[68px] sm:min-w-[74px]">
                <button
                  type="button"
                  onClick={() => setActiveMenu(menu.id)}
                  className={`cursor-pointer relative flex w-full flex-col items-center rounded-lg px-1.5 py-1.5 transition duration-300 ${
                    isActive
                      ? 'bg-primary text-dark shadow-md shadow-primary/30'
                      : 'text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={19} strokeWidth={1.2} />
                  <span className="mt-1 text-[10px] font-medium sm:text-[11px]">{menu.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </main>
  )
}
