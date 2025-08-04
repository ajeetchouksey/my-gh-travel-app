# Client Integration Examples

This document provides comprehensive examples for integrating with the MCP (Model Context Protocol) server from various client applications.

## Table of Contents

1. [JavaScript/Frontend Integration](#javascriptfrontend-integration)
2. [Node.js Backend Integration](#nodejs-backend-integration)
3. [Python Integration](#python-integration)
4. [React Component Examples](#react-component-examples)
5. [API Reference](#api-reference)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)

---

## JavaScript/Frontend Integration

### Basic API Client

```javascript
class MCPClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers
      },
      ...options
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('MCP API Error:', error)
      throw error
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health')
  }

  // Data operations
  async getData(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/data${query ? `?${query}` : ''}`)
  }

  async getDataById(id) {
    return this.request(`/api/data/${id}`)
  }

  async createData(data) {
    return this.request('/api/data', {
      method: 'POST',
      body: data
    })
  }

  async updateData(id, data) {
    return this.request(`/api/data/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteData(id) {
    return this.request(`/api/data/${id}`, {
      method: 'DELETE'
    })
  }

  // Trip operations
  async getTrips(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/api/trips${query ? `?${query}` : ''}`)
  }

  async getTripById(id) {
    return this.request(`/api/trips/${id}`)
  }

  async createTrip(tripData) {
    return this.request('/api/trips', {
      method: 'POST',
      body: tripData
    })
  }

  async updateTrip(id, tripData) {
    return this.request(`/api/trips/${id}`, {
      method: 'PUT',
      body: tripData
    })
  }

  async deleteTrip(id) {
    return this.request(`/api/trips/${id}`, {
      method: 'DELETE'
    })
  }

  // Search operations
  async searchTrips(query, filters = {}) {
    const params = { q: query, ...filters }
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/search/trips?${queryString}`)
  }

  async searchData(query, filters = {}) {
    const params = { q: query, ...filters }
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/api/search/data?${queryString}`)
  }

  // Analytics
  async getTripAnalytics() {
    return this.request('/api/analytics/trips')
  }

  async getUsageAnalytics() {
    return this.request('/api/analytics/usage')
  }
}

// Usage example
const client = new MCPClient('https://your-mcp-server.herokuapp.com', 'your-api-key')

// Example usage
async function example() {
  try {
    // Check server health
    const health = await client.checkHealth()
    console.log('Server status:', health.status)

    // Create a new trip
    const newTrip = await client.createTrip({
      title: 'Amazing Trip to Bali',
      destination: 'Bali, Indonesia',
      startDate: '2024-12-01',
      endDate: '2024-12-08',
      budget: 'mid-range',
      description: 'A wonderful vacation in Bali'
    })
    console.log('Created trip:', newTrip.data)

    // Get all trips
    const trips = await client.getTrips({ page: 1, limit: 10 })
    console.log('All trips:', trips.data)

    // Search trips
    const searchResults = await client.searchTrips('bali', { budget: 'mid-range' })
    console.log('Search results:', searchResults.data)

  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### TypeScript Version

```typescript
interface TripData {
  id?: string
  title: string
  destination: string
  startDate: string
  endDate: string
  duration?: number
  budget?: 'budget' | 'mid-range' | 'luxury'
  description?: string
  status?: 'draft' | 'active' | 'completed'
  createdAt?: string
  updatedAt?: string
}

interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class MCPClient {
  constructor(private baseURL: string, private apiKey: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers
      },
      ...options
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  }

  async createTrip(tripData: Omit<TripData, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<TripData>> {
    return this.request<TripData>('/api/trips', {
      method: 'POST',
      body: tripData
    })
  }

  async getTrips(params: { page?: number; limit?: number; destination?: string } = {}): Promise<APIResponse<TripData[]>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request<TripData[]>(`/api/trips${query ? `?${query}` : ''}`)
  }
}
```

---

## Node.js Backend Integration

### Express Middleware Integration

```javascript
const express = require('express')
const axios = require('axios')

class MCPService {
  constructor(baseURL, apiKey) {
    this.client = axios.create({
      baseURL,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        console.error('MCP API Error:', error.response?.data || error.message)
        throw error
      }
    )
  }

  async createTrip(tripData) {
    const response = await this.client.post('/api/trips', tripData)
    return response.data
  }

  async getTrips(filters = {}) {
    const response = await this.client.get('/api/trips', { params: filters })
    return response.data
  }

  async searchTrips(query, filters = {}) {
    const params = { q: query, ...filters }
    const response = await this.client.get('/api/search/trips', { params })
    return response.data
  }

  async getTripAnalytics() {
    const response = await this.client.get('/api/analytics/trips')
    return response
  }
}

// Express middleware
const mcpService = new MCPService(process.env.MCP_SERVER_URL, process.env.MCP_API_KEY)

const app = express()
app.use(express.json())

// Proxy endpoint for trip creation
app.post('/trips', async (req, res) => {
  try {
    const trip = await mcpService.createTrip(req.body)
    res.json(trip)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search endpoint
app.get('/search/trips', async (req, res) => {
  try {
    const { q, destination, budget, duration } = req.query
    const results = await mcpService.searchTrips(q, { destination, budget, duration })
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Analytics endpoint
app.get('/analytics', async (req, res) => {
  try {
    const analytics = await mcpService.getTripAnalytics()
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(4000, () => {
  console.log('Server running on port 4000')
})
```

---

## Python Integration

### Python Client Library

```python
import requests
import json
from typing import Dict, List, Optional
from urllib.parse import urljoin

class MCPClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'api-key': api_key
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        url = urljoin(self.base_url + '/', endpoint.lstrip('/'))
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"MCP API Error: {e}")
            raise

    def check_health(self) -> Dict:
        return self._request('GET', '/health')

    def get_trips(self, page: int = 1, limit: int = 10, **filters) -> Dict:
        params = {'page': page, 'limit': limit, **filters}
        return self._request('GET', '/api/trips', params=params)

    def create_trip(self, trip_data: Dict) -> Dict:
        return self._request('POST', '/api/trips', json=trip_data)

    def get_trip_by_id(self, trip_id: str) -> Dict:
        return self._request('GET', f'/api/trips/{trip_id}')

    def update_trip(self, trip_id: str, trip_data: Dict) -> Dict:
        return self._request('PUT', f'/api/trips/{trip_id}', json=trip_data)

    def delete_trip(self, trip_id: str) -> Dict:
        return self._request('DELETE', f'/api/trips/{trip_id}')

    def search_trips(self, query: str, **filters) -> Dict:
        params = {'q': query, **filters}
        return self._request('GET', '/api/search/trips', params=params)

    def get_analytics(self) -> Dict:
        return self._request('GET', '/api/analytics/trips')

# Usage example
def main():
    client = MCPClient('https://your-mcp-server.herokuapp.com', 'your-api-key')
    
    try:
        # Check server health
        health = client.check_health()
        print(f"Server status: {health['status']}")

        # Create a new trip
        new_trip = {
            'title': 'Python API Test Trip',
            'destination': 'Tokyo, Japan',
            'startDate': '2024-09-15',
            'endDate': '2024-09-22',
            'budget': 'luxury',
            'description': 'Testing the Python API client'
        }
        
        created_trip = client.create_trip(new_trip)
        print(f"Created trip: {created_trip['data']['id']}")

        # Get all trips
        trips = client.get_trips(limit=5)
        print(f"Total trips: {trips['pagination']['total']}")

        # Search trips
        search_results = client.search_trips('tokyo', budget='luxury')
        print(f"Search results: {len(search_results['data'])} trips found")

        # Get analytics
        analytics = client.get_analytics()
        print(f"Analytics: {analytics['analytics']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
```

### Django Integration

```python
# settings.py
MCP_SERVER_URL = 'https://your-mcp-server.herokuapp.com'
MCP_API_KEY = 'your-api-key'

# services.py
from django.conf import settings
import requests

class MCPService:
    def __init__(self):
        self.base_url = settings.MCP_SERVER_URL
        self.api_key = settings.MCP_API_KEY
        self.headers = {
            'Content-Type': 'application/json',
            'api-key': self.api_key
        }

    def create_trip_from_user_input(self, user_data):
        trip_data = {
            'title': user_data.get('title'),
            'destination': user_data.get('destination'),
            'startDate': user_data.get('start_date'),
            'endDate': user_data.get('end_date'),
            'budget': user_data.get('budget', 'mid-range'),
            'description': user_data.get('description', '')
        }
        
        response = requests.post(
            f"{self.base_url}/api/trips",
            json=trip_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

mcp_service = MCPService()

@csrf_exempt
@require_http_methods(["POST"])
def create_trip(request):
    try:
        data = json.loads(request.body)
        trip = mcp_service.create_trip_from_user_input(data)
        return JsonResponse(trip)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
```

---

## React Component Examples

### Trip Creation Component

```jsx
import React, { useState } from 'react'
import { MCPClient } from './mcpClient'

const client = new MCPClient(process.env.REACT_APP_MCP_SERVER_URL, process.env.REACT_APP_MCP_API_KEY)

const TripCreator = () => {
  const [tripData, setTripData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'mid-range',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await client.createTrip(tripData)
      console.log('Trip created:', result.data)
      setSuccess(true)
      setTripData({
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: 'mid-range',
        description: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setTripData({
      ...tripData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="trip-creator">
      <h2>Create New Trip</h2>
      
      {success && (
        <div className="alert alert-success">
          Trip created successfully!
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Trip Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={tripData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={tripData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={tripData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={tripData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget:</label>
          <select
            id="budget"
            name="budget"
            value={tripData.budget}
            onChange={handleChange}
          >
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={tripData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  )
}

export default TripCreator
```

### Trip List Component

```jsx
import React, { useState, useEffect } from 'react'
import { MCPClient } from './mcpClient'

const client = new MCPClient(process.env.REACT_APP_MCP_SERVER_URL, process.env.REACT_APP_MCP_API_KEY)

const TripList = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadTrips()
  }, [page])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const result = await client.getTrips({ page, limit: 10 })
      setTrips(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return
    }

    try {
      await client.deleteTrip(tripId)
      setTrips(trips.filter(trip => trip.id !== tripId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading trips...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="trip-list">
      <h2>Your Trips</h2>
      
      {trips.length === 0 ? (
        <p>No trips found. Create your first trip!</p>
      ) : (
        <>
          <div className="trips-grid">
            {trips.map(trip => (
              <div key={trip.id} className="trip-card">
                <h3>{trip.title}</h3>
                <p><strong>Destination:</strong> {trip.destination}</p>
                <p><strong>Dates:</strong> {trip.startDate} to {trip.endDate}</p>
                <p><strong>Duration:</strong> {trip.duration} days</p>
                <p><strong>Budget:</strong> {trip.budget}</p>
                <p><strong>Status:</strong> {trip.status}</p>
                {trip.description && <p>{trip.description}</p>}
                
                <div className="trip-actions">
                  <button onClick={() => deleteTrip(trip.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              
              <span>Page {page} of {pagination.pages}</span>
              
              <button 
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TripList
```

### Search Component

```jsx
import React, { useState } from 'react'
import { MCPClient } from './mcpClient'

const client = new MCPClient(process.env.REACT_APP_MCP_SERVER_URL, process.env.REACT_APP_MCP_API_KEY)

const TripSearch = () => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    destination: '',
    budget: '',
    duration: ''
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const result = await client.searchTrips(query, filters)
      setResults(result.data)
      setSearched(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="trip-search">
      <h2>Search Trips</h2>
      
      <form onSubmit={handleSearch}>
        <div className="search-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips..."
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="filters">
          <select
            name="destination"
            value={filters.destination}
            onChange={handleFilterChange}
          >
            <option value="">Any Destination</option>
            <option value="paris">Paris</option>
            <option value="tokyo">Tokyo</option>
            <option value="bali">Bali</option>
          </select>

          <select
            name="budget"
            value={filters.budget}
            onChange={handleFilterChange}
          >
            <option value="">Any Budget</option>
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>

          <input
            type="number"
            name="duration"
            value={filters.duration}
            onChange={handleFilterChange}
            placeholder="Duration (days)"
          />
        </div>
      </form>

      {searched && (
        <div className="search-results">
          <h3>Search Results ({results.length})</h3>
          {results.length === 0 ? (
            <p>No trips found matching your criteria.</p>
          ) : (
            <div className="results-grid">
              {results.map(trip => (
                <div key={trip.id} className="result-card">
                  <h4>{trip.title}</h4>
                  <p>{trip.destination}</p>
                  <p>{trip.duration} days • {trip.budget}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TripSearch
```

---

## API Reference

### Authentication

All API requests require an API key in the header:

```http
GET /api/trips
api-key: your-api-key-here
Content-Type: application/json
```

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Endpoints

#### Health Check
```http
GET /health
GET /health/detailed
GET /health/ready
GET /health/live
```

#### Data Operations
```http
GET /api/data?page=1&limit=10
GET /api/data/:id
POST /api/data
PUT /api/data/:id
DELETE /api/data/:id
```

#### Trip Operations
```http
GET /api/trips?page=1&limit=10&destination=paris
GET /api/trips/:id
POST /api/trips
PUT /api/trips/:id
DELETE /api/trips/:id
```

#### Search
```http
GET /api/search/trips?q=bali&budget=luxury
GET /api/search/data?q=user&type=profile
```

#### Analytics
```http
GET /api/analytics/trips
GET /api/analytics/usage
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Missing required fields: destination, startDate",
  "timestamp": "2024-08-02T17:30:00Z",
  "requestId": "req-123"
}
```

### Client Error Handling

```javascript
try {
  const result = await client.createTrip(tripData)
  // Handle success
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
    console.error('Please check your input data')
  } else if (error.message.includes('Unauthorized')) {
    // Handle authentication errors
    console.error('Please check your API key')
  } else {
    // Handle other errors
    console.error('An unexpected error occurred:', error.message)
  }
}
```

---

These examples provide a comprehensive foundation for integrating with the MCP server from various client applications. Adapt the code to your specific use case and requirements.