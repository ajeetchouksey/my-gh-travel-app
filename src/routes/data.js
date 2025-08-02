const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const dataController = require('../controllers/dataController')
const tripController = require('../controllers/tripController')
const { createApiKeyRateLimit } = require('../middleware/auth')

// Apply rate limiting specifically for data operations
const dataRateLimit = createApiKeyRateLimit(60 * 1000, 30) // 30 requests per minute per API key
router.use(dataRateLimit)

// Data endpoints
router.get('/data', dataController.getAllData)
router.get('/data/:id', dataController.getDataById)
router.post('/data', dataController.createData)
router.put('/data/:id', dataController.updateData)
router.delete('/data/:id', dataController.deleteData)

// Trip planning endpoints
router.get('/trips', tripController.getAllTrips)
router.get('/trips/:id', tripController.getTripById)
router.post('/trips', tripController.createTrip)
router.put('/trips/:id', tripController.updateTrip)
router.delete('/trips/:id', tripController.deleteTrip)

// Itinerary endpoints
router.get('/itineraries', tripController.getAllItineraries)
router.get('/itineraries/:id', tripController.getItineraryById)
router.post('/itineraries', tripController.createItinerary)
router.put('/itineraries/:id', tripController.updateItinerary)
router.delete('/itineraries/:id', tripController.deleteItinerary)

// Search endpoints
router.get('/search/trips', tripController.searchTrips)
router.get('/search/data', dataController.searchData)

// Bulk operations
router.post('/bulk/trips', tripController.bulkCreateTrips)
router.put('/bulk/trips', tripController.bulkUpdateTrips)

// Analytics endpoints
router.get('/analytics/trips', tripController.getTripAnalytics)
router.get('/analytics/usage', dataController.getUsageAnalytics)

module.exports = router