import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(mongoUri)
    console.log('DB Connected!')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw error
  }
}

export default connectDB

