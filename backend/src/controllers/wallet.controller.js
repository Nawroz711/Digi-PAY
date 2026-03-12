import Wallet from '../models/wallet.model.js'

// Create wallet for a user
export const createWallet = async (userId) => {
  const existingWallet = await Wallet.findOne({ userId })
  if (existingWallet) {
    return existingWallet
  }

  const wallet = await Wallet.create({
    userId,
    balance: 0,
    currency: 'USD',
  })

  return wallet
}

// Get user's wallet
export const getMyWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId })

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await createWallet(req.userId)
      return res.status(200).json({ data: newWallet })
    }

    return res.status(200).json({ data: wallet })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get wallet', error: error.message })
  }
}

// Add funds to wallet
export const addFunds = async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    let wallet = await Wallet.findOne({ userId: req.userId })

    if (!wallet) {
      wallet = await createWallet(req.userId)
    }

    wallet.balance += amount
    await wallet.save()

    return res.status(200).json({
      message: 'Funds added successfully',
      data: wallet,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add funds', error: error.message })
  }
}

// Withdraw funds from wallet
export const withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    const wallet = await Wallet.findOne({ userId: req.userId })

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' })
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    wallet.balance -= amount
    await wallet.save()

    return res.status(200).json({
      message: 'Funds withdrawn successfully',
      data: wallet,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to withdraw funds', error: error.message })
  }
}
