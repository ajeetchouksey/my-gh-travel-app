# Deployment Guide for MCP Server

This guide provides detailed instructions for deploying the MCP (Model Context Protocol) server to various hosting platforms.

## Table of Contents

1. [Heroku Deployment](#heroku-deployment)
2. [Docker Deployment](#docker-deployment)
3. [VPS/Cloud Server Deployment](#vpscloud-server-deployment)
4. [DNS and SSL Configuration](#dns-and-ssl-configuration)
5. [Environment Variables](#environment-variables)
6. [Monitoring Setup](#monitoring-setup)

---

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Git repository initialized
- Heroku account

### Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-mcp-server-app

# Add Node.js buildpack (automatically detected)
heroku buildpacks:set heroku/nodejs
```

### Step 2: Configure Environment Variables

```bash
# Set production environment variables
heroku config:set NODE_ENV=production
heroku config:set VALID_API_KEYS="your-secure-api-key-1,your-secure-api-key-2"
heroku config:set JWT_SECRET="your-super-secret-jwt-key-production"
heroku config:set HTTPS_ENABLED=true

# Optional: Set custom allowed origins
heroku config:set ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### Step 3: Create Procfile

```bash
# Create Procfile in project root
echo "web: npm start" > Procfile
```

### Step 4: Deploy

```bash
# Add changes to git
git add .
git commit -m "Prepare for Heroku deployment"

# Deploy to Heroku
git push heroku main

# Open the deployed app
heroku open
```

### Step 5: Monitor Logs

```bash
# View real-time logs
heroku logs --tail

# View app info
heroku ps
```

---

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p data logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
node_modules
npm-debug.log
coverage
.git
.env
tests
docs
*.md
.eslintrc.js
```

### Step 3: Build and Run

```bash
# Build Docker image
docker build -t mcp-server .

# Run container
docker run -d \
  --name mcp-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e VALID_API_KEYS="your-api-key" \
  -v $(pwd)/data:/app/data \
  mcp-server

# Check logs
docker logs mcp-server
```

### Step 4: Docker Compose (Optional)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VALID_API_KEYS=your-api-key
      - JWT_SECRET=your-jwt-secret
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# Run with Docker Compose
docker-compose up -d
```

---

## VPS/Cloud Server Deployment

### Step 1: Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Application Deployment

```bash
# Clone repository
git clone https://github.com/ajeetchouksey/my-gh-travel-app.git
cd my-gh-travel-app

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start with PM2
npm run pm2:start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 3: Nginx Configuration

```nginx
# /etc/nginx/sites-available/mcp-server
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mcp-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## DNS and SSL Configuration

### Step 1: DNS Setup

Point your domain to your server:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A  
Name: www
Value: YOUR_SERVER_IP
```

### Step 2: SSL Certificate (Let's Encrypt)

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 3: SSL Certificate (Manual)

For custom SSL certificates:

```bash
# Generate self-signed certificate (development)
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes

# Set environment variables
export HTTPS_ENABLED=true
export SSL_KEY_PATH=./certs/key.pem
export SSL_CERT_PATH=./certs/cert.pem
```

---

## Environment Variables

### Production Environment Variables

```bash
# Required
NODE_ENV=production
PORT=3000
VALID_API_KEYS=api-key-1,api-key-2,api-key-3
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Security
HTTPS_ENABLED=true
SSL_KEY_PATH=/path/to/ssl/key.pem
SSL_CERT_PATH=/path/to/ssl/cert.pem
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Data
DATA_DIR=/app/data
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true
LOG_LEVEL=info
```

### Security Best Practices

1. **API Keys**: Use strong, randomly generated keys
2. **JWT Secret**: Minimum 32 characters, randomly generated
3. **CORS**: Restrict origins to your frontend domains
4. **Rate Limiting**: Adjust based on your usage patterns
5. **HTTPS**: Always enable in production

---

## Monitoring Setup

### PM2 Monitoring

```bash
# Monitor processes
pm2 status
pm2 logs mcp-server
pm2 monit

# Restart if needed
pm2 restart mcp-server
pm2 reload mcp-server

# Advanced monitoring with PM2 Plus (optional)
pm2 install pm2-server-monit
```

### Log Monitoring

```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# Log rotation setup
sudo nano /etc/logrotate.d/mcp-server
```

Add to logrotate config:
```
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 appuser appuser
    postrotate
        pm2 reload mcp-server
    endscript
}
```

### Health Monitoring

```bash
# Set up health check monitoring
curl -f http://localhost:3000/health || echo "Server down!"

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
HEALTH_URL="https://yourdomain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE != "200" ]; then
    echo "Server health check failed: $RESPONSE"
    # Add notification logic here (email, Slack, etc.)
fi
EOF

chmod +x monitor.sh

# Add to crontab for periodic checks
crontab -e
# Add: */5 * * * * /path/to/monitor.sh
```

---

## Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "/backups/mcp-data-$DATE.tar.gz" ./data
find /backups -name "mcp-data-*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Disaster Recovery

1. **Regular Backups**: Automated daily backups
2. **Multiple Locations**: Store backups in different locations
3. **Recovery Testing**: Regularly test backup restoration
4. **Documentation**: Maintain recovery procedures

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 <PID>
   ```

2. **Permission Issues**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x /path/to/app
   ```

3. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --force-renewal
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   pm2 status
   
   # Restart if needed
   pm2 restart mcp-server
   ```

### Performance Optimization

1. **Enable Gzip**: Already configured in Express
2. **Use CDN**: For static assets
3. **Database Optimization**: Regular cleanup
4. **Caching**: Implement Redis for session storage
5. **Load Balancing**: Use multiple instances with PM2 cluster mode

---

This deployment guide covers the major hosting platforms and configurations. Choose the option that best fits your infrastructure and requirements.