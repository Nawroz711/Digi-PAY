import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Tools() {
  return (
    <div className="min-h-screen bg-dark p-4 pb-24 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/wallet"
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Tools</h1>
        </div>

        {/* Coming Soon */}
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-white/10 bg-secondary p-6">
          <div className="mb-6 text-6xl">🛠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Coming Soon</h2>
          <p className="max-w-md text-center text-slate-400">
            Exciting tools and features are on the way! Check back soon for powerful utilities to manage your finances.
          </p>
        </div>
      </div>
    </div>
  )
}
