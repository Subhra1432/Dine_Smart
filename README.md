---
title: DineSmart
emoji: 🍽️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# DineSmart OS

> **Complete multi-tenant SaaS Restaurant Operating System**

Customer scans QR → orders digitally → system manages everything automatically.

## Latest Features (v1.1)

- **Automatic Kitchen Oversight**: Managers/Owners can now supervise all branches from a single unified Kitchen Display with real-time multi-branch socket updates.
- **AI Order Estimation**: Smart calculation of "Time to Finish" for customers based on current kitchen load and average item preparation times.
- **Cumulative Billing**: Cashiers can now generate a single "Daily Summary Bill" that aggregates all orders a customer placed throughout the day.
- **Offer Discovery**: A dedicated "Special Offers" section in the digital menu allows customers to browse and apply active coupons instantly.

## Architecture

```
d:\DineSmart\
├── packages/
│   ├── shared/        # @dinesmart/shared — Types, schemas, constants
│   └── api/           # @dinesmart/api — Express + Prisma + Socket.io
├── apps/
│   ├── customer/      # React PWA — Customer menu & ordering
│   ├── staff/         # React SPA — Billing, Kitchen, Admin dashboard
│   └── superadmin/    # React SPA — Platform management
├── docker-compose.yml # PostgreSQL + Redis
└── Dockerfile.api     # API container
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **API** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Cache & Pub/Sub** | Redis 7 + ioredis |
| **Real-time** | Socket.io with Redis adapter |
| **Auth** | JWT (httpOnly cookies) + bcrypt |
| **Validation** | Zod schemas (shared) |
| **Job Queue** | BullMQ (inventory, notifications, reports) |
| **Frontend** | React 18, Vite, Vanilla CSS, Zustand |
| **Charts** | Recharts |
| **PWA** | vite-plugin-pwa + Workbox |

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm 9+

### 2. Start Infrastructure

```bash
docker compose up -d
```

This launches PostgreSQL (port 5432) and Redis (port 6379).

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your secrets
```

### 5. Setup Database

```bash
cd packages/api
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 6. Start Development

```bash
# Terminal 1 — API
npm run dev --workspace=@dinesmart/api

# Terminal 2 — Customer PWA
npm run dev --workspace=@dinesmart/customer

# Terminal 3 — Staff Panel
npm run dev --workspace=@dinesmart/staff

# Terminal 4 — Super Admin
npm run dev --workspace=@dinesmart/superadmin
```

| Service | URL |
|---------|-----|
| API | http://localhost:4000 |
| Customer PWA | http://localhost:5173 |
| Staff Panel | http://localhost:5174 |
| Super Admin | http://localhost:5175 |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@dinesmart.app | superadmin123 |
| Owner | owner@spicegarden.com | owner123 |
| Manager | manager@spicegarden.com | manager123 |
| Cashier | cashier@spicegarden.com | cashier123 |
| Kitchen | kitchen@spicegarden.com | kitchen123 |

## API Endpoints (v1.1 Highlights)

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/menu/public/:slug` | Get restaurant menu |
| GET | `/api/v1/coupons/active-for-customer` | **NEW:** Show active offers |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders/:sessionId` | Track order (with AI estimates) |
| POST | `/api/v1/orders/reviews` | Submit review |

### Billing & Kitchen
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/customer-summary-bill` | **NEW:** Consolidated daily bill |
| POST | `/api/v1/billing/orders/:id/print-bill` | Single order bill |
| GET | `/api/v1/kitchen/orders` | **HEAVILY UPDATED:** Automatic multi-branch oversight |
| PUT | `/api/v1/kitchen/order-items/:id/status` | Update item status |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `order:new` | Server→Client | New order placed |
| `order:status_updated` | Server→Client | Order status changed |
| `payment:confirmed` | Server→Client | Payment received |
| `table:occupied` | Server→Client | Table now occupied |

## Subscription Plans

| Feature | Starter (₹999) | Growth (₹2,499) | Premium (₹7,499) |
|---------|:-:|:-:|:-:|
| Branches    | 2  |  5 | Unlimited |
| Tables      | 20 | 50 | Unlimited |
| AI Features | ❌ | ✅ | ✅ |
| Inventory   | ❌ | ❌ | ✅ |
| Analytics   | ❌ | ✅ | ✅ |

## License

Proprietary — All rights reserved.
