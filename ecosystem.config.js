module.exports = {
  apps: [
    {
      name: 'mcp-server',
      script: 'src/server.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      },
      
      // Auto-restart configuration
      autorestart: true,
      watch: process.env.NODE_ENV === 'development',
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'data',
        'logs',
        'tests',
        'coverage',
        '.git'
      ],
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Memory and CPU limits
      max_memory_restart: '500M',
      
      // Process monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Monitoring and metrics
      monitoring: false, // Set to true if you want PM2 Plus monitoring
      
      // Instance variables (available as process.env.instance_var)
      instance_var: 'INSTANCE_ID'
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/ajeetchouksey/my-gh-travel-app.git',
      path: '/var/www/mcp-server',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/ajeetchouksey/my-gh-travel-app.git',
      path: '/var/www/mcp-server-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
}