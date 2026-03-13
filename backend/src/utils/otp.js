import twilio from 'twilio'

const SALT_ROUNDS = 12

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Initialize Twilio client
 * @returns {twilio.Twilio} Twilio client
 */
const getTwilioClient = () => {
  const accountSid = process.env.ACCOUNT_SID
  const authToken = process.env.AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured')
  }

  return twilio(accountSid, authToken)
}

/**
 * Send OTP via Twilio SMS
 * @param {string} phoneNumber - Phone number to send OTP to
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<object>} Twilio message response
 */
export const sendOTPViaTwilio = async (phoneNumber, otp) => {
  const client = getTwilioClient()
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!fromNumber) {
    throw new Error('Twilio phone number is not configured')
  }

  // Format phone number to ensure it has country code
  const formattedPhone = formatPhoneNumber(phoneNumber)

  const message = await client.messages.create({
    body: `Your Digi-PAY verification code is: ${otp}. This code will expire in 10 minutes.`,
    from: fromNumber,
    to: formattedPhone,
  })

  return message
}

/**
 * Send custom SMS via Twilio
 * @param {string} phoneNumber - Phone number to send SMS to
 * @param {string} message - Custom message body
 * @returns {Promise<object>} Twilio message response
 */
export const sendSMS = async (phoneNumber, message) => {
  const client = getTwilioClient()
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!fromNumber) {
    throw new Error('Twilio phone number is not configured')
  }

  // Format phone number to ensure it has country code
  const formattedPhone = formatPhoneNumber(phoneNumber)

  const result = await client.messages.create({
    body: message,
    from: fromNumber,
    to: formattedPhone,
  })

  return result
}

/**
 * Format phone number to ensure it has country code
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove any whitespace or special characters
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '')

  // If it doesn't start with +, add +1 (assuming US) or user needs to provide country code
  // For international numbers, user should provide country code with +
  if (!cleaned.startsWith('+')) {
    // Check if it starts with country code (1-3 digits)
    if (/^\d{1,3}/.test(cleaned)) {
      cleaned = '+' + cleaned
    } else {
      // Default to +93 (US) if no country code provided
      cleaned = '+93' + cleaned
    }
  }

  return cleaned
}

/**
 * Hash an OTP using bcrypt
 * @param {string} otp - OTP to hash
 * @returns {Promise<string>} Hashed OTP
 */
export const hashOTP = async (otp) => {
  const bcrypt = await import('bcrypt')
  return bcrypt.hash(otp, SALT_ROUNDS)
}

/**
 * Compare an OTP with a hashed OTP
 * @param {string} otp - OTP to compare
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>} True if OTP matches
 */
export const compareOTP = async (otp, hashedOTP) => {
  const bcrypt = await import('bcrypt')
  return bcrypt.compare(otp, hashedOTP)
}
