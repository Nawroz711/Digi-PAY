import { useState } from 'react'
import { toast } from 'react-toastify'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useWallet } from '../../hooks/useWallet'
import { usePayment } from '../../hooks/usePayment'
import { loadStripe } from '@stripe/stripe-js'
import axiosClient from '../../lib/axiosClient'
import { useAuthStore } from '../../store/authStore'

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
      const clientSecret = await createPaymentIntent(amount)

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
  const user = useAuthStore((state) => state.user)
  const [amount, setAmount] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)

  const handleAddCash = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAddCash()
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

  const accountNumber = user?.accountNumber || ''
  const formattedAccount = accountNumber ? `${accountNumber.slice(0, 4)} ${accountNumber.slice(4, 8)} ${accountNumber.slice(8, 12)}` : '**** **** **** ****'

  return (
    <main className="min-h-screen bg-dark px-4 pb-20 pt-6 sm:px-6">
      <section className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-semibold text-white mb-6">My Wallet</h1>

        {/* Two Column Layout - Card Left, Form Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Real MasterCard Style */}
          <div className="relative">
            <div 
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
              }}
            >
              {/* Metallic shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20"></div>
              
              {/* Top pattern */}
              <div className="absolute top-0 left-0 right-0 h-20 opacity-10">
                <svg viewBox="0 0 400 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="#00D4AA" />
                  <circle cx="90" cy="50" r="40" fill="#FF6B6B" />
                </svg>
              </div>

              {/* MasterCard Circles - Real Style */}
              <div className="absolute top-5 right-6 flex items-center">
                <div className="h-12 w-12 rounded-full border-2 border-[#1a1a1a] bg-yellow-400 opacity-90"></div>
                <div className="h-12 w-12 rounded-full border-2 border-[#1a1a1a] bg-red-500 opacity-90 -ml-4"></div>
              </div>
              
              {/* Card Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white tracking-[0.2em]">DigiPay</span>
                  <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#EB001B" fillOpacity="0.8"/>
                    <circle cx="32" cy="16" r="14" fill="#F79E1B" fillOpacity="0.8"/>
                    <path d="M24 8a14 14 0 0 0 0 16 14 14 0 0 0 0-16z" fill="#FF5F00"/>
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                  <p className="text-lg font-mono font-semibold tracking-[0.25em] text-white">
                    {formattedAccount}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Balance</p>
                    <p className="text-2xl font-bold text-white">
                      ${wallet?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-green-400">Active</span>
                  </div>
                </div>
              </div>

              {/* Bottom shine */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
          </div>

          {/* Right - Add Cash Form */}
          <div className="rounded-2xl border border-slate-700 bg-secondary p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Add Cash to Wallet</h2>
            <p className="text-sm text-slate-300 mb-6">Add funds to your DigiPay wallet using your card</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="amount">
                  Amount (USD)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-[#121212] px-3 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-lg"
                  placeholder="Enter amount"
                />
              </div>

              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full rounded-md bg-primary px-5 py-3 text-base font-semibold text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Add Cash to Wallet
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                Secured by Stripe. Your payment information is encrypted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stripe Payment Modal */}
      {showPaymentModal && stripeKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-secondary p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Add Cash to Wallet</h2>
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
