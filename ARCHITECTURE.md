# Architecture Documentation

## System Overview

The Forex Marketplace Backend follows a microservices architecture pattern with the following characteristics:

- **Independent Services** - Each service runs as a separate process
- **Database per Service** - Each service has its own MongoDB database
- **Synchronous Communication** - Services communicate via HTTP REST APIs
- **gRPC Ready** - Infrastructure for gRPC communication between services

## Service Communication Flow

```
Client (Mobile/Web)
    ↓
API Gateway (would be added in production)
    ├→ User Service (3001)
    ├→ Wallet Service (3002)
    │   └→ Rate Service (3003)
    ├→ Rate Service (3003)
    └→ Transaction Service (3004)
        ├→ Wallet Service (3002)
        └→ Rate Service (3003)
```

## User Registration Flow

```
1. User → User Service: POST /auth/register
2. User Service: Validate email/username
3. User Service: Hash password with bcrypt
4. User Service: Create user in MongoDB
5. User Service: Generate JWT token
6. User Service → Client: Return token + user data
```

## Trading Order Flow

```
1. Client → Transaction Service: POST /orders (with JWT token)
2. Transaction Service: Fetch current rate from Rate Service
3. Transaction Service → Wallet Service: Debit source currency
4. Wallet Service: Check balance
5. Wallet Service: Update balance in MongoDB
6. Transaction Service → Wallet Service: Credit destination currency
7. Transaction Service: Create order record in MongoDB
8. Transaction Service: Create transaction record in MongoDB
9. Transaction Service → Client: Return order confirmation
```

## Database Schema

### User Service Database (forex-user-db)
- **Collections:** users
- **Indexes:** email (unique), username, createdAt
- **Purpose:** User authentication and profile data

### Wallet Service Database (forex-wallet-db)
- **Collections:** wallets
- **Indexes:** userId (unique), currency
- **Purpose:** Multi-currency balance tracking per user

### Rate Service Database (forex-rate-db)
- **Collections:** rates
- **Indexes:** (fromCurrency, toCurrency) composite, updatedAt
- **Purpose:** Cached exchange rate data

### Transaction Service Database (forex-transaction-db)
- **Collections:** orders, transactions
- **Indexes:** userId, status, createdAt, orderId
- **Purpose:** Order and transaction history audit trail

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com", 
  "username": "john_doe",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Protected Routes
- User Service: `/api/users/*` requires JWT
- Wallet Service: No JWT required (called by services)
- Rate Service: No JWT required (public data)
- Transaction Service: No JWT required in current implementation (would need JWT in production)

## Scalability Considerations

### Horizontal Scaling
1. **Load Balancer** - Place all services behind load balancer
2. **Service Replicas** - Scale each service independently
3. **Database Connection Pooling** - Handle concurrent connections
4. **Rate Limiting** - Implement per-user and per-IP limits

### Optimization Strategies
1. **Rate Caching** - Reduce external API calls
2. **Database Indexing** - Fast query execution
3. **gRPC for Internal Communication** - Binary protocol is faster
4. **Redis Caching** - Cache frequently accessed data
5. **Connection Pooling** - Reuse MongoDB connections

## Error Handling

### Error Hierarchy
- **ValidationError** - Invalid input data
- **NotFoundError** - Resource not found
- **BadRequestError** - Malformed request
- **UnauthorizedError** - Authentication required
- **ForbiddenError** - Insufficient permissions
- **ConflictError** - Resource conflict (duplicate)
- **InternalServerError** - Unexpected error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Email already in use",
  "error": "BadRequestException"
}
```

## Deployment Architecture

### Docker Containers
```
Docker Compose Network
├── MongoDB Container
├── User Service Container
├── Wallet Service Container
├── Rate Service Container
└── Transaction Service Container
```

### Production Deployment (Kubernetes)
```
Kubernetes Cluster
├── Ingress (API Gateway)
├── User Service Pod (replicas: 3)
├── Wallet Service Pod (replicas: 2)
├── Rate Service Pod (replicas: 2)
├── Transaction Service Pod (replicas: 2)
├── MongoDB StatefulSet
└── Redis Cache Pod
```

## Performance Metrics

### Expected Response Times
- User Auth: 100-200ms
- Get Rate: 50-100ms (cached)
- Place Order: 500-1000ms (includes wallet updates)
- Get Balance: 100-150ms

### Throughput Targets
- User Service: 1000 req/sec
- Wallet Service: 500 req/sec
- Rate Service: 2000 req/sec
- Transaction Service: 200 req/sec

## Security Considerations

### Authentication
- JWT secret must be rotated regularly
- Token expiration: 24 hours (configurable)
- Refresh token mechanism (not implemented yet)

### Data Protection
- Passwords hashed with bcrypt (10 rounds)
- Sensitive data not logged
- HTTPS/SSL in production
- SQL injection prevention (using ORM)

### API Security
- Input validation on all endpoints
- CORS configured
- Rate limiting recommended
- API key management for external APIs

## Future Enhancements

1. **gRPC Implementation** - Replace HTTP inter-service communication
2. **Event Sourcing** - Track all state changes
3. **CQRS Pattern** - Separate read/write operations
4. **Message Queue** - Asynchronous processing with Kafka/RabbitMQ
5. **Service Mesh** - Istio for advanced networking
6. **GraphQL Gateway** - Alternative query interface
7. **WebSocket Support** - Real-time rate updates
8. **Queue System** - Background job processing
9. **Audit Logging** - Complete activity trail
10. **Multi-tenancy** - Support multiple organizations

## Technology Justifications

### NestJS
- Strong TypeScript support
- Excellent dependency injection
- Built-in modules for auth, database integration
- Active community and ecosystem

### MongoDB
- Flexible schema for rapid development
- Horizontal scalability with sharding
- Great for microservices (separate databases per service)
- Good document model for our data

### TypeORM
- Familiar ORM for Node.js developers
- Support for multiple databases
- Migration support
- Query builder API

### JWT
- Stateless authentication
- No server-side session storage
- Works well with distributed systems
- Simple to implement

### Docker
- Consistent environment across machines
- Easy deployment and scaling
- Great for microservices
- Integrates well with Kubernetes

---

**Document Version:** 1.0  
**Last Updated:** March 2025
