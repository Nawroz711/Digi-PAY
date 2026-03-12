import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import connectDB from './src/config/mongodb.js'
import { globalLimiter } from './src/middlewares/rateLimiter.js'
import userRoutes from './src/routes/user.routes.js'
import walletRoutes from './src/routes/wallet.routes.js'
import paymentRoutes from './src/routes/payment.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(globalLimiter)

app.get('/', (_req, res) => {
  res.send('Backend is running')
})

app.use('/api/users', userRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/payment', paymentRoutes)

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server failed to start:', error.message)
    process.exit(1)
  }
}

startServer()
