import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownLeft, Search, ChevronLeft, Loader2 } from 'lucide-react'
import { useTransactions } from '../../hooks/useTransaction'
import { useWallet } from '../../hooks/useWallet'
import Pagination from '../../components/ui/Pagination'

export default function Receive() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const { wallet, isLoading: walletLoading } = useWallet()
  
  // Get page and filters from URL, default to 1
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const searchParam = searchParams.get('search') || ''
  const statusParam = searchParams.get('status') || 'all'

  const [search, setSearch] = useState(searchParam)
  const [status, setStatus] = useState(statusParam)
  const [page, setPage] = useState(pageParam)

  // React Query hooks - fetch received transactions
  const { data: transactionData, isLoading: historyLoading } = useTransactions({
    page,
    limit: 2,
    search: search.trim() || undefined,
    direction: 'received', // Only fetch received transactions
  })

  const transactions = transactionData?.data || []
  const pagination = transactionData?.pagination || { page: 1, limit: 2, total: 0, pages: 0 }

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (search) params.set('search', search)
    if (status !== 'all') params.set('status', status)
    setSearchParams(params, { replace: true })
  }, [page, search, status, setSearchParams])

  // Sync from URL
  useEffect(() => {
    setPage(pageParam)
    setSearch(searchParam)
    setStatus(statusParam)
  }, [pageParam, searchParam, statusParam])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Use transactions directly since backend filters by direction
  const receivedTransactions = transactions

  return (
    <div className="min-h-screen bg-dark p-4 pb-24 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Receive Money</h1>
        </div>

        {/* Balance Card */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-secondary p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <ArrowDownLeft className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Received</p>
              <p className="text-2xl font-bold text-white">
                {walletLoading ? <Loader2 className="animate-spin" size={24} /> : formatAmount(wallet?.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-white/10 bg-secondary p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Received Transactions</h2>
            <p className="text-sm text-slate-400">View money you've received</p>
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or account..."
                  className="w-full rounded-lg border border-slate-700 bg-[#1c1d22] py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 font-medium text-dark transition hover:bg-primary/90"
              >
                Search
              </button>
            </form>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-[#1c1d22] px-3 py-2.5 text-white focus:border-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs font-medium uppercase text-slate-400">
                  <th className="pb-3">From</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {historyLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <Loader2 className="mx-auto animate-spin text-primary" size={24} />
                    </td>
                  </tr>
                ) : receivedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No received transactions found
                    </td>
                  </tr>
                ) : (
                  receivedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="text-sm">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-white">{transaction.counterparty?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{transaction.counterparty?.accountNumber || ''}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-green-400">
                          <ArrowDownLeft size={14} />
                          <span className="font-medium">+{formatAmount(transaction.amount)}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination 
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </div>
      </div>
    </div>
  )
}
