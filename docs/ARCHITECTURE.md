# SubVault - Technical Architecture & Engineering Design

## 1. System Overview
SubVault is an institutional-grade, peer-to-peer digital subscription exchange platform tailored for the Indian digital ecosystem. It implements:
- **Zero Trust Security**: Strict Role-Based Access Control (RBAC) across all protected APIs and WebSocket gateways.
- **Atomic Financial Transactions**: PostgreSQL serializable database transactions guaranteeing immutable wallet ledger integrity.
- **Cryptographic Access Control**: Hardware-level AES-256-GCM encryption of sensitive digital access credentials at rest.
- **Decoupled Architecture**: Clean separation between Next.js (Edge-ready App Router) frontend and NestJS enterprise backend.

---

## 2. Monorepo Structure
```
c:/ott/
├── apps/
│   ├── api/                     # NestJS 11 REST API & WebSocket Gateways
│   │   ├── src/
│   │   │   ├── common/          # Global filters, interceptors, guards, crypto
│   │   │   ├── modules/         # Modular enterprise architecture
│   │   │   │   ├── auth/        # JWT auth, OTP verification, password hashing
│   │   │   │   ├── users/       # User management & account locks
│   │   │   │   ├── sellers/     # Merchant profiles & dashboards
│   │   │   │   ├── seller-applications/ # Onboarding requests
│   │   │   │   ├── categories/  # OTT, AI, Creative taxonomies
│   │   │   │   ├── listings/    # Indexed queries, inventory slots
│   │   │   │   ├── cart/        # Real-time stock revalidation
│   │   │   │   ├── wallet/      # Immutable double-entry ledger
│   │   │   │   ├── payments/    # Razorpay orders, webhooks & simulator
│   │   │   │   ├── orders/      # 17-step atomic purchase flow
│   │   │   │   ├── withdrawals/ # Merchant UPI payout requests
│   │   │   │   ├── chat/        # Socket.IO authenticated channels
│   │   │   │   ├── notifications/ # Real-time event dispatches
│   │   │   │   ├── reviews/     # Verified buyer feedback & rating math
│   │   │   │   ├── refunds/     # 48h buyer dispute mediation
│   │   │   │   └── admin/       # Complete platform control panel
│   │   │   └── main.ts          # Helmet, CORS, Swagger bootstrap
│   └── web/                     # Next.js 15 App Router Frontend
│       ├── src/
│       │   ├── app/             # App router pages & layouts
│       │   ├── components/      # UI, Navbar, Footer, Drawers, Cards
│       │   └── lib/             # API client, auth context, cart context, sockets
├── packages/
│   ├── types/                   # Shared TypeScript models & enums
│   └── config/                  # Platform fees, category constants
├── prisma/
│   ├── schema.prisma            # Normalized PostgreSQL relational schema
│   ├── seed.ts                  # Production-like realistic development seed
│   └── crypto.ts                # AES-256-GCM encryption utility
└── docs/                        # Architecture, setup, security checklists
```

---

## 3. Relational Schema & Database Design
The platform is backed by PostgreSQL 18 managed through Prisma ORM with indexed foreign keys, unique constraints, and strict enum definitions:

- **User**: Central identity with PBKDF2 password hashes, OTP expiration, account lock counters.
- **SellerProfile**: Merchant identity, dynamic ratings, completed sales count, UPI / Bank information.
- **SellerApplication**: Multi-tier onboarding with admin review lifecycle (PENDING -> APPROVED -> REJECTED).
- **Category & Platform**: Hierarchical taxonomy (Netflix, Disney+ Hotstar, ChatGPT Plus, Canva Pro, Spotify, NordVPN).
- **Listing & ListingInventory**: Subscription listings with isolated `ListingInventory` items containing AES-256 encrypted access credentials.
- **Wallet & WalletTransaction**: Immutable ledger (CREDIT, DEBIT, REFUND, ADJUSTMENT) with balance-after audit verification.
- **SellerWallet & SellerEarning**: Separate merchant wallet isolating earnings from buyer balances.
- **Order & OrderItem**: Encrypted delivery payloads, platform commission (10%) splits, and status tracking.
- **Chat & Message**: Order-linked real-time chat threads between buyer and seller.
- **Refund**: Dispute claims with admin approval triggering atomic balance rollbacks.
- **AuditLog**: Append-only log recording actor, IP, timestamp, action, and JSON metadata.

---

## 4. The 17-Step Atomic Purchase Flow
When a buyer purchases an active subscription, NestJS executes a single serializable database transaction:
1. Validates buyer identity and locks buyer wallet row.
2. Verifies listing status is `ACTIVE`.
3. Verifies merchant status is `APPROVED`.
4. Fetches available unassigned `ListingInventory` slot.
5. Verifies buyer wallet balance >= listing price.
6. Debits buyer wallet balance and increments `totalSpent`.
7. Generates unique order number (`#SUB-ORD-...`).
8. Creates `Order` with encrypted delivery data.
9. Creates `OrderItem` record.
10. Marks inventory slot `isAssigned = true` and binds to `order.id`.
11. Decrements listing available stock (marks `SOLD_OUT` if zero).
12. Calculates 10% platform commission and 90% merchant earning.
13. Creates `SellerEarning` record.
14. Credits `SellerWallet` available earnings.
15. Creates immutable `WalletTransaction` DEBIT entry.
16. Dispatches real-time notifications to buyer and seller.
17. Creates authenticated Socket.IO chat room between buyer and seller.
*(Any error triggers a full transaction ROLLBACK).*
