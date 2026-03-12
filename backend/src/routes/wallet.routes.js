import { Router } from 'express'
import { getMyWallet, addFunds, withdrawFunds } from '../controllers/wallet.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authMiddleware, getMyWallet)
router.post('/add-funds', authMiddleware, addFunds)
router.post('/withdraw', authMiddleware, withdrawFunds)

export default router
