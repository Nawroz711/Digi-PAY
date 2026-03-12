import DashboardOverview from '../components/dashboard/DashboardOverview'
import { useWallet } from '../hooks/useWallet'

export default function Dashboard() {
  const { wallet } = useWallet()

  return (
    <main className="min-h-screen bg-dark pb-28 pt-4">
      <div className="px-4 sm:px-6">
        <DashboardOverview wallet={wallet} />
      </div>
    </main>
  )
}
