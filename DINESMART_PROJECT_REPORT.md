# 🍽️ DineSmart OS — Project Report

## Complete Feature Documentation & Technical Architecture

**Version:** 1.0.0  
**Date:** May 2026  
**Author:** Subhra Kanta Behera  
**Repository:** [github.com/Subhra1432/Dine_Smart](https://github.com/Subhra1432/Dine_Smart)  
**Live URL:** [dine-smart-9auy.onrender.com](https://dine-smart-9auy.onrender.com)

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Customer Portal Features](#4-customer-portal-features)
5. [Staff Portal Features](#5-staff-portal-features)
6. [SuperAdmin Portal Features](#6-superadmin-portal-features)
7. [Desktop Application](#7-desktop-application)
8. [Database Design](#8-database-design)
9. [API Modules](#9-api-modules)
10. [Real-Time Engine](#10-real-time-engine)
11. [Security & Authentication](#11-security--authentication)
12. [Design System](#12-design-system)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Executive Summary

**DineSmart OS** is an ultra-premium, multi-tenant SaaS platform designed to completely digitize and modernize the restaurant industry. The platform provides an interconnected ecosystem spanning **four applications** — a Customer PWA, a Staff Command Center, a SuperAdmin Control Panel, and a Desktop Application — all kept in real-time sync via WebSockets.

### Key Highlights
- **Multi-Tenant Architecture:** Each restaurant operates in complete isolation with its own data, users, branches, and configuration
- **Real-Time Sync:** All portals update instantly via Socket.io WebSocket engine
- **AI-Powered:** Google Gemini AI integration for intelligent menu recommendations and cart upselling
- **Premium Design:** Bespoke "Saffron & Stone" industrial design system with 120fps fluid animations
- **Cross-Platform:** Web (PWA) + Desktop (Electron) support

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│  Customer    │  Staff       │  SuperAdmin  │  Desktop (Electron) │
│  PWA (:5173) │  Panel(:5174)│  Panel(:5175)│  (wraps Staff Panel)│
│  React+Vite  │  React+Vite  │  React+Vite  │  Electron v42       │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────┬──────────┘
       │              │              │                  │
       ▼              ▼              ▼                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express.js)                      │
│                     Port 4000 / 4001                             │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│   Auth   │  Orders  │  Menu    │ Billing  │  Analytics  │ AI     │
│  Module  │  Module  │  Module  │  Module  │  Module     │ Module │
├──────────┴──────────┴──────────┴──────────┴──────────────────────┤
│                   Socket.io Real-Time Engine                     │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
           ▼                                  ▼
┌────────────────────┐             ┌───────────────────┐
│   PostgreSQL       │             │   Redis (Upstash)  │
│   (Neon/Supabase)  │             │   Sessions/Cache   │
│   via Prisma ORM   │             │                    │
└────────────────────┘             └───────────────────┘
```

### Monorepo Structure

```
Dine_Smart/
├── apps/
│   ├── customer/          # Customer-facing PWA
│   ├── staff/             # Staff command center
│   ├── superadmin/        # Platform admin panel
│   └── desktop/           # Electron desktop wrapper
├── packages/
│   ├── api/               # Backend API + Prisma
│   └── shared/            # Shared types, schemas & constants
├── package.json           # Root workspace config
└── Dockerfile             # Production container
```

---

## 3. Technology Stack

### Frontend Layer

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent features |
| **Vite** | Build tool & dev server (HMR) |
| **TypeScript** | Type-safe development (strict mode) |
| **TailwindCSS** | Utility-first styling (Saffron & Stone theme) |
| **TanStack Query** | Server state management & caching |
| **Zustand** | Client-side state management |
| **Recharts** | Data visualization (charts & graphs) |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notification system |
| **Socket.io Client** | Real-time WebSocket communication |

### Backend Layer

| Technology | Purpose |
|---|---|
| **Node.js (v20+)** | Server runtime |
| **Express.js** | HTTP framework |
| **TypeScript** | Type-safe backend |
| **Prisma ORM** | Database access & migrations |
| **PostgreSQL** | Primary database (Neon/Supabase) |
| **Redis (Upstash)** | Session management & caching |
| **Socket.io** | Real-time bidirectional events |
| **BullMQ** | Background job queue (inventory) |
| **Winston** | Structured logging |

### Integrations

| Service | Purpose |
|---|---|
| **Google Gemini Pro** | AI-powered menu recommendations & upselling |
| **Cloudinary** | Image hosting & CDN delivery |
| **Render** | Cloud hosting & deployment |

### Desktop

| Technology | Purpose |
|---|---|
| **Electron v42** | Cross-platform desktop wrapper |

---

## 4. Customer Portal Features

> **URL:** `http://localhost:5173` | **Pages:** MenuPage, OrderTracking, TakeawayEntry, OfflinePage

### 4.1 Zero-Friction QR Access
- Customers scan **table-specific QR codes** to instantly access the restaurant menu
- No app download required — fully browser-based PWA
- Dedicated **Takeaway QR** for counter/takeaway orders
- URL format: `/menu/{restaurant-slug}?table={tableId}`

### 4.2 Passwordless OTP Authentication
- Secure phone-based OTP login flow
- Development bypass available (code: `123456`)
- Customer profiles auto-created on first login
- Session persistence via cookies

### 4.3 Intelligent Menu System
- Full menu browsing with **categories**, **search**, and **filters**
- **Veg/Non-Veg indicators** for dietary preferences
- **Item variants** (sizes, portions, etc.) with additional pricing
- **Add-on system** for customizations (extra cheese, toppings, etc.)
- **Special instructions** field for each item
- **Preparation time estimates** displayed per item
- Real-time **availability status** (items marked as sold out instantly)

### 4.4 AI-Powered Cart Upselling
- **Google Gemini AI** analyzes the customer's cart in real-time
- Suggests complementary items based on current selections
- Intelligent recommendation engine that improves over time

### 4.5 Live Order Tracking
- **Premium glassmorphism UI** with animated status steps
- Real-time status updates: `CONFIRMED → PREPARING → READY → SERVED`
- Per-item status tracking (individual items can be at different stages)
- **Order modification** support (add/remove items after placing, if enabled)
- Session-based tracking — no login required to track

### 4.6 Order Review & Feedback
- Post-order **star rating** system
- Per-item ratings with optional comments
- Feedback directly linked to orders for restaurant insights

### 4.7 Coupon & Discount System
- Apply promo codes at checkout
- Support for **percentage** and **flat discount** types
- Minimum order value requirements
- Real-time validation against restaurant's active coupons

---

## 5. Staff Portal Features

> **URL:** `http://localhost:5174` | **15 Pages** covering all operations

### 5.1 Business Overview Dashboard
- **8 real-time stat cards**: Today's Revenue, Active Orders, Avg Order Value, Popular Item, Pending Payments, Projected Loss, Active Sessions, Takeaway Orders
- **Revenue Growth Chart** (30-day area chart via Recharts)
- **Payment Methods Breakdown** (pie chart: Cash, UPI, Card)
- **Recent Orders Feed** with live status indicators
- Auto-refresh every 60 seconds + Socket.io instant updates

### 5.2 Billing & Payment Hub
- Comprehensive order management interface
- **Payment status tracking**: UNPAID → PAID → PARTIAL → REFUNDED
- **Multiple payment methods**: Cash, UPI, Card
- **Bill printing** with detailed breakdown:
  - Individual item prices and quantities
  - Subtotal calculation
  - **CGST** and **SGST** tax lines (customizable rates)
  - Discount applied
  - Grand Total
- **Order archival** system for historical records
- Filter by table, status, and payment status

### 5.3 Kitchen Display System (KDS)
- Real-time order queue for kitchen staff
- **Priority ordering** — urgent orders highlighted
- Per-item status management (PENDING → PREPARING → READY → SERVED)
- **Persistent audio alerts** for new orders
- Customizable notification sounds per restaurant
- Socket.io powered — zero-lag updates

### 5.4 Menu Engineering
- Full **CRUD operations** on categories and menu items
- **Drag-and-drop sorting** for categories and items
- Item properties:
  - Name, description, price
  - Image upload (via Cloudinary)
  - Veg/Non-Veg toggle
  - Preparation time
  - Tags and search keywords
  - Availability toggle
- **Variant management** (e.g., Small/Medium/Large with price adjustments)
- **Add-on management** with per-item addon assignments
- **Order count tracking** for popularity analytics

### 5.5 Table & QR Code Management
- Create and manage restaurant tables with:
  - Table number and seating capacity
  - Branch assignment
- **Automatic QR code generation** for each table
- **Dedicated Takeaway QR** code
- **Test URL override** for staging/development testing
- Occupancy tracking (occupied/available)

### 5.6 Team Management
- **Role-based user system**: OWNER, MANAGER, CASHIER, KITCHEN_STAFF
- Create, edit, and deactivate team members
- **Branch-level assignment** — staff can be scoped to specific branches
- Role-specific permissions:
  - **OWNER**: Full access to all features, all branches
  - **MANAGER**: Branch-scoped management, cannot see owner details
  - **CASHIER**: Billing and order operations only
  - **KITCHEN_STAFF**: Kitchen display access only

### 5.7 Inventory Management
- Track raw materials and supplies
- **Stock levels** with current quantity and unit
- **Minimum threshold alerts** — automatic low-stock warnings
- **Cost price tracking** for margin analysis
- **Inventory categories** for organization
- **Menu-to-inventory linking** — track which ingredients each dish uses
- **Stock history** with audit trail (who changed what and when)
- **BullMQ background jobs** for automatic stock deduction on orders

### 5.8 Analytics & Reporting
- **Revenue analytics** with date range selection
- **Top-performing items** ranking
- **Order volume trends** over time
- **Payment method distribution**
- **Table turnover rate** metrics
- Interactive charts powered by Recharts

### 5.9 Coupon Management
- Create promotional coupons with:
  - Unique coupon code
  - **Discount type**: Percentage or Flat amount
  - Discount value
  - Minimum order requirement
  - Maximum usage limit
  - Expiration date
  - Active/inactive toggle
- Track usage count vs. maximum uses

### 5.10 Customer Feedback Dashboard
- View all customer reviews aggregated
- Star ratings per order
- Per-item ratings analysis
- Comment review system

### 5.11 Tax Configuration (CGST/SGST)
- **Customizable tax rates** per restaurant
- Editable CGST and SGST percentage fields in Settings
- Rates automatically applied during order total calculation
- Tax breakdown printed on all bills/invoices
- Default rates: 2.5% CGST + 2.5% SGST = 5% total

### 5.12 Branch Network Management
- Multi-branch support within a single restaurant tenant
- Per-branch configuration:
  - **Require Order Verification**: Toggle whether orders need manual confirmation
  - **Allow Order Modification**: Toggle whether customers can modify placed orders
  - **Allow Online Payment**: Toggle payment gateway availability
- Branch-specific staff assignments
- Branch-scoped order routing

### 5.13 Branding & Customization
- **Custom banner text** for the customer-facing menu header
- **Banner image upload** (21:9 aspect ratio recommended)
- Restaurant logo management

### 5.14 Subscription Management
- View current plan status (STARTER / PREMIUM)
- Plan expiration tracking
- Subscription payment history
- Feature gating based on plan tier

### 5.15 Security Controls
- **Clear order history** with double-confirmation safety
- Token version management for session invalidation

### 5.16 Takeaway Orders
- Dedicated takeaway order flow separate from dine-in
- Customer phone/name capture for counter orders
- Takeaway-specific QR code for walk-in customers
- Takeaway orders displayed with `TA-XXXX` format IDs

---

## 6. SuperAdmin Portal Features

> **URL:** `http://localhost:5175` | Platform-level control

### 6.1 Platform Overview Dashboard
- Total restaurants count
- Active vs. pending verification restaurants
- Platform-wide metrics and health indicators

### 6.2 Restaurant (Tenant) Management
- **Onboard new restaurants** with complete setup
- Restaurant verification workflow (PENDING_VERIFICATION → ACTIVE)
- View and manage all tenant accounts
- Restaurant details:
  - Name, slug, address
  - PAN Card with document upload
  - GST Bill with document upload
  - Registration Certificate upload
- Activate/deactivate restaurants
- Manage plan assignments

### 6.3 Billing Plans Management
- Define and manage subscription tiers
- **STARTER plan**: Basic features, limited capacity
- **PREMIUM plan**: Full features, unlimited capacity
- Plan expiration and renewal management
- Payment tracking per restaurant

### 6.4 Platform Settings
- System-wide configuration
- Global defaults and overrides
- Platform maintenance controls

### 6.5 Two-Factor Authentication (2FA)
- **Mandatory TOTP-based 2FA** for all super admin actions
- Time-based One-Time Password using industry-standard algorithm
- QR code setup for authenticator apps
- Enhanced security for platform-critical operations

---

## 7. Desktop Application

> **Platform:** Windows/macOS/Linux via Electron v42

### Features
- Native desktop wrapper around the Staff Portal
- **Persistent sessions** — stays logged in across restarts
- **Auto-maximize** on launch for kiosk/POS mode
- Direct connection to production or development server
- Native menu bar with:
  - Reload / Force Reload
  - Developer Tools toggle
  - Zoom controls
  - Fullscreen toggle
- Error dialog for connection failures
- Ideal for **restaurant POS terminals** and fixed workstations

---

## 8. Database Design

### Entity-Relationship Overview

The database uses **PostgreSQL** accessed via **Prisma ORM** with **22 models** organized across the following domains:

#### Core Entities
| Model | Purpose |
|---|---|
| `SuperAdmin` | Platform administrators with 2FA |
| `Restaurant` | Multi-tenant restaurant accounts |
| `Branch` | Physical locations per restaurant |
| `User` | Staff members (Owner/Manager/Cashier/Kitchen) |
| `Table` | Physical tables with QR codes |

#### Menu Domain
| Model | Purpose |
|---|---|
| `Category` | Menu categories with sort order |
| `MenuItem` | Individual dishes with pricing |
| `MenuItemVariant` | Size/portion variants |
| `Addon` | Extra customizations |
| `MenuItemAddon` | Many-to-many addon assignments |

#### Order Domain
| Model | Purpose |
|---|---|
| `Order` | Customer orders with full lifecycle |
| `OrderItem` | Individual items within orders |
| `Payment` | Payment records with gateway IDs |
| `Customer` | Customer profiles (phone-based) |

#### Business Domain
| Model | Purpose |
|---|---|
| `InventoryCategory` | Raw material categories |
| `InventoryItem` | Stock items with thresholds |
| `MenuItemInventory` | Menu-to-inventory linking |
| `StockHistory` | Audit trail for stock changes |
| `Coupon` | Promotional discount codes |
| `LoyaltyAccount` | Customer loyalty points |
| `Review` | Order reviews and ratings |
| `Notification` | System notifications |
| `SubscriptionPayment` | Plan payment records |

### Key Enumerations
- **Role**: OWNER, MANAGER, CASHIER, KITCHEN_STAFF
- **Plan**: STARTER, PREMIUM
- **OrderType**: DINE_IN, TAKE_AWAY
- **OrderStatus**: PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED / CANCELLED
- **PaymentStatus**: UNPAID, PAID, PARTIAL, REFUNDED
- **PaymentMethod**: CASH, UPI, CARD

---

## 9. API Modules

The backend is organized into **14 focused modules**:

| Module | Responsibility |
|---|---|
| `auth` | Login, registration, JWT tokens, session management |
| `orders` | Order CRUD, status transitions, session-based ordering |
| `menu` | Public menu access, OTP verification, customer auth |
| `kitchen` | Kitchen display data, item status updates |
| `billing` | Payment processing, bill generation, print-bill endpoint |
| `analytics` | Revenue reports, order statistics, performance metrics |
| `restaurant` | Restaurant profile, branding, branch management |
| `inventory` | Stock management, threshold alerts, history tracking |
| `coupons` | Coupon CRUD, validation, usage tracking |
| `loyalty` | Points accrual, redemption, account management |
| `notifications` | Push notifications, in-app alerts |
| `superadmin` | Tenant management, platform settings, 2FA |
| `takeaway` | Takeaway-specific order flow |
| `ai` | Google Gemini integration for recommendations |

---

## 10. Real-Time Engine

### Socket.io Architecture
- **Namespace**: `/restaurant` for all restaurant operations
- **Room-based routing**: Events scoped to specific branches

### Socket Rooms
| Room | Purpose |
|---|---|
| `billing:{branchId}` | Billing page updates |
| `kitchen:{branchId}` | Kitchen display updates |
| `order:{sessionId}` | Customer order tracking |

### Key Events
| Event | Direction | Purpose |
|---|---|---|
| `order:new` | Server → Client | New order notification |
| `order:status_updated` | Server → Client | Order status change |
| `payment:confirmed` | Server → Client | Payment received |
| `item:status_updated` | Server → Client | Individual item status |
| `join:billing` | Client → Server | Join billing room |
| `join:kitchen` | Client → Server | Join kitchen room |

---

## 11. Security & Authentication

### Staff Authentication
- **JWT-based** access and refresh token system
- **HttpOnly cookies** for token storage
- **Token versioning** for forced session invalidation
- **Role-based access control** (RBAC) across all endpoints
- Branch-level permission scoping

### SuperAdmin Authentication
- **Separate JWT secret** (`JWT_SUPERADMIN_SECRET`)
- **Mandatory 2FA** via TOTP (Time-based One-Time Password)
- Enhanced session security

### Customer Authentication
- **Phone-based OTP** authentication
- **Session-based** order tracking (no persistent login required)
- Restaurant-scoped customer profiles

### Data Isolation
- **Multi-tenant isolation**: All queries scoped by `restaurantId`
- **Branch-level scoping**: Manager-level users see only their branch data
- **Cascade deletion**: Restaurant deletion cleans all related data

---

## 12. Design System

### Saffron & Stone (Industrial Intelligence)

DineSmart uses a bespoke design system with the following principles:

| Element | Implementation |
|---|---|
| **Primary Color** | Saffron (Amber) `#f59e0b` |
| **Background** | Stone-950 `#0c0a09` (dark) / White (light) |
| **Typography** | System fonts with Black weight (900), tight tracking |
| **Cards** | Glassmorphism with `backdrop-blur` and `bg-white/50` |
| **Borders** | Ultra-subtle `border-white/5` (dark) |
| **Animations** | CSS transforms with `cubic-bezier(0.16, 1, 0.3, 1)` |
| **Transitions** | 700ms default with fade-in + slide/zoom entry |
| **Hover States** | Scale transforms with color transitions |
| **Active States** | `active:scale-95` for tactile feedback |
| **Rounded** | Ultra-rounded corners: `rounded-[2.5rem]` to `rounded-[4rem]` |

### Component Library
- `glass-card` — Frosted glass card component
- `glass-button` — Premium action button
- `glass-panel` — Larger panel container
- `premium-toggle` — Custom toggle switch
- `PageLoader` — Full-screen loading animation

---

## 13. Deployment Architecture

### Production Stack (Render)
```
┌─────────────────────────────────────────────┐
│              Render.com                      │
│  ┌───────────────────────────────────────┐   │
│  │  Docker Container                     │   │
│  │  ┌─────────┐  ┌────────────────────┐  │   │
│  │  │  API    │  │  Static Files      │  │   │
│  │  │ Express │  │  Customer / Staff  │  │   │
│  │  │ :4000   │  │  SuperAdmin builds │  │   │
│  │  └────┬────┘  └────────────────────┘  │   │
│  └───────┼───────────────────────────────┘   │
│          │                                   │
└──────────┼───────────────────────────────────┘
           │
     ┌─────┴──────┐      ┌──────────────┐
     │ PostgreSQL │      │    Redis     │
     │ (Supabase) │      │  (Upstash)   │
     └────────────┘      └──────────────┘
```

### Build Pipeline
```bash
npm install          # Install all workspace deps
npm run build:shared # Build shared types package
npm run build:api    # Compile TypeScript API
npm run build:customer   # Vite build customer PWA
npm run build:staff      # Vite build staff panel
npm run build:superadmin # Vite build admin panel
npm run start:prod   # Start production Express server
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection (pooled) |
| `DIRECT_URL` | Direct DB connection (migrations) |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Access token signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `JWT_SUPERADMIN_SECRET` | SuperAdmin token key |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `CLOUDINARY_URL` | Image CDN configuration |
| `QR_CODE_BASE_URL` | Base URL for QR code generation |

---

## 14. Future Roadmap

| Feature | Priority | Status |
|---|---|---|
| Online payment gateway (Razorpay/Stripe) | High | Planned |
| Push notifications (FCM) | Medium | Planned |
| Multi-language menu support | Medium | Planned |
| Customer loyalty app | Low | Backlog |
| Advanced AI analytics | Low | Backlog |
| WhatsApp order updates | Medium | Planned |
| Reservation system | Low | Backlog |

---

## 📊 Project Statistics

| Metric | Value |
|---|---|
| **Total Applications** | 4 (Customer, Staff, SuperAdmin, Desktop) |
| **API Modules** | 14 |
| **Database Models** | 22 |
| **Staff Pages** | 15 |
| **Customer Pages** | 4 |
| **SuperAdmin Pages** | 5 |
| **User Roles** | 4 (Owner, Manager, Cashier, Kitchen Staff) |
| **Order Statuses** | 7 |
| **Payment Methods** | 3 (Cash, UPI, Card) |

---

**Copyright © 2024-2026 DineSmart. All Rights Reserved.**  
**PROPRIETARY AND CONFIDENTIAL**
