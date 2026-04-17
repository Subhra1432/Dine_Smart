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
| **Frontend** | React 18, Vite, TailwindCSS, Zustand |
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

## API Endpoints

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/menu/public/:slug` | Get restaurant menu |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders/:sessionId` | Track order |
| POST | `/api/v1/orders/:orderId/payment/initiate` | Initiate payment |
| POST | `/api/v1/orders/payment/webhook` | Razorpay webhook |
| POST | `/api/v1/orders/reviews` | Submit review |
| POST | `/api/v1/coupons/validate` | Validate coupon |
| GET | `/api/v1/ai/recommendations` | AI recommendations |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register restaurant |
| POST | `/api/v1/auth/login` | Staff login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |

### Billing (OWNER, MANAGER, CASHIER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/billing/tables` | Table overview |
| GET | `/api/v1/billing/orders` | Filtered orders |
| PUT | `/api/v1/billing/orders/:id/status` | Update status |
| PUT | `/api/v1/billing/orders/:id/payment` | Record payment |
| POST | `/api/v1/billing/orders/:id/print-bill` | Generate bill |
| POST | `/api/v1/billing/orders/:id/refund` | Process refund |

### Kitchen (KITCHEN_STAFF, MANAGER, OWNER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/kitchen/orders` | Active orders |
| PUT | `/api/v1/kitchen/order-items/:id/status` | Update item status |

### Analytics (OWNER, MANAGER)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/overview` | Dashboard |
| GET | `/api/v1/analytics/revenue` | Revenue data |
| GET | `/api/v1/analytics/menu-performance` | Best/slow sellers |
| GET | `/api/v1/analytics/peak-hours` | Peak hours heatmap |
| GET | `/api/v1/analytics/table-performance` | Table stats |
| GET | `/api/v1/analytics/customers` | Customer analytics |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/superadmin/restaurants` | All restaurants |
| PUT | `/api/v1/superadmin/restaurants/:id/plan` | Change plan |
| PUT | `/api/v1/superadmin/restaurants/:id/suspend` | Toggle suspend |
| GET | `/api/v1/superadmin/stats` | Platform stats |
| POST | `/api/v1/superadmin/restaurants/:id/impersonate` | Impersonate |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `order:new` | Server→Client | New order placed |
| `order:status_updated` | Server→Client | Order status changed |
| `order:item_status_updated` | Server→Client | Individual item status |
| `payment:confirmed` | Server→Client | Payment received |
| `inventory:low_stock` | Server→Client | Stock below threshold |
| `table:occupied` | Server→Client | Table now occupied |
| `table:freed` | Server→Client | Table freed |

## Subscription Plans

| Feature | Starter (₹999) | Growth (₹2,499) | Premium (₹7,499) |
|---------|:-:|:-:|:-:|
| Branches    | 2  |  5 | Unlimited |
| Tables      | 20 | 50 | Unlimited |
| AI Features | ❌ | ✅ | ✅ |
| Inventory   | ❌ | ❌ | ✅ |
| Analytics   | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ✅ |

## License

Proprietary — All rights reserved.
