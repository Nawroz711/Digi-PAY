import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SendHorizontal, Search, ChevronLeft, Loader2, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { useTransactions, useSendMoney } from '../../hooks/useTransaction'
import { useWallet } from '../../hooks/useWallet'
import Pagination from '../../components/ui/Pagination'

export default function Send() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const { wallet, isLoading: walletLoading } = useWallet()
  
  // Get page from URL, default to 1
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const searchParam = searchParams.get('search') || ''
  const recipientParam = searchParams.get('to') || ''

  const [search, setSearch] = useState(searchParam)
  const [page, setPage] = useState(pageParam)
  const [recipient, setRecipient] = useState(recipientParam || '')

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  
  // Form state
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(null)

  // React Query hooks
  const { data: transactionData, isLoading: historyLoading } = useTransactions({
    page,
    limit: 2,
    search: search.trim() || undefined,
  })

  const sendMoneyMutation = useSendMoney()

  const transactions = transactionData?.data || []
  const pagination = transactionData?.pagination || { page: 1, limit: 2, total: 0, pages: 0 }

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (search) params.set('search', search)
    setSearchParams(params, { replace: true })
  }, [page, search, setSearchParams])

  // Sync page from URL
  useEffect(() => {
    setPage(pageParam)
  }, [pageParam])

  // Open dialog automatically when navigating from QR scan
  useEffect(() => {
    if (recipientParam) {
      setRecipient(recipientParam)
      setShowDialog(true)
    }
  }, [recipientParam])

  const openDialog = () => {
    setFormError('')
    setSuccess(null)
    setRecipient('')
    setAmount('')
    setDescription('')
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
    setFormError('')
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess(null)

    if (!recipient.trim()) {
      setFormError('Please enter recipient account number or phone')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) > (wallet?.balance || 0)) {
      setFormError('Insufficient balance')
      return
    }

    try {
      const result = await sendMoneyMutation.mutateAsync({ recipient, amount, description })
      setSuccess(`Successfully sent ${amount} to ${recipient}`)
      setTimeout(() => {
        closeDialog()
      }, 1500)
    } catch (err) {
      setFormError(err.message || 'Failed to send money')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to page 1 on new search
    // URL will be updated by the useEffect
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    // URL will be updated by the useEffect
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

  // Filter sent transactions only for display
  const sentTransactions = transactions.filter(tx => tx.direction === 'sent')

  return (
    <div className="min-h-screen bg-dark p-4 pb-24 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white">Send Money</h1>
          </div>
          
          <button
            type="button"
            onClick={openDialog}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-dark transition hover:bg-primary/90"
          >
            <Plus size={20} />
            Send Money
          </button>
        </div>

        {/* Transaction History - Full Page */}
        <div className="rounded-2xl border border-white/10 bg-secondary p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Transaction History</h2>
            <p className="text-sm text-slate-400">View your sent transactions</p>
          </div>

          {/* Search Only */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or account number..."
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
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs font-medium uppercase text-slate-400">
                  <th className="pb-3">Recipient</th>
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
                ) : sentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  sentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="text-sm">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-white">{transaction.counterparty?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{transaction.counterparty?.accountNumber || ''}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-red-400">
                          <span className="text-xs">↑</span>
                          <span className="font-medium">-{formatAmount(transaction.amount)}</span>
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

          {/* Reusable Pagination Component */}
          <Pagination 
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </div>
      </div>

      {/* Send Money Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-secondary p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <SendHorizontal className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Send Money</h2>
                  <p className="text-sm text-slate-400">Transfer funds to another account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Balance Display */}
            <div className="mb-6 rounded-xl bg-[#1c1d22] p-4">
              <p className="text-sm text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {walletLoading ? <Loader2 className="animate-spin" size={24} /> : formatAmount(wallet?.balance || 0)}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {(formError || sendMoneyMutation.error) && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-400">
                <AlertCircle size={18} />
                <span className="text-sm">{formError || sendMoneyMutation.error?.message}</span>
              </div>
            )}

            {/* Send Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Recipient Account Number or Phone
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter 12-digit account number or phone"
                  className="w-full rounded-lg border border-slate-700 bg-[#1c1d22] px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Phone numbers must be verified</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-700 bg-[#1c1d22] px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full rounded-lg border border-slate-700 bg-[#1c1d22] px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendMoneyMutation.isPending || walletLoading}
                className="w-full rounded-lg bg-primary py-3.5 font-semibold text-dark transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendMoneyMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </span>
                ) : (
                  'Send Money'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
