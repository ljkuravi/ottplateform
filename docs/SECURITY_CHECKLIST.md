# SubVault - Enterprise Production Security & Verification Checklist

## 1. Authentication & Session Security
- [x] **Password Hashing**: Passwords stored using PBKDF2 with unique cryptographic salt per user. Never stored or logged in plaintext.
- [x] **Email OTP Verification**: 6-digit random code with 15-minute expiration timer and account email verification gate.
- [x] **Short-Lived Access Tokens**: 15m/1h JWT tokens containing minimal payload (`sub`, `email`, `role`).
- [x] **Rotating Refresh Tokens**: 7-day cryptographic refresh tokens for seamless session extension.
- [x] **Brute-Force Protection**: 5 failed login attempt counter with automated 15-minute account lockout (`lockUntil`).
- [x] **Account Restriction Enforcement**: Suspended and banned accounts blocked at JWT guard level.

---

## 2. Authorization & RBAC
- [x] **Strict Role Enforcement**: `@Roles(RoleType.ADMIN, ...)` decorator and `RolesGuard` applied globally across all sensitive endpoints.
- [x] **IDOR Prevention**: All order lookups (`GET /orders/:id`) verify `order.buyerId === userId || order.seller.userId === userId || isAdmin`.
- [x] **Chat Thread Isolation**: Messages rejected unless requesting user is a verified participant or admin.
- [x] **Zero Frontend Trust**: Role, wallet balances, and pricing never read or trusted from frontend state.

---

## 3. Financial & Wallet Security
- [x] **Immutable Double-Entry Ledger**: Every balance mutation produces a `WalletTransaction` with `balanceAfter` and `type` (CREDIT, DEBIT, REFUND, ADJUSTMENT).
- [x] **Serializable Database Transactions**: The 17-step purchase flow runs in serializable PostgreSQL transactions with row locking.
- [x] **Double-Spending Prevention**: Balance verified within transaction lock before deducting; negative balances impossible.
- [x] **Payment Webhook Idempotency**: Razorpay webhooks deduplicated via unique `eventId` in `PaymentWebhook` table.
- [x] **Isolated Seller Wallet**: Merchant earnings tracked in separate `SellerWallet` and `SellerEarning` tables with platform commission auto-deduction.

---

## 4. Digital Delivery & Data Encryption
- [x] **AES-256-GCM Encryption**: Credentials, PINs, and invite links encrypted at rest.
- [x] **Isolated Decryption**: Only authorized buyer, seller, or admin can trigger server-side decryption on the specific order endpoint.
- [x] **Credential Leak Protection**: Credentials never included in public listing cards or search queries.

---

## 5. Web & Network Security
- [x] **Helmet**: Secure HTTP response headers (XSS filter, MIME sniffing protection, clickjacking defense).
- [x] **CORS Whitelist**: Explicitly restricted to trusted origin (`http://localhost:3000`).
- [x] **Input Validation**: Global `ValidationPipe` with class-validator DTOs, stripping non-whitelisted attributes.
- [x] **SQL Injection Defense**: Prisma parameterized queries exclusively used throughout the backend.
- [x] **No Secrets in Client Bundle**: All API secrets, database credentials, and encryption keys loaded exclusively via server-side `.env`.
