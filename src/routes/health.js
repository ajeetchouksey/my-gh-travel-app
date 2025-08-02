const express = require('express')
const router = express.Router()
const { checkSystemHealth } = require('../utils/healthCheck')

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = await checkSystemHealth()
    res.json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', (req, res) => {
  // Check if server is ready to accept requests
  const isReady = true // Add your readiness logic here
  
  if (isReady) {
    res.json({ status: 'ready' })
  } else {
    res.status(503).json({ status: 'not ready' })
  }
})

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req, res) => {
  res.json({ status: 'alive' })
})

module.exports = router