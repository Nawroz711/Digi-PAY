import Stripe from 'stripe'
import Wallet from '../models/wallet.model.js'

// Get Stripe publishable key
export const getStripePublishableKey = async (req, res) => {
  try {
    return res.status(200).json({
      publishableKey: process.env.STRIPE_API_KEY,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get Stripe key', error: error.message })
  }
}

const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Create payment intent for adding funds
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    const stripe = getStripe()

    // Amount in cents
    const amountInCents = Math.round(amount * 100)

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: req.userId.toString(),
        type: 'wallet_topup',
      },
    })

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create payment intent', error: error.message })
  }
}

// Confirm payment and add funds to wallet
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' })
    }

    const stripe = getStripe()

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' })
    }

    // Check if this payment was already processed
    if (paymentIntent.metadata.processed === 'true') {
      return res.status(400).json({ message: 'Payment already processed' })
    }

    // Get the amount in dollars
    const amount = paymentIntent.amount / 100

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: req.userId })

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.userId,
        balance: amount,
        currency: 'USD',
      })
    } else {
      wallet.balance += amount
      await wallet.save()
    }

    // Mark payment as processed
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { processed: 'true' },
    })

    return res.status(200).json({
      message: 'Payment successful, funds added to wallet',
      data: {
        wallet,
        paymentAmount: amount,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to confirm payment', error: error.message })
  }
}
