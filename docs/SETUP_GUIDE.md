# SubVault - Local Setup & Production Deployment Guide

SubVault is a production-grade, C2C digital subscription marketplace architecture built with NestJS, Next.js (App Router), PostgreSQL, Prisma ORM, and Socket.IO.

---

## 1. System Requirements
- **Node.js**: v20+ or v22+ (tested on Node v24)
- **PostgreSQL**: v15, v16, or v18 (running locally or via Supabase / Neon / AWS RDS)
- **npm** or **pnpm** (workspaces enabled)

---

## 2. Environment Variables (.env)
Create `.env` at the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:1407@localhost:5432/ott_marketplace?schema=public"
DIRECT_URL="postgresql://postgres:1407@localhost:5432/ott_marketplace?schema=public"

# Application Ports & URLs
PORT=5100
API_URL="http://localhost:5100"
NEXT_PUBLIC_API_URL="http://localhost:5100/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5100"
FRONTEND_URL="http://localhost:3007"

# Security & Authentication (Replace with high-entropy 256-bit strings in production)
JWT_SECRET="subvault_super_secret_jwt_access_token_key_2026_x87b92q"
JWT_REFRESH_SECRET="subvault_super_secret_jwt_refresh_token_key_2026_m82z01p"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
ENCRYPTION_KEY="subvault_aes_256_secret_key_prod_32ch!" # 32-byte AES key for digital credentials

# Razorpay Payment Gateway (Indian Rupee INR)
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_test_webhook_secret"

# Redis Cache & Queues (Optional for local dev, BullMQ compatible)
REDIS_URL="redis://localhost:6379"

# Admin Initial Credentials for Seed
ADMIN_EMAIL="admin@subvault.com"
ADMIN_PASSWORD="Admin@SubVault2026!"
```

---

## 3. Installation & Database Setup

1. **Install dependencies across the monorepo:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

3. **Synchronize Database Schema:**
   ```bash
   npm run prisma:push
   # or for migrations:
   npm run prisma:migrate
   ```

4. **Seed Live Database Data:**
   ```bash
   npm run prisma:seed
   ```
   *Seeds Admin, verified Sellers (CloudPass Hub, PrimeStream), Buyer account with preloaded ₹1500 wallet balance, real Platforms (Netflix, Prime, Spotify, ChatGPT Plus, Canva, NordVPN), Listings, and AES-256 encrypted inventory slots.*

---

## 4. Running the Monorepo

### Option A: Run Both Services Concurrently
```bash
npm run dev
```

### Option B: Run Services Individually
- **Backend API (NestJS):**
  ```bash
  npm run dev:api
  # Runs on http://localhost:5100/api
  # Interactive Swagger API Docs: http://localhost:5100/api/docs
  ```

- **Frontend (Next.js):**
  ```bash
  npm run dev:web
  # Runs on http://localhost:3007
  ```

---

## 5. Seed Accounts for Testing

| Role | Email | Password | Preloaded Balance / Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@subvault.com` | `Admin@SubVault2026!` | Super Admin Panel at `/admin` |
| **Seller** | `seller@subvault.com` | `Seller@SubVault2026!` | Verified Merchant (CloudPass Hub) |
| **Buyer** | `buyer@subvault.com` | `Buyer@SubVault2026!` | ₹1,500.00 Wallet Balance Ready |

---

## 6. Production Deployment

### Backend (Render / Railway / AWS ECS)
1. Build the packages & backend:
   ```bash
   npm run build:packages
   npm run build:api
   ```
2. Run database migration in CI/CD pipeline:
   ```bash
   npx prisma migrate deploy
   ```
3. Start the NestJS production server:
   ```bash
   node apps/api/dist/main.js
   ```

### Frontend (Vercel / Cloudflare Pages / AWS Amplify)
1. Set Root Directory to `apps/web` or deploy from root workspace.
2. Build command: `npm run build:web`.
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com`
