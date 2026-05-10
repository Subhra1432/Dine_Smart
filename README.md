---
title: Dine_Smart
emoji: 🍽️
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# 🍽️ DineSmart OS: Next-Gen Restaurant Intelligence Platform

![DineSmart Banner](https://via.placeholder.com/1200x400/1c1917/f59e0b?text=DineSmart+OS)

DineSmart OS is an ultra-premium, multi-tenant SaaS architecture designed to digitize and elevate the modern hospitality industry. Built with a stunning **Saffron & Stone (Industrial)** design system, DineSmart provides an interconnected ecosystem for customers, staff, and system administrators with a focus on 120fps fluid animations, robust real-time synchronization, and AI-powered intelligence.

---

## ✨ Ecosystem Overview

DineSmart operates across three specialized, interconnected portals, all kept in perfect sync via a robust WebSockets engine and centralized PostgreSQL database.

### 📱 1. Customer Portal (PWA)
A high-performance, mobile-first web application designed for frictionless ordering:
*   **Zero-Friction Access**: Customers scan table-specific QR codes to instantly access the menu.
*   **Passwordless Authentication**: Secure OTP-based login flow.
*   **Intelligent Upselling**: Google Gemini AI analyzes carts and suggests complementary items in real-time.
*   **Deep Customization**: Support for complex item variants, addons, and special instructions.
*   **Live Tracking**: Customers track their order status from kitchen preparation to table delivery.

### 👨‍🍳 2. Staff Portal (Command Center)
A centralized, high-speed management interface for restaurant employees:
*   **Kitchen Display System (KDS)**: Real-time order tracking with prioritized urgent orders and persistent audio alerts.
*   **Table Management**: Live occupancy tracking and instant QR code generation for spatial anchors.
*   **Menu Engineering**: Dynamic, drag-and-drop control over categories, items, and inventory.
*   **Financial Hub**: Integrated billing, payment status tracking, and end-of-day reconciliation.
*   **Real-time Analytics**: Detailed reporting on revenue, top-performing items, and operational efficiency.

### 🛡️ 3. SuperAdmin Portal (Platform Control)
The master control center for SaaS operators and platform administrators:
*   **Tenant Management**: Onboard new restaurants, generate tenant API keys, and manage existing accounts.
*   **Subscription & Billing**: Manage service tiers (Starter vs. Premium) and feature gating.
*   **System Telemetry**: View platform-wide performance, database health, and growth metrics.
*   **Enhanced Security**: Mandatory Two-Factor Authentication (2FA) via TOTP for all super admin actions.

---

## 🛠️ Technology Stack

DineSmart is built on a modern, type-safe monorepo architecture:

### Frontend Layer
*   **Framework**: React 18 + Vite
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: TailwindCSS (Saffron & Stone theme)
*   **State Management**: TanStack Query (Server State), Zustand (Local State)
*   **Motion**: Native CSS Transforms for 120fps fluid UI
*   **Icons**: Lucide React

### Backend Layer
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL (Neon/Supabase) via **Prisma ORM**
*   **Caching & Sessions**: Redis (Upstash)
*   **Real-time Engine**: Socket.io

### Integrations
*   **AI**: Google Gemini Pro (Menu recommendations & upselling)
*   **Storage**: Cloudinary (High-performance asset delivery)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   PostgreSQL Database
*   Redis Instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Subhra1432/Dine_Smart.git
   cd Dine_Smart
   ```

2. **Install monorepo dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy the example environment file in the API package and populate it.
   ```bash
   cp packages/api/.env.example packages/api/.env
   ```

4. **Initialize Database:**
   ```bash
   cd packages/api
   npx prisma migrate dev
   npx prisma db seed
   ```
   *Note: Seeding creates the initial SuperAdmin account and a demo restaurant tenant.*

### Running Locally

Start all services simultaneously from the root directory using the monorepo scripts:
```bash
npm run dev
```

Alternatively, you can run services individually:
*   `npm run dev:api` — Backend API (Port 4000/4001)
*   `npm run dev:customer` — Customer PWA (Port 5173)
*   `npm run dev:staff` — Staff Portal (Port 5174)
*   `npm run dev:superadmin` — SuperAdmin Portal (Port 5175)

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Primary PostgreSQL connection string |
| `DIRECT_URL` | Direct database URL for Prisma migrations |
| `REDIS_URL` | Connection string for Redis session management |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `JWT_SUPERADMIN_SECRET` | Secret key for SuperAdmin specific tokens |
| `GEMINI_API_KEY` | API key for Google Gemini AI integrations |
| `CLOUDINARY_URL` | Configuration for image asset management |

---

## 💎 Design Philosophy: Saffron & Stone

DineSmart OS rejects generic UI in favor of a bespoke **Industrial Intelligence** aesthetic:
*   **Fluid Motion**: All animations use optimized `transition-transform` and custom cubic-bezier curves `cubic-bezier(0.16, 1, 0.3, 1)` to achieve an ultra-smooth, 120fps feel.
*   **Deep Contrast**: Heavy use of Stone-950 and White contrasts, accented by vibrant Saffron (Amber/Primary) highlights.
*   **Glassmorphism**: Subtle background blurs (`backdrop-blur`) layered over dynamic backgrounds.
*   **Micro-interactions**: Hover scaling, active states, and focus rings provide constant tactile feedback.

---

## 📄 License

**PROPRIETARY AND CONFIDENTIAL**

This project, including all of its source code, design assets, and documentation, is strictly proprietary software. **All rights reserved.**

**WARNING:** No individual, organization, or entity is permitted to use, copy, modify, distribute, or reverse-engineer any part of this software under any circumstances. Unauthorized use, reproduction, or distribution of this code, in whole or in part, is strictly prohibited and will be met with immediate and severe legal action.

Copyright (c) 2024-2026 DineSmart.
