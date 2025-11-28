# Frontend Service Dockerfile (Multi-stage)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (use npm install if package-lock.json doesn't exist)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Move public folder to root (Next.js expects it at root during build)
RUN if [ -d src/public ]; then cp -r src/public ./public; fi

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy public folder (already moved to root in builder stage)
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]


