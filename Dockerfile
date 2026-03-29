# Multi-stage build Dockerfile for Nx Monorepo

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build specified service
ARG SERVICE
RUN npm run build -- ${SERVICE} --prod

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
ARG SERVICE
COPY --from=builder /app/dist/apps/${SERVICE} ./dist

# Expose port (can be overridden via environment)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run the application
CMD ["node", "dist/main.js"]
