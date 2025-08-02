const https = require('https')
const fs = require('fs')
const path = require('path')

const createHttpsServer = (app) => {
  if (process.env.HTTPS_ENABLED !== 'true') {
    console.log('HTTPS is disabled. Use HTTPS_ENABLED=true to enable.')
    return null
  }

  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../../certs/key.pem')
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../../certs/cert.pem')

  try {
    // Check if SSL certificates exist
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('SSL certificates not found. Please generate certificates or disable HTTPS.')
      console.log(`Looking for:`)
      console.log(`  Key: ${keyPath}`)
      console.log(`  Certificate: ${certPath}`)
      console.log(`\nTo generate self-signed certificates for development:`)
      console.log(`mkdir -p certs`)
      console.log(`openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes`)
      return null
    }

    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }

    const httpsServer = https.createServer(options, app)
    
    console.log('🔒 HTTPS server configured successfully')
    return httpsServer
  } catch (error) {
    console.error('Failed to create HTTPS server:', error.message)
    return null
  }
}

const generateSelfSignedCerts = () => {
  const { execSync } = require('child_process')
  const certDir = path.join(__dirname, '../../certs')
  
  try {
    // Create certs directory
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true })
    }

    // Generate self-signed certificate
    const command = `openssl req -x509 -newkey rsa:4096 -keyout ${certDir}/key.pem -out ${certDir}/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`
    
    execSync(command, { stdio: 'inherit' })
    console.log('✅ Self-signed certificates generated successfully')
    
    return true
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error.message)
    console.log('Please install OpenSSL or generate certificates manually')
    return false
  }
}

const securityHeaders = (req, res, next) => {
  // Security headers for HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP header
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'"
  )
  
  next()
}

const redirectToHttps = (req, res, next) => {
  if (process.env.HTTPS_ENABLED === 'true' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`)
  }
  next()
}

module.exports = {
  createHttpsServer,
  generateSelfSignedCerts,
  securityHeaders,
  redirectToHttps
}