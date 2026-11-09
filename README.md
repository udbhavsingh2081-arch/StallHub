# FoodStallHub (MVC Architecture)

FoodStallHub is a multi-tenant digital menu management platform for independent food stalls, restaurants, and street food vendors. Every stall operates independently with its own menu, custom theme, and permanent QR code, while the platform owner manages all stalls from a centralized Super Admin dashboard.

---

## 1. MVC Architecture Overview

The application is structured strictly following the **Model-View-Controller (MVC)** architectural pattern:

```
foodstall/
├── prisma/
│   ├── schema.prisma           # Database schema (PostgreSQL + Prisma)
│   ├── seed.js                 # Database seeder (Super Admin, Demo Stall, Categories, Items)
│   └── migrations/             # Applied database migrations
├── src/
│   ├── models/                 # [M] MODEL LAYER - Data access, tenant scoping & business rules
│   │   ├── UserModel.js        # User auth, roles (SUPER_ADMIN, STALL_OWNER, STALL_STAFF)
│   │   ├── StallModel.js       # Stall CRUD, status (ACTIVE, SUSPENDED), slug generation
│   │   ├── CategoryModel.js    # Food categories, sort order, deletion safeguards
│   │   ├── FoodItemModel.js    # Food items, veg/non-veg/egg, discount prices, variants
│   │   ├── ThemeModel.js       # Customization engine (LUXURY, MINIMAL, STREET_FOOD, FRESH)
│   │   ├── PublicationModel.js # Draft vs. Published snapshot engine & rollback
│   │   ├── QRModel.js          # QR code generation & customization
│   │   ├── AnalyticsModel.js   # Unique visitor fingerprinting, views & QR scan trends
│   │   └── AuditLogModel.js    # Immutable platform & tenant audit trails
│   │
│   ├── views/                  # [V] VIEW LAYER - Client presentation & response formatting
│   │   ├── templates/          # Responsive HTML / CSS mobile-first web views
│   │   │   ├── publicMenu.js   # Customer digital menu with Veg/Non-Veg filter chips & themes
│   │   │   ├── qrPoster.js     # Print-ready A4 QR poster generator (@media print)
│   │   │   ├── stallUnavailable.js # Suspended/inactive stall view
│   │   │   └── portalLanding.js# Platform gateway & dashboard launcher
│   │   └── presenters/         # JSON DTO presenters (currency conversions, sanitization)
│   │       └── Presenter.js
│   │
│   ├── controllers/            # [C] CONTROLLER LAYER - Request orchestration & HTTP handlers
│   │   ├── authController.js       # Session login, logout, me
│   │   ├── superAdminController.js # Multi-stall management, owners, analytics, audit logs
│   │   ├── stallAdminController.js # Stall profile, dashboard overview
│   │   ├── menuController.js       # Categories, items, variants, instant availability
│   │   ├── themeController.js      # Themes, colors, typography, presets
│   │   ├── publicationController.js# Snapshot publishing, unpublishing, rollback
│   │   ├── qrController.js         # QR details, PNG download, SVG download
│   │   ├── teamController.js       # Staff roles & permissions
│   │   ├── analyticsController.js  # Stall visitor analytics
│   │   └── publicMenuController.js # Public customer menu JSON & HTML rendering
│   │
│   ├── routes/                 # ROUTE DEFINITIONS
│   │   ├── auth.js             # /api/auth/...
│   │   ├── admin.js            # /api/admin/...
│   │   ├── stall.js            # /api/stall/... (and /api/shop/...)
│   │   ├── publicMenu.js       # /api/public/menu/...
│   │   └── web.js              # /, /portal, /menu/:slug, /menu/:slug/poster
│   │
│   ├── middleware/             # SECURITY & TENANCY
│   │   ├── auth.js             # Session authentication & role verification
│   │   └── errors.js           # 404 & global exception handling
│   │
│   ├── services/               # REUSABLE SERVICES
│   │   └── qrService.js        # High-density QR code buffer & SVG generator
│   │
│   ├── db.js                   # Supabase PostgreSQL Pool & Prisma Client
│   ├── app.js                  # Express application setup
│   └── server.js               # HTTP server listener
```

---

## 2. Default Seed Credentials

Run `npm run db:seed` to populate the database with default accounts:

| Role | Email | Password | Assigned Stall |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@foodstallhub.com` | `ChangeThisPassword123!` | Platform Owner (all stalls) |
| **Stall Owner** | `owner@pizzacorner.com` | `StallOwnerPass123!` | Pizza Corner (`pizza-corner`) |
| **Stall Staff** | `chef@pizzacorner.com` | `StaffPass123!` | Pizza Corner (`pizza-corner`) |

---

## 3. Web Views & Customer Experience

- **Portal Gateway**: `http://localhost:5000/portal`
- **Customer Mobile Menu**: `http://localhost:5000/menu/pizza-corner`
- **Printable QR Poster**: `http://localhost:5000/menu/pizza-corner/poster`
- **Live Draft Preview**: `http://localhost:5000/menu/pizza-corner/preview`

---

## 4. Key Functional Features Implemented

1. **Dietary Indicators & Variants**:
   - Items support `foodType: VEG`, `NON_VEG`, and `EGG` with standard visual indicators.
   - Size/portion variants (e.g. Regular, Medium, Large) with independent prices.
   - One-click instant availability toggle (`PATCH /api/stall/items/:id/availability`).
2. **Customization Engine (Themes)**:
   - 4 pre-built templates: `LUXURY`, `MINIMAL`, `STREET_FOOD`, `FRESH`.
   - Independent primary/secondary colors, background, typography, and card layouts.
3. **Draft vs. Published Snapshot Engine**:
   - Editing menus or themes saves drafts without altering what customers see.
   - Explicit `POST /api/stall/publish` creates an immutable versioned snapshot.
   - Instant rollback to previous versions if needed (`POST /api/stall/publications/rollback`).
4. **Permanent QR Codes**:
   - Permanent slug-based URLs: changing prices or design never invalidates existing QR codes.
   - On-the-fly download as high-resolution PNG (`/api/stall/qr/download/png`) and SVG (`/api/stall/qr/download/svg`).
   - Built-in printable A4 QR poster view with scan CTAs.
5. **Multi-Tenant Security & Tenant Isolation**:
   - Session-based authentication stored in PostgreSQL (`connect-pg-simple`).
   - Every request is scoped to `req.stallId` on the server side. Stall owners cannot view or mutate another stall's records.

---

## 5. Development & Deployment

### Run Locally
```powershell
npm run dev
```

### Validate & Seed Database
```powershell
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```
