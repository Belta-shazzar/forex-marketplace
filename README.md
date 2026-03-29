# 🏦 Forex Marketplace Backend System

A production-ready microservices-based Forex Marketplace backend built with **NestJS**, **TypeORM**, **MongoDB**, and **gRPC**. This project demonstrates clean architecture, scalability, and best practices for building distributed systems.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Services](#services)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Project Overview

The Forex Marketplace Backend System enables users to:

- **Register and Authenticate** - User registration with JWT-based authentication
- **Manage Wallets** - Multi-currency wallet support with balance management
- **Trade Currencies** - Buy and sell forex with real-time exchange rates
- **View Transaction History** - Complete audit trail of all transactions
- **Real-time Rates** - Exchange rate data fetched from external providers

## 🏗️ Architecture

This project follows a **Microservices Architecture** pattern within an **Nx Monorepo**:

```
forex-marketplace/
├── apps/
│   ├── user-service/          # User authentication & management
│   ├── wallet-service/        # Multi-currency wallet management
│   ├── rate-service/          # Exchange rate service (gRPC provider)
│   └── transaction-service/   # Order processing & transaction history
├── libs/
│   ├── common/                # Shared components
│   ├── config/                # Configuration utilities
│   ├── logger/                # Logging service
│   └── errors/                # Custom error classes
├── docker-compose.yml         # Multi-container orchestration
└── Dockerfile                 # Multi-stage build
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | NestJS 10+ |
| **Language** | TypeScript |
| **Database** | MongoDB |
| **ORM** | TypeORM |
| **Authentication** | JWT + Passport |
| **Password Security** | bcrypt |
| **Monorepo** | Nx 18+ |
| **Testing** | Jest |
| **API Protocol** | REST + gRPC |
| **Containerization** | Docker |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 11+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development

# Start with Docker Compose
docker-compose up -d

# Services will be available at:
# User Service: http://localhost:3001/api
# Wallet Service: http://localhost:3002/api
# Rate Service: http://localhost:3003/api
# Transaction Service: http://localhost:3004/api
```

### Manual Local Setup

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

## 📦 Services

### User Service (Port 3001)

Handles authentication and user management.

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile (JWT required)
- `PUT /api/users/profile` - Update user profile (JWT required)

### Wallet Service (Port 3002)

Manages multi-currency wallets.

**Endpoints:**
- `POST /api/wallets` - Create wallet
- `GET /api/wallets/:userId` - Get wallet
- `GET /api/wallets/:userId/balance/:currency` - Check balance
- `POST /api/wallets/:userId/credit` - Credit wallet
- `POST /api/wallets/:userId/debit` - Debit wallet

### Rate Service (Port 3003, gRPC on 5001)

Provides exchange rates with caching.

**Endpoints:**
- `GET /api/rates/:from/:to` - Get single rate
- `GET /api/rates/:from?to=USD,EUR` - Get multiple rates
- `GET /api/rates/:from` - Get all rates for currency

### Transaction Service (Port 3004)

Orchestrates trading orders and transaction history.

**Endpoints:**
- `POST /api/orders` - Place forex order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/transactions/:userId` - Get transaction history

## 💻 Development

### Running Tests

```bash
npm test                    # Run all tests
npm test user-service       # Run specific service tests
npm run test:cov            # Run with coverage
```

### Building

```bash
npm run build               # Build all services
npm run build user-service  # Build specific service
npm run start:prod user-service  # Run production build
```

### Code Quality

```bash
npm run lint                # Run linter
npm run format              # Format code with Prettier
```

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Example API Usage

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "SecurePass123"
  }'
```

### Get Exchange Rate
```bash
curl http://localhost:3003/api/rates/USD/EUR
```

### Place Trading Order
```bash
curl -X POST http://localhost:3004/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "type": "BUY",
    "fromCurrency": "USD",
    "toCurrency": "EUR",
    "amount": 100
  }'
```

## 🔐 Security

- JWT token-based authentication
- Bcrypt password hashing
- Input validation with DTO
- Secure error handling
- CORS enabled
- Environment variable management

## 📈 Scalability

- Nx monorepo for efficient builds
- Independent service scaling
- MongoDB horizontal scaling support
- gRPC for efficient inter-service communication
- Docker container deployment
- Kubernetes-ready architecture

## 📝 Additional Documentation

- [User Service README](./apps/user-service/README.md)
- [Wallet Service README](./apps/wallet-service/README.md)
- [Rate Service README](./apps/rate-service/README.md)
- [Transaction Service README](./apps/transaction-service/README.md)
- [Architecture Decisions](./ARCHITECTURE.md)

## 🎯 Next Steps

To get started:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env.development`
4. Start services with Docker Compose: `docker-compose up -d`
5. Explore the APIs at `http://localhost:3001/api` (and other ports)

## 📞 Support

For issues, questions, or contributions, please open an issue or create a pull request.

---

**Version:** 1.0.0 | **Updated:** March 2025
