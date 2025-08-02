const request = require('supertest')
const app = require('../src/server')

describe('MCP Server', () => {
  describe('Health Endpoints', () => {
    test('GET / should return server info', async () => {
      const response = await request(app).get('/')
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('status', 'active')
      expect(response.body).toHaveProperty('endpoints')
    })

    test('GET /health should return health status', async () => {
      const response = await request(app).get('/health')
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })

    test('GET /health/detailed should return detailed health info', async () => {
      const response = await request(app).get('/health/detailed')
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('system')
      expect(response.body).toHaveProperty('checks')
      expect(Array.isArray(response.body.checks)).toBe(true)
    })

    test('GET /health/ready should return readiness status', async () => {
      const response = await request(app).get('/health/ready')
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('status', 'ready')
    })

    test('GET /health/live should return liveness status', async () => {
      const response = await request(app).get('/health/live')
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('status', 'alive')
    })
  })

  describe('Authentication', () => {
    test('API endpoints should require API key', async () => {
      const response = await request(app).get('/api/data')
      
      expect(response.statusCode).toBe(401)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
      expect(response.body.message).toContain('API key is required')
    })

    test('Invalid API key should be rejected', async () => {
      const response = await request(app)
        .get('/api/data')
        .set('api-key', 'invalid-key')
      
      expect(response.statusCode).toBe(403)
      expect(response.body).toHaveProperty('error', 'Forbidden')
    })

    test('Valid API key should be accepted', async () => {
      const response = await request(app)
        .get('/api/data')
        .set('api-key', 'default-dev-key')
      
      expect(response.statusCode).toBe(200)
    })
  })

  describe('404 Handling', () => {
    test('Non-existent routes should return 404', async () => {
      const response = await request(app).get('/non-existent-route')
      
      expect(response.statusCode).toBe(404)
      expect(response.body).toHaveProperty('error', 'Route not found')
    })
  })
})