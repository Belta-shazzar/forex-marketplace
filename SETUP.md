# Setup & Installation Guide

## System Requirements

- **Node.js** 20.0.0 or higher
- **npm** 11.0.0 or higher
- **Docker** 24.0.0 or higher
- **Docker Compose** 2.0.0 or higher
- **MongoDB** (optional if using Docker Compose) 6.0+
- **Git** 2.0+

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd forex-marketplace
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- NestJS and dependencies
- TypeORM and database drivers
- Authentication libraries (JWT, Passport, bcrypt)
- Testing frameworks (Jest)
- Build tools and linters
- gRPC libraries

### 3. Setup Environment Variables

#### Option A: Docker Compose (Recommended for local development)

```bash
cp .env.example .env.development
# Use the default values in .env.development
```

#### Option B: Local Development

```bash
cp .env.example .env.development
# Edit .env.development

# Key values to set:
# MONGODB_URI=mongodb://localhost:27017
# USER_SERVICE_JWT_SECRET=your-secret-key
# NODE_ENV=development
```

### 4. Start Services

#### Option A: Using Docker Compose (All services + MongoDB)

```bash
# Start all services and MongoDB
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Available Services:**
- User Service: http://localhost:3001/api
- Wallet Service: http://localhost:3002/api
- Rate Service: http://localhost:3003/api
- Transaction Service: http://localhost:3004/api
- MongoDB Admin: You can connect via MongoDB client

#### Option B: Local Development (Manual)

##### Step 4.1: Start MongoDB

```bash
# Option 1: Using Docker (MongoDB only)
docker run -d \
  --name forex-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -p 27017:27017 \
  mongo:latest

# Option 2: Using local MongoDB installation
mongod
```

##### Step 4.2: Start Each Service in Separate Terminals

```bash
# Terminal 1: User Service
npm run start user-service

# Terminal 2: Wallet Service
npm run start wallet-service

# Terminal 3: Rate Service
npm run start rate-service

# Terminal 4: Transaction Service
npm run start transaction-service
```

## Verification

### Check Services Are Running

```bash
# User Service
curl http://localhost:3001/api

# Wallet Service
curl http://localhost:3002/api

# Rate Service
curl http://localhost:3003/api/rates

# Transaction Service
curl http://localhost:3004/api
```

### Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123"
  }'
```

## Common Issues

### MongoDB Connection Error

**Problem:** `MongooseConnectionError` or `Failed to connect to MongoDB`

**Solution:**
```bash
# Ensure MongoDB is running
docker ps | grep mongo

# Or check local MongoDB
mongosh

# Update MONGODB_URI in .env.development
MONGODB_URI=mongodb://localhost:27017
```

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find and kill process using port
lsof -i :3001
kill -9 <PID>

# Or specify different port
PORT=3005 npm run start user-service
```

### Module Not Found

**Problem:** `Cannot find module '@nestjs/...'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Nx cache
npx nx reset
```

### Docker Compose Issues

**Problem:** Services don't start with docker-compose

**Solution:**
```bash
# Rebuild containers
docker-compose up --build -d

# Check logs
docker-compose logs <service-name>

# Remove all and restart
docker-compose down -v
docker-compose up -d
```

## Development Commands

### Running Services

```bash
# Start specific service in dev mode
npm run start user-service

# Watch mode (auto-reload)
npm run start:dev user-service

# Production mode
npm run start:prod user-service
```

### Building

```bash
# Build all services
npm run build

# Build specific service
npm run build user-service

# Build with specific configuration
npm run build -- user-service --configuration=production
```

### Testing

```bash
# Run all tests
npm test

# Run specific service tests
npm test user-service

# Watch mode
npm test -- --watch

# Coverage report
npm run test:cov
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Format code
npm run format

# Fix linting issues
npm run lint -- --fix
```

## Monitoring & Debugging

### View Service Logs

```bash
# Docker Compose logs
docker-compose logs user-service

# Follow logs
docker-compose logs -f user-service

# Last N lines
docker-compose logs --tail 100 user-service
```

### Debugging Node Process

```bash
# Start service with debugging
node --inspect=0.0.0.0:9229 dist/main.js

# Or via npm script
npm run start --debug
```

## Database Management

### MongoDB CLI

```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017

# List databases
show databases

# Use specific database
use forex-user-db

# List collections
show collections

# View documents
db.users.find().limit(10)
```

### Backup & Restore

```bash
# Backup MongoDB
docker exec forex-mongodb mongodump --out dumps

# Restore MongoDB
docker exec -v $(pwd)/dumps:/dumps forex-mongodb mongorestore /dumps
```

## Production Checklist

- [ ] Change JWT_SECRET in production
- [ ] Update MONGODB_URI with production database
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for allowed domains
- [ ] Set up API rate limiting
- [ ] Configure logging and monitoring
- [ ] Set up backup strategy
- [ ] Configure CI/CD pipeline
- [ ] Document deployment process
- [ ] Set up health checks
- [ ] Configure auto-scaling
- [ ] Set up error tracking (Sentry)
- [ ] Monitor performance (New Relic)
- [ ] Set up alerting

## Getting Help

If you encounter issues:

1. Check the [README.md](./README.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check service-specific READMEs in `apps/*/README.md`
4. Search existing issues
5. Create a new issue with:
   - Error message
   - Command that failed
   - Environment details
   - Steps to reproduce

---

**Last Updated:** March 2025
