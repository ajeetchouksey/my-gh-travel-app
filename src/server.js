require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const { authMiddleware } = require('./middleware/auth')
const dataRoutes = require('./routes/data')
const healthRoutes = require('./routes/health')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan('combined'))

// Health check routes (no auth required)
app.use('/health', healthRoutes)

// API routes with authentication
app.use('/api', authMiddleware, dataRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MCP (Model Context Protocol) Server for Travel App',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      data: '/api/data',
      trips: '/api/trips',
      itineraries: '/api/itineraries'
    },
    documentation: '/docs'
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MCP Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔐 Security: ${process.env.HTTPS_ENABLED === 'true' ? 'HTTPS' : 'HTTP'}`)
  })
}

module.exports = app