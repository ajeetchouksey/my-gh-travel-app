const { v4: uuidv4 } = require('uuid')
const DataModel = require('../models/dataModel')

// Get all data with pagination and filtering
const getAllData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filter
    } = req.query

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      filter
    }

    const result = await DataModel.findAll(options)
    
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
      error: 'Failed to retrieve data',
      message: error.message
    })
  }
}

// Get data by ID
const getDataById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await DataModel.findById(id)
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Data not found',
        message: `No data found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve data',
      message: error.message
    })
  }
}

// Create new data
const createData = async (req, res) => {
  try {
    const dataPayload = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      apiKey: req.apiKey.key
    }

    // Validate required fields
    const requiredFields = ['type']
    const missingFields = requiredFields.filter(field => !dataPayload[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const result = await DataModel.create(dataPayload)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Data created successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create data',
      message: error.message
    })
  }
}

// Update data
const updateData = async (req, res) => {
  try {
    const { id } = req.params
    const updatePayload = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    const result = await DataModel.update(id, updatePayload)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Data not found',
        message: `No data found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      data: result,
      message: 'Data updated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update data',
      message: error.message
    })
  }
}

// Delete data
const deleteData = async (req, res) => {
  try {
    const { id } = req.params
    const result = await DataModel.delete(id)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Data not found',
        message: `No data found with ID: ${id}`
      })
    }

    res.json({
      success: true,
      message: 'Data deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete data',
      message: error.message
    })
  }
}

// Search data
const searchData = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
        message: 'Please provide a search query parameter "q"'
      })
    }

    const result = await DataModel.search(q, { type, page: parseInt(page), limit: parseInt(limit) })

    res.json({
      success: true,
      data: result.data,
      query: q,
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

// Get usage analytics
const getUsageAnalytics = async (req, res) => {
  try {
    const analytics = await DataModel.getAnalytics()
    
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
  getAllData,
  getDataById,
  createData,
  updateData,
  deleteData,
  searchData,
  getUsageAnalytics
}