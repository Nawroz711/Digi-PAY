import { useState } from 'react'
import {
  ArrowDownToLine,
  HandCoins,
  House,
  SendHorizontal,
  Settings,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import { useWallet } from '../hooks/useWallet'

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
  const [activeMenu, setActiveMenu] = useState('home')
  const navigate = useNavigate()
  const { wallet } = useWallet()

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId)
    if (menuId === 'wallet') {
      navigate('/wallet')
    }
  }

  return (
    <main className="min-h-screen bg-dark pb-28 pt-4">
      <div className="px-4 sm:px-6">
        <DashboardOverview wallet={wallet} />
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
                  onClick={() => handleMenuClick(menu.id)}
                  className={`cursor-pointer relative flex w-full flex-col items-center rounded-lg px-1.5 py-1.5 transition duration-300 ${isActive
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
