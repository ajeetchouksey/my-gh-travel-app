const fs = require('fs-extra')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

class TripModel {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data')
    this.tripsFile = path.join(this.dataDir, 'trips.json')
    this.itinerariesFile = path.join(this.dataDir, 'itineraries.json')
    this.init()
  }

  async init() {
    await fs.ensureDir(this.dataDir)
    if (!await fs.pathExists(this.tripsFile)) {
      await fs.writeJson(this.tripsFile, [])
    }
    if (!await fs.pathExists(this.itinerariesFile)) {
      await fs.writeJson(this.itinerariesFile, [])
    }
  }

  async readTrips() {
    try {
      return await fs.readJson(this.tripsFile)
    } catch (error) {
      console.error('Error reading trips file:', error)
      return []
    }
  }

  async writeTrips(trips) {
    try {
      await fs.writeJson(this.tripsFile, trips, { spaces: 2 })
    } catch (error) {
      console.error('Error writing trips file:', error)
      throw error
    }
  }

  async readItineraries() {
    try {
      return await fs.readJson(this.itinerariesFile)
    } catch (error) {
      console.error('Error reading itineraries file:', error)
      return []
    }
  }

  async writeItineraries(itineraries) {
    try {
      await fs.writeJson(this.itinerariesFile, itineraries, { spaces: 2 })
    } catch (error) {
      console.error('Error writing itineraries file:', error)
      throw error
    }
  }

  // Trip methods
  async findAll(options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = options
    const trips = await this.readTrips()
    
    let filteredTrips = trips

    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filteredTrips = filteredTrips.filter(trip => {
          if (key === 'budget') {
            return trip.budget && trip.budget.toLowerCase() === filters[key].toLowerCase()
          }
          return trip[key] && trip[key].toString().toLowerCase().includes(filters[key].toLowerCase())
        })
      }
    })

    // Sort trips
    filteredTrips.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTrips = filteredTrips.slice(startIndex, endIndex)

    return {
      data: paginatedTrips,
      page,
      limit,
      total: filteredTrips.length
    }
  }

  async findById(id) {
    const trips = await this.readTrips()
    return trips.find(trip => trip.id === id)
  }

  async create(tripData) {
    const trips = await this.readTrips()
    trips.push(tripData)
    await this.writeTrips(trips)
    return tripData
  }

  async update(id, updateData) {
    const trips = await this.readTrips()
    const index = trips.findIndex(trip => trip.id === id)
    
    if (index === -1) {
      return null
    }

    trips[index] = { ...trips[index], ...updateData }
    await this.writeTrips(trips)
    return trips[index]
  }

  async delete(id) {
    const trips = await this.readTrips()
    const index = trips.findIndex(trip => trip.id === id)
    
    if (index === -1) {
      return null
    }

    const deletedTrip = trips.splice(index, 1)[0]
    await this.writeTrips(trips)
    
    // Also delete related itineraries
    const itineraries = await this.readItineraries()
    const filteredItineraries = itineraries.filter(itinerary => itinerary.tripId !== id)
    await this.writeItineraries(filteredItineraries)
    
    return deletedTrip
  }

  // Itinerary methods
  async findItineraries(options = {}) {
    const { tripId, page = 1, limit = 10 } = options
    const itineraries = await this.readItineraries()
    
    let filteredItineraries = itineraries
    if (tripId) {
      filteredItineraries = itineraries.filter(itinerary => itinerary.tripId === tripId)
    }

    // Sort by day
    filteredItineraries.sort((a, b) => (a.day || 0) - (b.day || 0))

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItineraries = filteredItineraries.slice(startIndex, endIndex)

    return {
      data: paginatedItineraries,
      page,
      limit,
      total: filteredItineraries.length
    }
  }

  async findItineraryById(id) {
    const itineraries = await this.readItineraries()
    return itineraries.find(itinerary => itinerary.id === id)
  }

  async createItinerary(itineraryData) {
    const itineraries = await this.readItineraries()
    itineraries.push(itineraryData)
    await this.writeItineraries(itineraries)
    return itineraryData
  }

  async updateItinerary(id, updateData) {
    const itineraries = await this.readItineraries()
    const index = itineraries.findIndex(itinerary => itinerary.id === id)
    
    if (index === -1) {
      return null
    }

    itineraries[index] = { ...itineraries[index], ...updateData }
    await this.writeItineraries(itineraries)
    return itineraries[index]
  }

  async deleteItinerary(id) {
    const itineraries = await this.readItineraries()
    const index = itineraries.findIndex(itinerary => itinerary.id === id)
    
    if (index === -1) {
      return null
    }

    const deletedItinerary = itineraries.splice(index, 1)[0]
    await this.writeItineraries(itineraries)
    return deletedItinerary
  }

  // Search functionality
  async search(options = {}) {
    const { query, destination, budget, duration, page = 1, limit = 10 } = options
    const trips = await this.readTrips()
    
    let filteredTrips = trips

    // Text search
    if (query) {
      filteredTrips = filteredTrips.filter(trip => {
        const searchText = JSON.stringify(trip).toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
    }

    // Specific filters
    if (destination) {
      filteredTrips = filteredTrips.filter(trip =>
        trip.destination && trip.destination.toLowerCase().includes(destination.toLowerCase())
      )
    }

    if (budget) {
      filteredTrips = filteredTrips.filter(trip =>
        trip.budget && trip.budget.toLowerCase() === budget.toLowerCase()
      )
    }

    if (duration) {
      const durationNum = parseInt(duration)
      filteredTrips = filteredTrips.filter(trip =>
        trip.duration && Math.abs(trip.duration - durationNum) <= 2 // Allow ±2 days tolerance
      )
    }

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTrips = filteredTrips.slice(startIndex, endIndex)

    return {
      data: paginatedTrips,
      page,
      limit,
      total: filteredTrips.length
    }
  }

  // Bulk operations
  async bulkCreate(tripsData) {
    const trips = await this.readTrips()
    const newTrips = tripsData.map(tripData => ({
      id: uuidv4(),
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: tripData.status || 'draft'
    }))

    trips.push(...newTrips)
    await this.writeTrips(trips)
    return newTrips
  }

  async bulkUpdate(updates) {
    const trips = await this.readTrips()
    const updatedTrips = []

    updates.forEach(update => {
      const index = trips.findIndex(trip => trip.id === update.id)
      if (index !== -1) {
        trips[index] = {
          ...trips[index],
          ...update,
          updatedAt: new Date().toISOString()
        }
        updatedTrips.push(trips[index])
      }
    })

    await this.writeTrips(trips)
    return updatedTrips
  }

  // Analytics
  async getAnalytics() {
    const trips = await this.readTrips()
    const itineraries = await this.readItineraries()
    
    const analytics = {
      totalTrips: trips.length,
      totalItineraries: itineraries.length,
      statusDistribution: {},
      budgetDistribution: {},
      destinationPopularity: {},
      averageDuration: 0,
      createdToday: 0,
      createdThisWeek: 0,
      createdThisMonth: 0
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    let totalDuration = 0

    trips.forEach(trip => {
      // Status distribution
      const status = trip.status || 'unknown'
      analytics.statusDistribution[status] = (analytics.statusDistribution[status] || 0) + 1

      // Budget distribution
      const budget = trip.budget || 'unknown'
      analytics.budgetDistribution[budget] = (analytics.budgetDistribution[budget] || 0) + 1

      // Destination popularity
      const destination = trip.destination || 'unknown'
      analytics.destinationPopularity[destination] = (analytics.destinationPopularity[destination] || 0) + 1

      // Duration calculation
      if (trip.duration) {
        totalDuration += trip.duration
      }

      // Time-based analytics
      if (trip.createdAt) {
        const createdDate = new Date(trip.createdAt)
        
        if (createdDate >= today) {
          analytics.createdToday++
        }
        if (createdDate >= weekAgo) {
          analytics.createdThisWeek++
        }
        if (createdDate >= monthAgo) {
          analytics.createdThisMonth++
        }
      }
    })

    analytics.averageDuration = trips.length > 0 ? Math.round(totalDuration / trips.length) : 0

    return analytics
  }
}

// Export singleton instance
module.exports = new TripModel()