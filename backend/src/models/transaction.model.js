import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    type: {
      type: String,
      enum: ['send', 'receive', 'topup', 'withdraw'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    reference: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

// Generate unique reference before saving
transactionSchema.pre('save', async function () {
  if (!this.reference) {
    const prefix = 'TXN'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.reference = `${prefix}${timestamp}${random}`
  }
  
})

const Transaction = mongoose.model('Transaction', transactionSchema)

export default Transaction
