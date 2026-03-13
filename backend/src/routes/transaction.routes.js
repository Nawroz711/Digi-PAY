import { Router } from 'express'
import { sendMoney, getTransactions, getTransactionByReference, getTransactionStats } from '../controllers/transaction.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

// Send money
router.post('/send', authMiddleware, sendMoney)

// Get transaction history
router.get('/', authMiddleware, getTransactions)

// Get transaction by reference
router.get('/reference/:reference', authMiddleware, getTransactionByReference)

// Get transaction statistics
router.get('/stats', authMiddleware, getTransactionStats)

export default router
