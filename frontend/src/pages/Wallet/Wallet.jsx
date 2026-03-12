import { useState } from 'react'
import { toast } from 'react-toastify'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useWallet } from '../../hooks/useWallet'
import { usePayment } from '../../hooks/usePayment'
import { loadStripe } from '@stripe/stripe-js'
import axiosClient from '../../lib/axiosClient'

function PaymentForm({ amount, onSuccess, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const { createPaymentIntent, confirmPayment } = usePayment()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const clientSecret = await createPaymentIntent(amount)

      // Confirm payment with card
      const cardElement = elements.getElement(CardElement)
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        setError(stripeError.message)
        setIsProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm with backend
        await confirmPayment(paymentIntent.id)
        onSuccess()
      }
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#6b7280',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Card Details
        </label>
        <div className="rounded-md border border-slate-700 bg-[#121212] p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 rounded-md border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>
    </form>
  )
}

export default function Wallet() {
  const { wallet, isLoading, refreshWallet } = useWallet()
  const { stripeKey, isLoadingKey } = usePayment()
  const [amount, setAmount] = useState('')
  const [activeTab, setActiveTab] = useState('add') // 'add' or 'withdraw'
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)

  const handleAddFunds = () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setPaymentAmount(numAmount)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Funds added to your wallet.')
    setShowPaymentModal(false)
    setAmount('')
    refreshWallet()
  }

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    try {
      const response = await axiosClient.post('/wallet/withdraw', { amount: numAmount })
      const data = response.data

      if (data.message) {
        toast.success(data.message)
        setAmount('')
        refreshWallet()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw funds')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'add') {
      handleAddFunds()
    } else {
      handleWithdraw()
    }
  }

  if (isLoading || isLoadingKey) {
    return (
      <main className="min-h-screen bg-dark px-4 pb-16 pt-6 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-sm text-slate-400">Loading wallet...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-dark px-4 pb-16 pt-6 sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-700 bg-secondary p-5 shadow-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Wallet</h1>
            <p className="mt-1 text-sm text-slate-300">Manage your wallet balance</p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-6">
          <p className="text-sm font-medium text-slate-300">Available Balance</p>
          <p className="mt-2 text-4xl font-bold text-white">
            ${wallet?.balance?.toFixed(2) || '0.00'}
          </p>
          <p className="mt-1 text-sm text-slate-400">{wallet?.currency || 'USD'}</p>
        </div>

        {/* Add/Withdraw Form */}
        <div className="mt-6">
          <div className="flex rounded-lg border border-slate-700 bg-[#121212] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === 'add'
                  ? 'bg-primary text-dark'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Add Funds
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === 'withdraw'
                  ? 'bg-primary text-dark'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Withdraw
            </button>
          </div>

          <form className="mt-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="amount">
                Amount ({wallet?.currency || 'USD'})
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-[#121212] px-3 py-2.5 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Enter amount"
              />
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="mt-4 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {activeTab === 'add' ? 'Add Funds' : 'Withdraw Funds'}
            </button>
          </form>
        </div>
      </section>

      {/* Stripe Payment Modal */}
      {showPaymentModal && stripeKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-secondary p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Add Funds</h2>
            <p className="mt-2 text-sm text-slate-300">
              Amount: <span className="font-semibold text-primary">${paymentAmount}</span>
            </p>

            <Elements stripe={loadStripe(stripeKey)}>
              <PaymentForm
                amount={paymentAmount}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </main>
  )
}
