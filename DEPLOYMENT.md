# ChemLab Virtual - Deployment Guide

This guide covers deploying ChemLab Virtual to various platforms for production use.

## Local Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

The application will be optimized and served on port 5000.

## Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
```

### Build and Run
```bash
docker build -t chemlab-virtual .
docker run -p 5000:5000 chemlab-virtual
```

## Cloud Platform Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
git push heroku main
```

**Procfile:**
```
web: npm run start
```

### Railway
1. Connect your GitHub repository
2. Railway will auto-detect the Node.js application
3. Set environment variables if needed

### Render
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Start command: `npm run start`

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## Environment Variables for Production

Create `.env` file:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-postgres-url
SESSION_SECRET=your-secure-session-secret
```

## Database Setup for Production

### PostgreSQL (Recommended)
```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb chemlab

# Run migrations
npm run db:push
```

### Environment Configuration
```env
DATABASE_URL=postgresql://username:password@localhost:5432/chemlab
```

## Performance Optimization

### Enable Compression
The application includes built-in compression for production builds.

### Static File Caching
Static files are automatically optimized and cached.

### Database Optimization
- Use connection pooling for PostgreSQL
- Enable query optimization
- Regular database maintenance

## Security Considerations

### Production Settings
- Use strong session secrets
- Enable HTTPS in production
- Set secure cookie options
- Implement rate limiting

### Content Security Policy
The application includes basic security headers for production.

## Monitoring and Logging

### Health Check Endpoint
The application provides `/api/health` for monitoring.

### Logging
Production logs are formatted for structured logging systems.

## Backup Strategy

### Database Backups
```bash
# Daily backup
pg_dump -h localhost -U username chemlab > backup_$(date +%Y%m%d).sql
```

### File System Backups
- Back up `data/` directory for experiment definitions
- Include configuration files

## Load Balancing

For high-traffic deployments:
- Use multiple application instances
- Implement session affinity or external session storage
- Consider Redis for session management

## SSL/TLS Configuration

### Using Let's Encrypt
```bash
sudo apt-get install certbot
sudo certbot --nginx -d yourdomain.com
```

### Using Cloudflare
1. Add your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Set SSL mode to "Full"

## Performance Monitoring

Recommended tools:
- Application: PM2 for process management
- Database: PostgreSQL logs and pg_stat statements
- System: htop, iostat for system monitoring

## Troubleshooting Production Issues

### Common Issues
1. **Port binding errors**: Check if port 5000 is available
2. **Database connection**: Verify DATABASE_URL format
3. **Memory issues**: Monitor Node.js memory usage
4. **File permissions**: Ensure proper read/write permissions

### Log Analysis
```bash
# View application logs
npm run start 2>&1 | tee logs/app.log

# Monitor resource usage
top -p $(pgrep node)
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers (nginx, HAProxy)
- Implement session clustering
- Use external database (PostgreSQL cluster)

### Vertical Scaling
- Monitor CPU and memory usage
- Optimize database queries
- Enable Node.js clustering

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm audit fix
npm update

# Rebuild application
npm run build
```

### Database Maintenance
```sql
-- Analyze query performance
ANALYZE;

-- Update statistics
VACUUM ANALYZE;
```