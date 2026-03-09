import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { getUniqueAccountNumber } from '../utils/accountNumber.js'

const SALT_ROUNDS = 12

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const normalizedEmail = email.toLowerCase()

    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const accountNumber = await getUniqueAccountNumber((value) => User.exists({ accountNumber: value }))

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      accountNumber,
    })

    return res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message })
  }
}

export const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: '7d' })

    return res.status(200).json({
      message: 'Signed in successfully',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sign in', error: error.message })
  }
}
