const os = require('os')
const fs = require('fs-extra')
const path = require('path')

const checkSystemHealth = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        system: {
          total: os.totalmem(),
          free: os.freemem()
        }
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      },
      platform: os.platform(),
      nodeVersion: process.version
    },
    checks: []
  }

  // Check disk space
  try {
    const dataDir = path.join(__dirname, '../../data')
    await fs.ensureDir(dataDir)
    const stats = await fs.stat(dataDir)
    health.checks.push({
      name: 'disk_space',
      status: 'pass',
      details: 'Data directory accessible'
    })
  } catch (error) {
    health.checks.push({
      name: 'disk_space',
      status: 'fail',
      details: error.message
    })
    health.status = 'unhealthy'
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const memoryThreshold = 100 * 1024 * 1024 // 100MB
  if (memoryUsage.heapUsed > memoryThreshold) {
    health.checks.push({
      name: 'memory_usage',
      status: 'warn',
      details: `High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    })
  } else {
    health.checks.push({
      name: 'memory_usage',
      status: 'pass',
      details: `Memory usage normal: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    })
  }

  // Check environment variables
  const requiredEnvVars = ['NODE_ENV']
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingEnvVars.length > 0) {
    health.checks.push({
      name: 'environment',
      status: 'warn',
      details: `Missing environment variables: ${missingEnvVars.join(', ')}`
    })
  } else {
    health.checks.push({
      name: 'environment',
      status: 'pass',
      details: 'All required environment variables present'
    })
  }

  return health
}

module.exports = {
  checkSystemHealth
}