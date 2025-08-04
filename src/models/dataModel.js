const fs = require('fs-extra')
const path = require('path')

class DataModel {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data')
    this.dataFile = path.join(this.dataDir, 'data.json')
    this.init()
  }

  async init() {
    await fs.ensureDir(this.dataDir)
    if (!await fs.pathExists(this.dataFile)) {
      await fs.writeJson(this.dataFile, [])
    }
  }

  async readData() {
    try {
      return await fs.readJson(this.dataFile)
    } catch (error) {
      console.error('Error reading data file:', error)
      return []
    }
  }

  async writeData(data) {
    try {
      await fs.writeJson(this.dataFile, data, { spaces: 2 })
    } catch (error) {
      console.error('Error writing data file:', error)
      throw error
    }
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filter } = options
    const data = await this.readData()
    
    let filteredData = data
    
    // Apply filters
    if (filter) {
      const filterObj = JSON.parse(filter)
      filteredData = data.filter(item => {
        return Object.keys(filterObj).every(key => {
          return item[key] && item[key].toString().toLowerCase().includes(filterObj[key].toLowerCase())
        })
      })
    }

    // Sort data
    filteredData.sort((a, b) => {
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
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      page,
      limit,
      total: filteredData.length
    }
  }

  async findById(id) {
    const data = await this.readData()
    return data.find(item => item.id === id)
  }

  async create(newData) {
    const data = await this.readData()
    data.push(newData)
    await this.writeData(data)
    return newData
  }

  async update(id, updateData) {
    const data = await this.readData()
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) {
      return null
    }

    data[index] = { ...data[index], ...updateData }
    await this.writeData(data)
    return data[index]
  }

  async delete(id) {
    const data = await this.readData()
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) {
      return null
    }

    const deletedItem = data.splice(index, 1)[0]
    await this.writeData(data)
    return deletedItem
  }

  async search(query, options = {}) {
    const { type, page = 1, limit = 10 } = options
    const data = await this.readData()
    
    let filteredData = data.filter(item => {
      const searchText = JSON.stringify(item).toLowerCase()
      let matches = searchText.includes(query.toLowerCase())
      
      if (type && item.type) {
        matches = matches && item.type.toLowerCase() === type.toLowerCase()
      }
      
      return matches
    })

    // Paginate search results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      page,
      limit,
      total: filteredData.length
    }
  }

  async getAnalytics() {
    const data = await this.readData()
    
    const analytics = {
      totalRecords: data.length,
      typeDistribution: {},
      createdToday: 0,
      createdThisWeek: 0,
      createdThisMonth: 0
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    data.forEach(item => {
      // Type distribution
      const type = item.type || 'unknown'
      analytics.typeDistribution[type] = (analytics.typeDistribution[type] || 0) + 1

      // Time-based analytics
      if (item.createdAt) {
        const createdDate = new Date(item.createdAt)
        
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

    return analytics
  }
}

// Export singleton instance
module.exports = new DataModel()