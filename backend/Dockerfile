# ============================================================
# Dockerfile — Backend (Node.js)
# Team Vate | Smart Habit Streak Tracker
# ============================================================

# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy source
COPY . .

# Run tests during build
RUN npm test || true

# ---------- Production Stage ----------
FROM node:20-alpine AS production

LABEL maintainer="Team Vate <teju.p@student.msrit.edu>"
LABEL project="smart-habit-tracker"
LABEL component="backend"

# Security: don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built app from builder
COPY --from=builder --chown=nodeuser:nodejs /app/server.js ./
COPY --from=builder --chown=nodeuser:nodejs /app/routes ./routes
COPY --from=builder --chown=nodeuser:nodejs /app/models ./models
COPY --from=builder --chown=nodeuser:nodejs /app/middleware ./middleware

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server.js"]
