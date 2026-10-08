# SubVault - API Documentation

Interactive Swagger documentation is served at `http://localhost:4000/api/docs`.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register account & issue 6-digit verification OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP code & obtain JWT tokens | Public |
| `POST` | `/api/auth/login` | Authenticate with email & password | Public |
| `POST` | `/api/auth/forgot-password` | Issue password recovery OTP | Public |
| `POST` | `/api/auth/reset-password` | Reset password using verified OTP | Public |
| `POST` | `/api/auth/refresh` | Exchange refresh token for fresh access token | Public |
| `GET` | `/api/auth/me` | Fetch user profile, balances, and role metadata | Bearer Token |

---

## 2. Categories & Taxonomy (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | List active categories with platform counts | Public |
| `GET` | `/api/categories/platforms` | List platforms (Netflix, Prime, ChatGPT, etc.) | Public |
| `GET` | `/api/categories/:slug` | Category details by slug | Public |

---

## 3. Marketplace Listings (`/api/listings`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Server-side paginated search, filter & sort | Public |
| `GET` | `/api/listings/featured` | Top featured listings for homepage showcase | Public |
| `GET` | `/api/listings/:slug` | Full details, specs, seller info & reviews | Public |
| `POST` | `/api/listings` | Create listing with encrypted inventory slots | Seller / Admin |
| `PATCH` | `/api/listings/:id` | Update listing parameters | Seller / Admin |
| `POST` | `/api/listings/:id/inventory`| Add encrypted credentials to inventory | Seller / Admin |

---

## 4. Cart & Inventory Revalidation (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | View items with live stock & price validation | Bearer Token |
| `POST` | `/api/cart/items` | Add listing to cart | Bearer Token |
| `DELETE` | `/api/cart/items/:id` | Remove specific item | Bearer Token |
| `DELETE` | `/api/cart` | Clear entire cart | Bearer Token |

---

## 5. Wallet & Payments (`/api/wallet`, `/api/payments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wallet` | View available, pending, and total balances | Bearer Token |
| `GET` | `/api/wallet/transactions` | Immutable ledger history with balance-after | Bearer Token |
| `POST` | `/api/payments/create-order` | Create Razorpay deposit order | Bearer Token |
| `POST` | `/api/payments/verify` | Verify signature & credit wallet atomically | Bearer Token |
| `POST` | `/api/payments/mock-success` | Sandbox deposit simulator for testing | Bearer Token |
| `POST` | `/api/payments/webhook` | Idempotent webhook receiver with signature check | Public |

---

## 6. Orders & Digital Delivery (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | 17-step atomic purchase from wallet | Bearer Token |
| `GET` | `/api/orders` | Buyer's purchased subscriptions list | Bearer Token |
| `GET` | `/api/orders/seller` | Orders received by authenticated seller | Seller / Admin |
| `GET` | `/api/orders/:id` | Decrypted credentials for authorized party | Buyer/Seller/Admin |

---

## 7. Merchant & Withdrawals (`/api/sellers`, `/api/seller/withdrawals`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/seller-applications` | Submit merchant onboarding application | Bearer Token |
| `GET` | `/api/seller-applications/my-status`| Check application review status | Bearer Token |
| `GET` | `/api/sellers/dashboard` | Sales KPIs, today's revenue, active stock | Seller / Admin |
| `GET` | `/api/seller/withdrawals/wallet` | Available earnings & lifetime payouts | Seller / Admin |
| `POST` | `/api/seller/withdrawals` | Submit UPI / Bank payout request | Seller / Admin |
| `GET` | `/api/seller/withdrawals` | List withdrawal requests history | Seller / Admin |

---

## 8. Real-Time Chat & Notifications (`/api/chats`, `/api/notifications`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chats` | List conversation threads | Bearer Token |
| `GET` | `/api/chats/:id/messages` | Message history for chat | Bearer Token |
| `POST` | `/api/chats/:id/messages` | Send message in thread | Bearer Token |
| `POST` | `/api/chats/:id/read` | Mark thread messages as read | Bearer Token |
| `GET` | `/api/notifications` | Unread notifications & badges | Bearer Token |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | Bearer Token |
| `PATCH` | `/api/notifications/read-all`| Mark all notifications as read | Bearer Token |

---

## 9. Admin Operations (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Platform GMV, earnings, active counts | Admin |
| `GET` | `/api/admin/users` | Search, filter & list accounts | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Suspend, ban, or modify permissions | Admin |
| `GET` | `/api/admin/seller-applications` | List merchant onboarding applications | Admin |
| `POST` | `/api/admin/seller-applications/:id/review` | Approve or reject seller application | Admin |
| `GET` | `/api/admin/listings` | Moderate all listings | Admin |
| `PATCH` | `/api/admin/listings/:id` | Toggle active/paused or feature badge | Admin |
| `GET` | `/api/admin/orders` | Full marketplace order ledger | Admin |
| `GET` | `/api/admin/withdrawals` | Review seller payout requests | Admin |
| `POST` | `/api/admin/withdrawals/:id/review`| Process or reject seller withdrawal | Admin |
| `GET` | `/api/admin/refunds` | Review buyer dispute claims | Admin |
| `POST` | `/api/admin/refunds/:id/review` | Atomic dispute resolution & wallet refund | Admin |
| `GET` | `/api/admin/audit-logs` | Inspect immutable security audit trail | Admin |
| `GET` | `/api/admin/settings` | Retrieve configurable system rules | Admin |
| `PATCH` | `/api/admin/settings/:key` | Update platform commission & limits | Admin |
