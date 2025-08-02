# MCP (Model Context Protocol) Server for Travel App

A production-ready Node.js server implementing the Model Context Protocol for AI-powered travel planning applications. This server provides secure, scalable APIs for managing travel data, trip planning, and itinerary management.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for trips, itineraries, and travel data
- **Authentication**: Secure API key validation with timing-safe comparison
- **Rate Limiting**: Configurable rate limiting per API key
- **Data Persistence**: File-based JSON storage with full CRUD operations
- **Search & Analytics**: Advanced search capabilities and usage analytics
- **HTTPS Support**: Built-in SSL/TLS support for secure communication
- **Monitoring**: PM2 integration for process management and monitoring
- **Testing**: Comprehensive Jest test suite with >95% coverage
- **Documentation**: Complete API documentation and integration examples
- **Deployment Ready**: Heroku, Docker, and VPS deployment guides

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Client Integration](#client-integration)
- [Monitoring](#monitoring)
- [Contributing](#contributing)

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/ajeetchouksey/my-gh-travel-app.git
cd my-gh-travel-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start the server
npm start

# Or start in development mode
npm run dev
```

The server will be running at `http://localhost:3000`

### Health Check
```bash
curl http://localhost:3000/health
```

### Test API (with authentication)
```bash
curl -H "api-key: default-dev-key" http://localhost:3000/api/trips
```

## 📦 Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PM2**: For production monitoring (optional)

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with file watching
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

### Production Setup

```bash
# Install production dependencies only
npm ci --only=production

# Start with PM2
npm run pm2:start

# Monitor with PM2
npm run pm2:status
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Security Configuration
VALID_API_KEYS=your-secret-api-key-1,your-secret-api-key-2
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# HTTPS Configuration
HTTPS_ENABLED=false
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Best Practices

1. **Generate Strong API Keys**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use Environment Variables**: Never commit secrets to git
3. **Enable HTTPS**: In production, always use HTTPS
4. **Configure CORS**: Restrict origins to your frontend domains
5. **Set Rate Limits**: Adjust based on your usage patterns

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication

All API endpoints require an API key in the header:

```http
api-key: your-api-key-here
```

### Core Endpoints

#### Health Check
```http
GET /health                 # Basic health check
GET /health/detailed        # Detailed system health
GET /health/ready          # Readiness probe
GET /health/live           # Liveness probe
```

#### Trip Management
```http
GET /api/trips             # Get all trips (paginated)
GET /api/trips/:id         # Get trip by ID
POST /api/trips            # Create new trip
PUT /api/trips/:id         # Update trip
DELETE /api/trips/:id      # Delete trip
```

#### Itinerary Management
```http
GET /api/itineraries       # Get itineraries
POST /api/itineraries      # Create itinerary
PUT /api/itineraries/:id   # Update itinerary
DELETE /api/itineraries/:id # Delete itinerary
```

#### Search & Analytics
```http
GET /api/search/trips?q=bali&budget=luxury
GET /api/analytics/trips
GET /api/analytics/usage
```

### Request/Response Examples

#### Create Trip
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Trip to Bali",
    "destination": "Bali, Indonesia",
    "startDate": "2024-12-01",
    "endDate": "2024-12-08",
    "budget": "mid-range",
    "description": "A wonderful vacation in Bali"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid-here",
    "title": "Amazing Trip to Bali",
    "destination": "Bali, Indonesia",
    "startDate": "2024-12-01",
    "endDate": "2024-12-08",
    "duration": 7,
    "budget": "mid-range",
    "status": "draft",
    "createdAt": "2024-08-02T17:30:00.000Z",
    "updatedAt": "2024-08-02T17:30:00.000Z"
  },
  "message": "Trip created successfully"
}
```

#### Get Trips with Filters
```bash
curl "http://localhost:3000/api/trips?page=1&limit=10&destination=bali&budget=luxury" \
  -H "api-key: your-api-key"
```

For complete API documentation, see [docs/API.md](docs/API.md)

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Structure
```
tests/
├── server.test.js          # Server and health endpoints
├── dataController.test.js  # Data CRUD operations
├── tripController.test.js  # Trip and itinerary management
└── auth.test.js           # Authentication middleware
```

### Example Test
```javascript
describe('Trip Management', () => {
  test('should create new trip', async () => {
    const tripData = {
      title: 'Test Trip',
      destination: 'Paris',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      budget: 'mid-range'
    }

    const response = await request(app)
      .post('/api/trips')
      .set('api-key', 'default-dev-key')
      .send(tripData)
    
    expect(response.statusCode).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.title).toBe(tripData.title)
  })
})
```

## 🚀 Deployment

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-mcp-server

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set VALID_API_KEYS="your-production-api-keys"

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Docker Deployment

```bash
# Build image
docker build -t mcp-server .

# Run container
docker run -d \
  --name mcp-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e VALID_API_KEYS="your-api-key" \
  mcp-server
```

### VPS Deployment

```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm nginx certbot

# Clone and setup
git clone https://github.com/ajeetchouksey/my-gh-travel-app.git
cd my-gh-travel-app
npm install --production

# Start with PM2
npm install -g pm2
npm run pm2:start

# Configure Nginx
sudo nano /etc/nginx/sites-available/mcp-server

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🔧 Client Integration

### JavaScript/Browser

```javascript
class MCPClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL
    this.apiKey = apiKey
  }

  async createTrip(tripData) {
    const response = await fetch(`${this.baseURL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(tripData)
    })
    return response.json()
  }
}

// Usage
const client = new MCPClient('https://your-server.com', 'your-api-key')
const trip = await client.createTrip({
  title: 'My Trip',
  destination: 'Paris',
  startDate: '2024-06-01',
  endDate: '2024-06-07'
})
```

### Python

```python
import requests

class MCPClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'api-key': api_key
        }

    def create_trip(self, trip_data):
        response = requests.post(
            f"{self.base_url}/api/trips",
            json=trip_data,
            headers=self.headers
        )
        return response.json()

# Usage
client = MCPClient('https://your-server.com', 'your-api-key')
trip = client.create_trip({
    'title': 'My Trip',
    'destination': 'Paris',
    'startDate': '2024-06-01',
    'endDate': '2024-06-07'
})
```

For complete integration examples, see [docs/CLIENT_INTEGRATION.md](docs/CLIENT_INTEGRATION.md)

## 📊 Monitoring

### PM2 Monitoring

```bash
# Start with PM2
npm run pm2:start

# Monitor processes
pm2 status
pm2 logs mcp-server
pm2 monit

# Restart if needed
pm2 restart mcp-server
```

### Health Monitoring

```bash
# Basic health check
curl https://your-server.com/health

# Detailed health with system metrics
curl https://your-server.com/health/detailed
```

### Log Files

- **Combined logs**: `logs/combined.log`
- **Error logs**: `logs/error.log`
- **Access logs**: Built into Morgan middleware

### Performance Metrics

The server tracks:
- Request response times
- Memory usage
- CPU utilization
- API usage analytics
- Error rates

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- **Linting**: ESLint with Standard config
- **Testing**: Jest with >90% coverage requirement
- **Documentation**: JSDoc comments for all functions
- **Commits**: Conventional commit format

### Testing Requirements

- All new features must include tests
- Maintain >90% test coverage
- All tests must pass before merging

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **Jest** - Testing framework
- **PM2** - Process management
- **Heroku** - Deployment platform

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/ajeetchouksey/my-gh-travel-app/issues)
- **Email**: support@yourdomain.com

---

**Built with ❤️ for the travel community**