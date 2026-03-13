import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Wallet from '../models/wallet.model.js'
import { getUniqueAccountNumber } from '../utils/accountNumber.js'
import { generateOTP, sendOTPViaTwilio, hashOTP, compareOTP } from '../utils/otp.js'

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
    const normalizedPhone = phone.trim()

    // Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail })
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: normalizedPhone })
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const accountNumber = await getUniqueAccountNumber((value) => User.exists({ accountNumber: value }))

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      accountNumber,
    })

    // Create wallet for the user with default balance of 0
    await Wallet.create({
      userId: user._id,
      balance: 0,
      currency: 'USD',
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

export const sendVerificationOTP = async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Phone number is required' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const normalizedPhone = phone.trim()
    if (normalizedPhone.length < 7 || normalizedPhone.length > 20) {
      return res.status(400).json({ message: 'Phone number length is invalid' })
    }

    // Generate OTP
    const otp = generateOTP()
    const hashedOTP = await hashOTP(otp)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with pending phone and OTP
    user.pendingPhone = normalizedPhone
    user.phoneOtp = hashedOTP
    user.phoneOtpExpires = otpExpires
    await user.save()

    // Send OTP via Twilio
    await sendOTPViaTwilio(normalizedPhone, otp)

    return res.status(200).json({
      message: 'Verification code sent successfully',
      data: {
        pendingPhone: normalizedPhone,
        otpExpires: otpExpires,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send verification code', error: error.message })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body

    if (!otp?.trim()) {
      return res.status(400).json({ message: 'Verification code is required' })
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({ message: 'Verification code must be 6 digits' })
    }

    const user = await User.findById(req.userId).select('+phoneOtp')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if there's a pending phone number
    if (!user.pendingPhone) {
      return res.status(400).json({ message: 'No pending verification. Please request a new code.' })
    }

    // Check if OTP has expired
    if (!user.phoneOtpExpires || new Date() > user.phoneOtpExpires) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' })
    }

    // Verify OTP
    const isValid = await compareOTP(otp.trim(), user.phoneOtp)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Update user phone and verified status
    user.phone = user.pendingPhone
    user.verified = true
    user.pendingPhone = ''
    user.phoneOtp = undefined
    user.phoneOtpExpires = undefined
    await user.save()

    const safeUser = await User.findById(user._id).select('-password')
    return res.status(200).json({
      message: 'Phone verified successfully',
      data: safeUser,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify code', error: error.message })
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
