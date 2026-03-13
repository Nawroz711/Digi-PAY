import User from '../models/user.model.js'
import Wallet from '../models/wallet.model.js'
import Transaction from '../models/transaction.model.js'
import { createNotification } from './notification.controller.js'
import { sendSMS } from '../utils/otp.js'

// Send money to another user
export const sendMoney = async (req, res) => {
  try {
    const { recipient, amount, description } = req.body

    // Validate required fields
    if (!recipient?.trim()) {
      return res.status(400).json({ message: 'Recipient account number or phone is required' })
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    const senderId = req.userId
    const recipientInput = recipient.trim()

    // Find recipient by account number or phone number
    let receiver = await User.findOne({
      $or: [
        { accountNumber: recipientInput },
        { phone: recipientInput },
      ],
    })

    if (!receiver) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    // Check if sender is trying to send to themselves
    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot send money to yourself' })
    }

    // If using phone number, check if receiver's phone is verified
    if (/^\+?[\d\s-]+$/.test(recipientInput) && !/^\d{12}$/.test(recipientInput)) {
      // It's a phone number, check if verified
      if (!receiver.verified) {
        return res.status(400).json({ message: 'Recipient phone number is not verified. Please use account number instead.' })
      }
    }

    // Get sender's wallet
    const senderWallet = await Wallet.findOne({ userId: senderId })
    if (!senderWallet) {
      return res.status(404).json({ message: 'Wallet not found' })
    }

    // Check sufficient balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    try {
      // Deduct from sender
      senderWallet.balance -= amount
      await senderWallet.save()

      // Add to receiver
      let receiverWallet = await Wallet.findOne({ userId: receiver._id })
      if (receiverWallet) {
        receiverWallet.balance += amount
        await receiverWallet.save()
      } else {
        // Create receiver's wallet if doesn't exist
        receiverWallet = await Wallet.create({
          userId: receiver._id,
          balance: amount,
          currency: 'USD',
        })
      }

      // Create transaction record
      const transaction = await Transaction.create({
        senderId,
        receiverId: receiver._id,
        amount,
        currency: 'USD',
        type: 'send',
        status: 'completed',
        description: description?.trim() || '',
      })

      // Create notification for receiver
      const sender = await User.findById(senderId)
      await createNotification(
        receiver._id,
        'payment_received',
        'Payment Received',
        `You received ${amount} from ${sender?.name || 'someone'}`,
        {
          amount,
          senderName: sender?.name,
          senderAccountNumber: sender?.accountNumber,
          transactionId: transaction._id,
        }
      )

      // Send SMS notification to receiver
      try {
        if (receiver.phone) {
          const balanceMessage = `You received ${amount} from ${sender?.name || 'someone'}. Your new balance is ${receiverWallet.balance}.`
          await sendSMS(receiver.phone, balanceMessage)
        }
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError.message)
        // Don't fail the transaction if SMS fails
      }

      return res.status(200).json({
        message: 'Money sent successfully',
        data: {
          transaction,
          amount,
          recipient: {
            name: receiver.name,
            accountNumber: receiver.accountNumber,
          },
        },
      })
    } catch (error) {
      // Rollback on error - restore balances
      try {
        senderWallet.balance += amount
        await senderWallet.save()
        
        const receiverWallet = await Wallet.findOne({ userId: receiver._id })
        if (receiverWallet) {
          receiverWallet.balance -= amount
          await receiverWallet.save()
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
      throw error
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send money', error: error.message })
  }
}

// Get user's transaction history
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 2, search, status, direction } = req.query
    const userId = req.userId

    // Build query
    let query = {
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status
    }

    // Filter by direction (sent/received) - need to filter after transform for accurate count
    // Get total count
    const allTransactions = await Transaction.find(query)
      .populate('senderId', 'name accountNumber')
      .populate('receiverId', 'name accountNumber')
      .sort({ createdAt: -1 })

    // Transform transactions to add direction (sent/received)
    let transformedTransactions = allTransactions.map((tx) => {
      const isSent = tx.senderId._id.toString() === userId.toString()
      return {
        _id: tx._id,
        reference: tx.reference,
        amount: tx.amount,
        currency: tx.currency,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        direction: isSent ? 'sent' : 'received',
        counterparty: isSent
          ? { name: tx.receiverId.name, accountNumber: tx.receiverId.accountNumber }
          : { name: tx.senderId.name, accountNumber: tx.senderId.accountNumber },
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        _isSent: isSent, // Keep for filtering
      }
    })

    // Filter by direction if provided
    if (direction && direction !== 'all') {
      transformedTransactions = transformedTransactions.filter(tx => tx.direction === direction)
    }

    // Get total after direction filtering
    const totalAfterDirection = transformedTransactions.length

    // Backend search - search in counterparty name or account number
    if (search?.trim()) {
      const searchLower = search.trim().toLowerCase()
      transformedTransactions = transformedTransactions.filter(
        (tx) =>
          tx.counterparty?.name?.toLowerCase().includes(searchLower) ||
          tx.counterparty?.accountNumber?.includes(search)
      )
    }

    // Recalculate total after search filtering
    const totalAfterSearch = transformedTransactions.length

    // Apply pagination after all filtering
    const paginatedTransactions = transformedTransactions.slice(
      (page - 1) * limit,
      page * limit
    )

    // Remove internal _isSent field before sending to client
    const finalTransactions = paginatedTransactions.map(({ _isSent, ...tx }) => tx)

    return res.status(200).json({
      data: finalTransactions,
      pagination: {
        total: totalAfterSearch,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalAfterSearch / limit),
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get transactions', error: error.message })
  }
}

// Get single transaction by reference
export const getTransactionByReference = async (req, res) => {
  try {
    const { reference } = req.params

    const transaction = await Transaction.findOne({ reference })
      .populate('senderId', 'name accountNumber phone')
      .populate('receiverId', 'name accountNumber phone')

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // Check if user is involved in this transaction
    const userId = req.userId.toString()
    if (
      transaction.senderId._id.toString() !== userId &&
      transaction.receiverId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' })
    }

    const isSent = transaction.senderId._id.toString() === userId

    return res.status(200).json({
      data: {
        _id: transaction._id,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        direction: isSent ? 'sent' : 'received',
        counterparty: isSent
          ? { name: transaction.receiverId.name, accountNumber: transaction.receiverId.accountNumber }
          : { name: transaction.senderId.name, accountNumber: transaction.senderId.accountNumber },
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get transaction', error: error.message })
  }
}

// Get transaction statistics for the user
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.userId

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // This month's stats
    const thisMonthStats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          createdAt: { $gte: startOfMonth },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: { $cond: [{ $eq: ['$senderId', userId]}, '$amount', 0] }
          },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$receiverId', userId]}, '$amount', 0] }
          },
          count: { $sum: 1 },
        },
      },
    ])

    // Last month's stats
    const lastMonthStats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: { $cond: [{ $eq: ['$senderId', userId]}, '$amount', 0] }
          },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$receiverId', userId]}, '$amount', 0] }
          },
          count: { $sum: 1 },
        },
      },
    ])

    return res.status(200).json({
      data: {
        thisMonth: thisMonthStats[0] || { totalSent: 0, totalReceived: 0, count: 0 },
        lastMonth: lastMonthStats[0] || { totalSent: 0, totalReceived: 0, count: 0 },
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get transaction stats', error: error.message })
  }
}
