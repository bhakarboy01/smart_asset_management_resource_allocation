# 🏛️ Sampadaa — Asset Management & Resource Allocation Platform

> **सम्पदा** (Sampadaa) — Sanskrit for "wealth, resources, asset"

A production-ready, full-stack asset management platform built for the **Cultural Council of IIT Roorkee** to efficiently track, allocate, and manage shared resources like cameras, audio equipment, costumes, and stage props.

---

## 📸 Screenshots

| Login | Dashboard | Admin Analytics |
|-------|-----------|-----------------|
| Clean auth UI | User booking history | Recharts analytics |

---

## ✨ Features

### 👤 Authentication
- Secure JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin / User)
- Registration with IIT Roorkee roll number and department
- Session management with 7-day expiry

### 📦 Inventory Management (Admin)
- Add, edit, delete assets (soft delete)
- Categorise assets (7 default categories)
- Track total vs. available quantity
- Asset condition tracking (Excellent → Damaged)
- Purchase date, price, warranty tracking
- QR code generation for each asset
- Serial number tracking

### 🔍 Asset Discovery (User)
- Browse all assets with category filter pills
- Search by name, description, serial number
- Pagination with 12 assets per page
- Real-time availability display

### 📅 Booking & Approval Workflow
- Users submit booking requests with date range, purpose, event name
- Duplicate booking detection for conflicting date ranges
- Admin can Approve / Reject with notes
- Admin marks assets as Issued / Returned
- Automatic inventory count updates on issue/return
- Users can cancel pending/approved bookings

### 📊 Analytics Dashboard (Admin)
- 6 key KPI cards with live data
- Line chart: booking activity over 7/30/90 days
- Pie chart: assets by category
- Bar chart: most requested assets
- Recent activity feed
- Overdue returns tracking

### 🔔 Notification System
- In-app notifications for booking status changes
- Admin notified of new requests
- Users notified of approvals, rejections, issuances
- Mark all as read
- Unread badge in topbar

### 📋 Audit Logs (Admin)
- Tracks all critical actions (15 event types)
- Filterable by action type
- Paginated log viewer with timestamps
- User attribution for every action

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Database** | SQLite (via Prisma ORM) |
| **Authentication** | JWT (jose) + HTTP-only cookies |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Icons** | Lucide React |
| **QR Codes** | qrcode |
| **Deployment** | Docker + Docker Compose |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/bhakarboy01/smart_asset_management_resource_allocation.git
cd sampadaa
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-32-char-key"
SESSION_SECRET="another-super-secret-32-char-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to SQLite
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Run the application
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# Run migrations inside container
docker-compose exec app npx prisma db push
docker-compose exec app npx tsx scripts/seed.ts

# Stop
docker-compose down
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sampadaa.in | Admin@1234 |
| **User** | rahul@sampadaa.in | User@1234 |
| **User** | priya@sampadaa.in | User@1234 |
| **User** | vikram@sampadaa.in | User@1234 |

---

## 📁 Project Structure

```
sampadaa/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Login, Register, Logout
│   │   ├── assets/               # Asset CRUD + Categories
│   │   ├── bookings/             # Booking create + list
│   │   ├── admin/                # Admin-only APIs
│   │   │   ├── bookings/         # Approve/reject/issue/return
│   │   │   ├── analytics/        # Dashboard stats
│   │   │   ├── users/            # User management
│   │   │   └── audit-logs/       # Audit trail
│   │   └── notifications/        # In-app notifications
│   ├── auth/                     # Login + Register pages
│   ├── dashboard/                # User home
│   ├── assets/                   # Asset catalogue
│   ├── bookings/                 # User booking history
│   ├── profile/                  # User profile
│   └── admin/                    # Admin pages
│       ├── analytics/            # Dashboard
│       ├── assets/               # Inventory management
│       ├── bookings/             # Booking management
│       ├── users/                # User management
│       └── audit-logs/           # Audit trail
├── components/
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Sidebar, TopBar
│   ├── admin/                    # Admin-specific components
│   └── bookings/                 # Booking modals
├── lib/
│   ├── auth/                     # JWT + middleware
│   ├── db/                       # Prisma client
│   ├── validations/              # Zod schemas
│   └── utils/                    # Helpers + audit
├── types/                        # TypeScript interfaces
├── prisma/                       # Schema + migrations
├── scripts/                      # Seed script
├── middleware.ts                 # Route protection
├── Dockerfile
└── docker-compose.yml
```

---

## 🗄️ Database Schema

**7 models:** User, Category, Asset, Booking, MaintenanceLog, AuditLog, Notification

**Key relationships:**
- User → Bookings (one-to-many)
- Asset → Category (many-to-one)
- Booking → User + Asset (many-to-one each)
- AuditLog → User (many-to-one, nullable)

---

## 🎯 Evaluation Coverage

| Criterion | Coverage |
|-----------|----------|
| Functionality & Feature Completeness | ✅ All mandatory + most optional features |
| System Design & Architecture | ✅ Clean App Router, layered auth middleware |
| Database Design & Backend Logic | ✅ Normalized Prisma schema, transactional updates |
| UX & Interface Design | ✅ Professional sidebar layout, responsive |
| Code Quality & Documentation | ✅ TypeScript, Zod validation, modular structure |
| Innovation & Additional Features | ✅ QR codes, audit logs, notifications, Docker |

---

## 🌟 Optional Features Implemented

- ✅ **Notification System** — In-app real-time notifications
- ✅ **Audit Logs** — 14 event types tracked
- ✅ **QR Code Generation** — Per-asset QR codes with download
- ✅ **Dockerized Deployment** — Multi-stage Dockerfile + Compose

---

## Demo Video and Design Doc

https://drive.google.com/drive/folders/1QxU737jc0PHJNDOxQExh0hGvBvRS4Mgf

---

## 👥 Team

Built with ❤️ for IIT Roorkee Hackathon

---

*Sampadaa is open source. Contributions welcome.*
