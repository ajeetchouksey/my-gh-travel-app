const request = require('supertest')
const app = require('../src/server')
const TripModel = require('../src/models/tripModel')

const validApiKey = 'default-dev-key'

describe('Trip Controller', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await TripModel.writeTrips([])
    await TripModel.writeItineraries([])
  })

  describe('GET /api/trips', () => {
    test('should return empty array when no trips exist', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
      expect(response.body.pagination).toHaveProperty('total', 0)
    })

    test('should return trips with pagination', async () => {
      const testTrips = [
        {
          id: '1',
          title: 'Trip to Paris',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          title: 'Trip to Tokyo',
          destination: 'Tokyo',
          startDate: '2024-07-01',
          endDate: '2024-07-10',
          duration: 9,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ]
      await TripModel.writeTrips(testTrips)

      const response = await request(app)
        .get('/api/trips?page=1&limit=10')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.total).toBe(2)
    })
  })

  describe('POST /api/trips', () => {
    test('should create new trip', async () => {
      const newTrip = {
        title: 'Amazing Trip to Bali',
        destination: 'Bali',
        startDate: '2024-08-01',
        endDate: '2024-08-08',
        budget: 'mid-range',
        description: 'A wonderful trip to Bali'
      }

      const response = await request(app)
        .post('/api/trips')
        .set('api-key', validApiKey)
        .send(newTrip)
      
      expect(response.statusCode).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.title).toBe(newTrip.title)
      expect(response.body.data.destination).toBe(newTrip.destination)
      expect(response.body.data).toHaveProperty('duration', 7)
      expect(response.body.data).toHaveProperty('status', 'draft')
      expect(response.body.data).toHaveProperty('createdAt')
    })

    test('should validate required fields', async () => {
      const invalidTrip = {
        title: 'Trip without required fields'
      }

      const response = await request(app)
        .post('/api/trips')
        .set('api-key', validApiKey)
        .send(invalidTrip)
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.message).toContain('destination')
    })

    test('should validate date order', async () => {
      const invalidTrip = {
        title: 'Invalid Trip',
        destination: 'Paris',
        startDate: '2024-08-08',
        endDate: '2024-08-01' // End date before start date
      }

      const response = await request(app)
        .post('/api/trips')
        .set('api-key', validApiKey)
        .send(invalidTrip)
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Start date must be before end date')
    })
  })

  describe('GET /api/trips/:id', () => {
    test('should return specific trip by ID', async () => {
      const testTrips = [
        {
          id: 'trip-123',
          title: 'Test Trip',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      await TripModel.writeTrips(testTrips)

      const response = await request(app)
        .get('/api/trips/trip-123')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe('trip-123')
      expect(response.body.data.title).toBe('Test Trip')
    })

    test('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .get('/api/trips/non-existent-id')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Trip not found')
    })
  })

  describe('PUT /api/trips/:id', () => {
    test('should update existing trip', async () => {
      const testTrips = [
        {
          id: 'trip-123',
          title: 'Original Title',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      await TripModel.writeTrips(testTrips)

      const updateData = {
        title: 'Updated Title',
        budget: 'luxury'
      }

      const response = await request(app)
        .put('/api/trips/trip-123')
        .set('api-key', validApiKey)
        .send(updateData)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Updated Title')
      expect(response.body.data.budget).toBe('luxury')
      expect(response.body.data).toHaveProperty('updatedAt')
    })
  })

  describe('DELETE /api/trips/:id', () => {
    test('should delete existing trip', async () => {
      const testTrips = [
        {
          id: 'trip-123',
          title: 'Trip to Delete',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      await TripModel.writeTrips(testTrips)

      const response = await request(app)
        .delete('/api/trips/trip-123')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('deleted successfully')
    })
  })

  describe('Itinerary Management', () => {
    describe('POST /api/itineraries', () => {
      test('should create new itinerary', async () => {
        const newItinerary = {
          tripId: 'trip-123',
          day: 1,
          activities: [
            {
              time: '09:00',
              activity: 'Visit Eiffel Tower',
              location: 'Eiffel Tower, Paris',
              cost: 25
            }
          ]
        }

        const response = await request(app)
          .post('/api/itineraries')
          .set('api-key', validApiKey)
          .send(newItinerary)
        
        expect(response.statusCode).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data.tripId).toBe(newItinerary.tripId)
        expect(response.body.data.day).toBe(1)
        expect(response.body.data.activities).toHaveLength(1)
      })

      test('should validate required itinerary fields', async () => {
        const invalidItinerary = {
          day: 1
          // Missing tripId and activities
        }

        const response = await request(app)
          .post('/api/itineraries')
          .set('api-key', validApiKey)
          .send(invalidItinerary)
        
        expect(response.statusCode).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBe('Validation failed')
      })
    })

    describe('GET /api/itineraries', () => {
      test('should return itineraries with trip filter', async () => {
        const testItineraries = [
          {
            id: 'itinerary-1',
            tripId: 'trip-123',
            day: 1,
            activities: [{ activity: 'Test Activity' }],
            createdAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: 'itinerary-2',
            tripId: 'trip-456',
            day: 1,
            activities: [{ activity: 'Another Activity' }],
            createdAt: '2024-01-02T00:00:00.000Z'
          }
        ]
        await TripModel.writeItineraries(testItineraries)

        const response = await request(app)
          .get('/api/itineraries?tripId=trip-123')
          .set('api-key', validApiKey)
        
        expect(response.statusCode).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(1)
        expect(response.body.data[0].tripId).toBe('trip-123')
      })
    })
  })

  describe('Search Functionality', () => {
    test('should search trips by destination', async () => {
      const testTrips = [
        {
          id: '1',
          title: 'Paris Adventure',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          title: 'Tokyo Explorer',
          destination: 'Tokyo',
          startDate: '2024-07-01',
          endDate: '2024-07-10',
          duration: 9,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ]
      await TripModel.writeTrips(testTrips)

      const response = await request(app)
        .get('/api/search/trips?destination=paris')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].destination).toBe('Paris')
    })
  })

  describe('Analytics', () => {
    test('should return trip analytics', async () => {
      const testTrips = [
        {
          id: '1',
          title: 'Trip 1',
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          duration: 6,
          budget: 'mid-range',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Trip 2',
          destination: 'Tokyo',
          startDate: '2024-07-01',
          endDate: '2024-07-10',
          duration: 9,
          budget: 'luxury',
          status: 'draft',
          createdAt: new Date().toISOString()
        }
      ]
      await TripModel.writeTrips(testTrips)

      const response = await request(app)
        .get('/api/analytics/trips')
        .set('api-key', validApiKey)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.analytics).toHaveProperty('totalTrips', 2)
      expect(response.body.analytics).toHaveProperty('statusDistribution')
      expect(response.body.analytics).toHaveProperty('budgetDistribution')
      expect(response.body.analytics).toHaveProperty('destinationPopularity')
      expect(response.body.analytics).toHaveProperty('averageDuration')
    })
  })
})