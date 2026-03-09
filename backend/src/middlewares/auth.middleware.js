import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' })
    }

    const decoded = jwt.verify(token, jwtSecret)
    req.userId = decoded.userId
    return next()
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default authMiddleware
