# ChemLab Virtual - Deployment Guide

This guide covers various deployment options for ChemLab Virtual, from local development to production cloud deployments.

## 🚀 Deployment Options

### 1. Local Development
```bash
npm run dev
```
- **Use case**: Development and testing
- **Features**: Hot reload, debug mode
- **Access**: http://localhost:5000

### 2. Local Production Build
```bash
npm run build
npm run start
```
- **Use case**: Testing production build locally
- **Features**: Optimized build, no hot reload
- **Access**: http://localhost:5000

## ☁️ Cloud Deployment

### Vercel (Recommended for Frontend)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configuration**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/client/index.html"
       }
     ]
   }
   ```

### Railway (Full-Stack)

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway auto-detects the Node.js app

2. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=$PORT
   ```

### Netlify (Static + Functions)

1. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     publish = "dist/public"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Heroku

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   
   # Create app
   heroku create your-app-name
   ```

2. **Configuration**
   ```bash
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set NPM_CONFIG_PRODUCTION=false
   
   # Deploy
   git push heroku main
   ```

3. **Procfile**
   ```
   web: npm run start
   ```

### DigitalOcean App Platform

1. **App Specification**
   ```yaml
   # .do/app.yaml
   name: chemlab-virtual
   services:
   - name: web
     source_dir: /
     github:
       repo: yourusername/chemlab-virtual
       branch: main
     run_command: npm run start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   ```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build image
docker build -t chemlab-virtual .

# Run container
docker run -p 5000:5000 chemlab-virtual
```

### Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:5000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
```

## 🗄️ Database Configuration

### PostgreSQL (Production)

1. **Database Setup**
   ```sql
   CREATE DATABASE chemlab_virtual;
   CREATE USER chemlab_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE chemlab_virtual TO chemlab_user;
   ```

2. **Environment Configuration**
   ```env
   DATABASE_URL=postgresql://chemlab_user:secure_password@localhost:5432/chemlab_virtual
   ```

3. **Schema Migration**
   ```bash
   npm run db:push
   ```

### Managed Database Services

#### Supabase
```env
DATABASE_URL=postgresql://username:password@db.supabase.co:5432/postgres
```

#### PlanetScale
```env
DATABASE_URL=mysql://username:password@aws.connect.psdb.cloud/database?sslaccept=strict
```

#### Neon
```env
DATABASE_URL=postgresql://username:password@ep-endpoint.us-east-1.aws.neon.tech/dbname
```

## 🔒 Production Security

### Environment Variables
```env
# Required for production
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-minimum-32-characters
DATABASE_URL=your-database-connection-string

# Optional security headers
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### SSL/HTTPS Configuration

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/chemlab-virtual
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring and Logging

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start npm --name "chemlab-virtual" -- run start

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Logging Configuration
```javascript
// server/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Checks
```javascript
// Add to server/routes.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

## 🚦 Performance Optimization

### Build Optimization
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-progress']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

### Compression
```javascript
// server/index.ts
import compression from 'compression';
app.use(compression());
```

### Caching
```javascript
// Add cache headers
app.use('/assets', express.static('dist/public', {
  maxAge: '1y',
  etag: false
}));
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` successfully
- [ ] Run `npm run check` with no errors
- [ ] Test production build locally
- [ ] Set up environment variables
- [ ] Configure database connection
- [ ] Set up SSL certificates
- [ ] Configure domain DNS

### Post-Deployment
- [ ] Verify application loads correctly
- [ ] Test all experiment workflows
- [ ] Check API endpoints
- [ ] Verify database connections
- [ ] Test user progress tracking
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts
- [ ] Configure backups

### Maintenance
- [ ] Regular dependency updates (`npm audit`)
- [ ] Database backups
- [ ] SSL certificate renewal
- [ ] Performance monitoring
- [ ] Security scans
- [ ] Log rotation

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

#### Performance Issues
```bash
# Monitor resources
htop
df -h
free -m

# Check logs
tail -f logs/combined.log
```

#### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Renew certificate
sudo certbot renew
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Create an issue on GitHub with deployment details

---

**Ready for production deployment!** 🚀