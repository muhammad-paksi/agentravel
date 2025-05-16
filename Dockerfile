# --- STAGE 1: Install dependencies ---
    FROM node:18-alpine AS deps
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    
    # --- STAGE 2: Build the application ---
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN npm run build
    
    # --- STAGE 3: Run the application in production mode ---
    FROM node:18-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Salin hanya yang dibutuhkan untuk production
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    
    EXPOSE 3000
    CMD ["npm", "start"]
    