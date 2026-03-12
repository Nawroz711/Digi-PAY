import { Router } from 'express'
import { getStripePublishableKey, createPaymentIntent, confirmPayment } from '../controllers/payment.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/stripe-key', authMiddleware, getStripePublishableKey)
router.post('/create-payment-intent', authMiddleware, createPaymentIntent)
router.post('/confirm-payment', authMiddleware, confirmPayment)

export default router
