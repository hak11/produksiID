# ===== Stage 1: Install Dependencies =====
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ===== Stage 2: Build Next.js =====
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 
RUN yarn build

# ===== Stage 3: Production Image =====
FROM node:18-alpine AS runner
WORKDIR /app

# Set ENV untuk Production
ENV NODE_ENV production

# Buat user khusus untuk keamanan
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy hanya file yang dibutuhkan untuk production
COPY --from=builder /app/next.config.js ./ 
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Pastikan user nextjs memiliki akses ke .next
RUN chown -R nextjs:nodejs ./.next

# Gunakan user non-root untuk keamanan
USER nextjs

# Expose port 3000
EXPOSE 3000

# Jalankan aplikasi
CMD ["yarn", "start"]
