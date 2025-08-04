const crypto = require('crypto')

// API key validation middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['api-key'] || req.headers['x-api-key']
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide it in the "api-key" or "x-api-key" header.'
    })
  }

  // Get valid API keys from environment variables
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : ['default-dev-key']
  
  // Check if provided API key is valid
  const isValidKey = validApiKeys.some(validKey => {
    try {
      // Ensure both strings have the same length for timing safety
      if (apiKey.length !== validKey.length) {
        return false
      }
      return crypto.timingSafeEqual(
        Buffer.from(apiKey, 'utf8'),
        Buffer.from(validKey, 'utf8')
      )
    } catch (error) {
      return false
    }
  })

  if (!isValidKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key provided.'
    })
  }

  // Add API key info to request for logging/tracking
  req.apiKey = {
    key: apiKey.substring(0, 8) + '...',
    timestamp: Date.now()
  }

  next()
}

// Optional: JWT token validation (for more advanced authentication)
const jwtMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // Bearer token
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'JWT token is required'
    })
  }

  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    })
  }
}

// Rate limiting per API key
const createApiKeyRateLimit = (windowMs = 15 * 60 * 1000, max = 50) => {
  const requests = new Map()
  
  return (req, res, next) => {
    const apiKey = req.headers['api-key'] || req.headers['x-api-key']
    const now = Date.now()
    const windowStart = now - windowMs

    if (!requests.has(apiKey)) {
      requests.set(apiKey, [])
    }

    const keyRequests = requests.get(apiKey)
    
    // Remove old requests outside the window
    const validRequests = keyRequests.filter(timestamp => timestamp > windowStart)
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${max} requests per ${windowMs / 1000} seconds`,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      })
    }

    validRequests.push(now)
    requests.set(apiKey, validRequests)
    
    next()
  }
}

module.exports = {
  authMiddleware,
  jwtMiddleware,
  createApiKeyRateLimit
}