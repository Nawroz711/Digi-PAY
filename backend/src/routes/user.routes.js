import { Router } from 'express'
import { createUser, signInUser } from '../controllers/user.controller.js'
import { createUserValidation, signInValidation } from '../middlewares/user.validation.js'
import { authLimiter } from '../middlewares/rateLimiter.js'

const router = Router()

router.post('/signup', authLimiter, createUserValidation, createUser)
router.post('/signin', authLimiter, signInValidation, signInUser)

export default router
