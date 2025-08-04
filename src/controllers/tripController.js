const { v4: uuidv4 } = require('uuid')
const TripModel = require('../models/tripModel')

// Get all trips
const getAllTrips = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      destination,
      budget,
      duration
    } = req.query

    const filters = {}
    if (destination) filters.destination = destination
    if (budget) filters.budget = budget
    if (duration) filters.duration = duration

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      filters
    }

    const result = await TripModel.findAll(options)
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trips',
      message: error.message
    })
  }
}

// Get trip by ID
const getTripById = async (req, res) => {
  try {
    const { id } = req.params
    const trip = await TripModel.findById(id)
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: `No trip found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data: trip
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trip',
      message: error.message
    })
  }
}

// Create new trip
const createTrip = async (req, res) => {
  try {
    const tripData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    }

    // Validate required fields
    const requiredFields = ['title', 'destination', 'startDate', 'endDate']
    const missingFields = requiredFields.filter(field => !tripData[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    // Validate dates
    const startDate = new Date(tripData.startDate)
    const endDate = new Date(tripData.endDate)
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dates',
        message: 'Start date must be before end date'
      })
    }

    // Calculate duration
    tripData.duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    const result = await TripModel.create(tripData)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Trip created successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create trip',
      message: error.message
    })
  }
}

// Update trip
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    // Recalculate duration if dates are updated
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate)
      const endDate = new Date(updateData.endDate)
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          error: 'Invalid dates',
          message: 'Start date must be before end date'
        })
      }
      
      updateData.duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    }

    const result = await TripModel.update(id, updateData)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: `No trip found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data: result,
      message: 'Trip updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update trip',
      message: error.message
    })
  }
}

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params
    const result = await TripModel.delete(id)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: `No trip found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip',
      message: error.message
    })
  }
}

// Itinerary methods
const getAllItineraries = async (req, res) => {
  try {
    const { tripId, page = 1, limit = 10 } = req.query
    const result = await TripModel.findItineraries({ tripId, page: parseInt(page), limit: parseInt(limit) })
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve itineraries',
      message: error.message
    })
  }
}

const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params
    const itinerary = await TripModel.findItineraryById(id)
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found',
        message: `No itinerary found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data: itinerary
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve itinerary',
      message: error.message
    })
  }
}

const createItinerary = async (req, res) => {
  try {
    const itineraryData = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const requiredFields = ['tripId', 'day', 'activities']
    const missingFields = requiredFields.filter(field => !itineraryData[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const result = await TripModel.createItinerary(itineraryData)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Itinerary created successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create itinerary',
      message: error.message
    })
  }
}

const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    const result = await TripModel.updateItinerary(id, updateData)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found',
        message: `No itinerary found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data: result,
      message: 'Itinerary updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update itinerary',
      message: error.message
    })
  }
}

const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params
    const result = await TripModel.deleteItinerary(id)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found',
        message: `No itinerary found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete itinerary',
      message: error.message
    })
  }
}

// Search trips
const searchTrips = async (req, res) => {
  try {
    const { q, destination, budget, duration, page = 1, limit = 10 } = req.query
    
    const searchOptions = {
      query: q,
      destination,
      budget,
      duration,
      page: parseInt(page),
      limit: parseInt(limit)
    }

    const result = await TripModel.search(searchOptions)

    res.json({
      success: true,
      data: result.data,
      searchOptions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    })
  }
}

// Bulk operations
const bulkCreateTrips = async (req, res) => {
  try {
    const { trips } = req.body
    
    if (!Array.isArray(trips) || trips.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Expected array of trips'
      })
    }

    const results = await TripModel.bulkCreate(trips)

    res.status(201).json({
      success: true,
      data: results,
      message: `${results.length} trips created successfully`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk create failed',
      message: error.message
    })
  }
}

const bulkUpdateTrips = async (req, res) => {
  try {
    const { updates } = req.body
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Expected array of trip updates'
      })
    }

    const results = await TripModel.bulkUpdate(updates)

    res.json({
      success: true,
      data: results,
      message: `${results.length} trips updated successfully`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk update failed',
      message: error.message
    })
  }
}

// Analytics
const getTripAnalytics = async (req, res) => {
  try {
    const analytics = await TripModel.getAnalytics()
    
    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      message: error.message
    })
  }
}

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getAllItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  searchTrips,
  bulkCreateTrips,
  bulkUpdateTrips,
  getTripAnalytics
}