# Stage 1: Build Environment
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Hardened Production Image
FROM node:18-alpine
WORKDIR /app

# Install 'dumb-init' for proper signal handling and zombie process reaping (Hardcore DevOps)
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY ../src ./src
COPY ../package.json ./

# Security: Set correct ownership before dropping privileges
RUN chown -R node:node /app

# Security: Drop root privileges (CWE-250)
USER node

# Security: Production environment variable enforces strict settings
ENV NODE_ENV=production

EXPOSE 3000

# Security: Use dumb-init to wrap Node.js execution
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/app.js"]
