// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    apiKey: req.apiKey?.key
  })

  // Default error response
  let statusCode = 500
  let message = 'Internal Server Error'
  let details = null

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    details = err.message
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  } else if (err.code === 11000) { // MongoDB duplicate key error
    statusCode = 409
    message = 'Duplicate entry'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (err.status) {
    statusCode = err.status
    message = err.message
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  })
}

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  errorHandler,
  notFoundHandler
}