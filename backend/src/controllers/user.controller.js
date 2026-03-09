import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { getUniqueAccountNumber } from '../utils/accountNumber.js'

const SALT_ROUNDS = 12

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    if (phone.trim().length < 7 || phone.trim().length > 20) {
      return res.status(400).json({ message: 'Phone number length is invalid' })
    }

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
      phone: phone.trim(),
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

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

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
        phone: user.phone,
        accountNumber: user.accountNumber,
        verified: user.verified,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sign in', error: error.message })
  }
}

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ data: user })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load profile', error: error.message })
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (typeof name === 'string') {
      const trimmedName = name.trim()
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({ message: 'Name must be between 2 and 50 characters' })
      }
      user.name = trimmedName
    }

    if (typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ message: 'Phone is required' })
    }

    const trimmedPhone = phone.trim()
    if (trimmedPhone.length < 7 || trimmedPhone.length > 20) {
      return res.status(400).json({ message: 'Phone number length is invalid' })
    }
    user.phone = trimmedPhone

    await user.save()
    const safeUser = await User.findById(user._id).select('-password')

    return res.status(200).json({
      message: 'Profile updated successfully',
      data: safeUser,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message })
  }
}

export const verifyMyPhone = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Phone is required for verification' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const normalizedPhone = phone.trim()
    if (normalizedPhone.length < 7 || normalizedPhone.length > 20) {
      return res.status(400).json({ message: 'Phone number length is invalid' })
    }

    user.phone = normalizedPhone
    user.verified = true
    await user.save()

    const safeUser = await User.findById(user._id).select('-password')
    return res.status(200).json({
      message: 'Phone verified successfully',
      data: safeUser,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify phone', error: error.message })
  }
}

export const deleteMyAccount = async (req, res) => {
  try {
    const { confirmName } = req.body
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!confirmName?.trim()) {
      return res.status(400).json({ message: 'Please type your name to confirm deletion' })
    }

    if (confirmName.trim() !== user.name) {
      return res.status(400).json({ message: 'Confirmation name does not match your profile name' })
    }

    await User.findByIdAndDelete(req.userId)
    return res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete account', error: error.message })
  }
}
