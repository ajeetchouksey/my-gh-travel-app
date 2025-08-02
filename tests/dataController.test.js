const request = require('supertest')
const app = require('../src/server')
const DataModel = require('../src/models/dataModel')

const validApiKey = 'default-dev-key'

describe('Data Controller', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await DataModel.writeData([])
  })

  describe('GET /api/data', () => {
    test('should return empty array when no data exists', async () => {
      const response = await request(app)
        .get('/api/data')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
      expect(response.body.pagination).toHaveProperty('total', 0)
    })

    test('should return paginated data', async () => {
      // Create test data
      const testData = [
        { id: '1', type: 'test', name: 'Test 1', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', type: 'test', name: 'Test 2', createdAt: '2024-01-02T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .get('/api/data?page=1&limit=10')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.total).toBe(2)
    })

    test('should support filtering', async () => {
      const testData = [
        { id: '1', type: 'user', name: 'John', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', type: 'admin', name: 'Jane', createdAt: '2024-01-02T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .get('/api/data?filter=' + encodeURIComponent(JSON.stringify({ type: 'user' })))
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].type).toBe('user')
    })
  })

  describe('GET /api/data/:id', () => {
    test('should return specific data by ID', async () => {
      const testData = [
        { id: 'test-id-1', type: 'test', name: 'Test Item', createdAt: '2024-01-01T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .get('/api/data/test-id-1')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe('test-id-1')
      expect(response.body.data.name).toBe('Test Item')
    })

    test('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/data/non-existent-id')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Data not found')
    })
  })

  describe('POST /api/data', () => {
    test('should create new data', async () => {
      const newData = {
        type: 'test',
        name: 'New Test Item',
        description: 'Test description'
      }

      const response = await request(app)
        .post('/api/data')
        .set('api-key', validApiKey)
        .send(newData)
      
      expect(response.statusCode).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe(newData.name)
      expect(response.body.data).toHaveProperty('createdAt')
      expect(response.body.data).toHaveProperty('updatedAt')
    })

    test('should validate required fields', async () => {
      const invalidData = {
        name: 'Test without type'
      }

      const response = await request(app)
        .post('/api/data')
        .set('api-key', validApiKey)
        .send(invalidData)
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.message).toContain('type')
    })
  })

  describe('PUT /api/data/:id', () => {
    test('should update existing data', async () => {
      const testData = [
        { id: 'test-id-1', type: 'test', name: 'Original Name', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      }

      const response = await request(app)
        .put('/api/data/test-id-1')
        .set('api-key', validApiKey)
        .send(updateData)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Updated Name')
      expect(response.body.data.description).toBe('Updated description')
      expect(response.body.data).toHaveProperty('updatedAt')
    })

    test('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .put('/api/data/non-existent-id')
        .set('api-key', validApiKey)
        .send({ name: 'Updated Name' })
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/data/:id', () => {
    test('should delete existing data', async () => {
      const testData = [
        { id: 'test-id-1', type: 'test', name: 'To be deleted', createdAt: '2024-01-01T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .delete('/api/data/test-id-1')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('deleted successfully')
    })

    test('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .delete('/api/data/non-existent-id')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/search/data', () => {
    test('should search data by query', async () => {
      const testData = [
        { id: '1', type: 'user', name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', type: 'user', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02T00:00:00.000Z' }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .get('/api/search/data?q=john')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('John Doe')
    })

    test('should require search query', async () => {
      const response = await request(app)
        .get('/api/search/data')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Search query required')
    })
  })

  describe('GET /api/analytics/usage', () => {
    test('should return usage analytics', async () => {
      const testData = [
        { id: '1', type: 'user', createdAt: new Date().toISOString() },
        { id: '2', type: 'admin', createdAt: new Date().toISOString() }
      ]
      await DataModel.writeData(testData)

      const response = await request(app)
        .get('/api/analytics/usage')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.analytics).toHaveProperty('totalRecords', 2)
      expect(response.body.analytics).toHaveProperty('typeDistribution')
      expect(response.body.analytics).toHaveProperty('createdToday')
    })
  })
})