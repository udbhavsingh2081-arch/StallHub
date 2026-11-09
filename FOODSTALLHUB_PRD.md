# FoodStallHub Product Requirements Document (PRD)

## 1. Product Vision
FoodStallHub aims to simplify digital menu management for multiple independent food businesses.
Currently, food stall owners often rely on printed menus, PDFs, WhatsApp images or manually updated menu links. Updating prices, changing food availability or redesigning a menu can be inconvenient.

FoodStallHub solves this by providing:
- One central platform for managing multiple food stalls.
- Separate admin dashboards for every stall.
- Independent menu management and customization.
- Public digital menu websites.
- Unique QR codes for each stall.
- Instant menu updates without reprinting QR codes.

**Core product principle:** Every stall operates independently, but the platform administrator manages everything from one central dashboard.

---

## 2. Problem Statement
The platform addresses five primary problems:

| Problem | FoodStallHub Solution |
| :--- | :--- |
| Printed menus are difficult to update | Digital menu management |
| Different stalls need different menus | Independent stall workspaces |
| Price updates require redesigning menus | Edit prices directly |
| Owners want their own branding | Individual menu customization |
| Customers need easy menu access | QR-based public menu |

---

## 3. Product Scope

### Included in Version 1.0
- Multi-stall management
- Admin dashboards (Super Admin & Stall Admin)
- Menu management
- Customization & Theme engine
- QR menus & poster generation
- Public mobile-first websites

### Explicitly Excluded from Version 1.0
- Online food ordering
- Cart and checkout
- Payment gateway
- Delivery management
- Customer accounts
- Restaurant marketplace

*Customers will browse menus and see food information. They will not place orders through FoodStallHub.*

---

## 4. User Roles and Permissions
The application has four user types:

### 4.1 Super Admin
The Super Admin is the platform owner.
**Responsibilities:**
- Create and manage stalls.
- Create and invite stall owners.
- View all registered stalls.
- Access stall information.
- Suspend or reactivate stalls.
- Manage platform-level settings.
- Monitor platform analytics.
- Manage subscription plans when introduced.

### 4.2 Stall Owner
Every stall owner gets an independent admin dashboard.
**Responsibilities:**
- Manage stall information.
- Upload logo and cover image.
- Add, edit and delete food categories.
- Add and edit food items.
- Manage food prices.
- Upload food photos.
- Change availability.
- Customize the public menu.
- Preview and publish the menu.
- Generate and download QR codes.
- View menu analytics.

### 4.3 Stall Staff
Staff accounts are optional and can be introduced with role-based permissions:

| Permission | Owner | Manager | Staff |
| :--- | :--- | :--- | :--- |
| View menu | Yes | Yes | Yes |
| Add food items | Yes | Yes | Optional |
| Edit prices | Yes | Yes | No |
| Manage categories | Yes | Yes | No |
| Customize menu | Yes | No | No |
| Manage staff | Yes | No | No |
| Delete stall | No | No | No |

*Stall deletion and platform-level suspension remain Super Admin responsibilities.*

### 4.4 Customer
Customers do not need an account. They can:
- Scan a QR code.
- Open the stall's public menu.
- View stall details.
- Browse food categories.
- View food photos and prices.
- See vegetarian/non-vegetarian/egg indicators.
- See food availability.
- View business contact information.
- Open the stall's social media links.

---

## 5. Complete Page-by-Page Application Structure

### A. Super Admin Panel (`/super-admin`)
- `/login`: Secure login
- `/super-admin/dashboard`: Platform overview (Total stalls, active/suspended, owners, menu items, visits, recent activity)
- `/super-admin/stalls`: Manage all stalls
- `/super-admin/stalls/new`: Register new stall
- `/super-admin/stalls/:id`: View stall details
- `/super-admin/owners`: Manage owner accounts
- `/super-admin/staff`: View platform and stall users
- `/super-admin/analytics`: Platform statistics
- `/super-admin/plans`: Subscription management
- `/super-admin/settings`: Platform configuration

### B. Stall Admin Panel (`/stall-admin`)
- `/stall-admin/dashboard`: Stall overview (Logo, publication status, counts, visit/scan stats, quick add)
- `/stall-admin/profile`: Business details
- `/stall-admin/menu`: Manage menu
- `/stall-admin/categories`: Manage categories
- `/stall-admin/menu/new`: Create item
- `/stall-admin/menu/:id/edit`: Edit item
- `/stall-admin/customize`: Design public menu
- `/stall-admin/preview`: Preview changes
- `/stall-admin/qr`: QR generation and download
- `/stall-admin/analytics`: Menu visitor statistics
- `/stall-admin/team`: Staff permissions
- `/stall-admin/settings`: Stall configuration

### C. Customer-Facing Website (`/menu/:slug`)
- `/menu/:slug`: Public Menu
- `/menu/:slug#category`: Category section
- `/menu/:slug/about`: Stall information
- `/404`: Not found
- `/unavailable`: Unavailable stall

---

## 6. Menu Management – Detailed Requirements
- **Structure:** Stall -> Menu -> Categories -> Food Items -> Variants.
- **Food Item Fields:**
  - Food name (Text, Required)
  - Description (Text, Optional)
  - Category (Selection, Required)
  - Price (Decimal, Required)
  - Discount price (Decimal, Optional)
  - Food image (Image URL, Optional)
  - Food type (Veg / Non-veg / Egg, Required)
  - Availability (Boolean, Required)
  - Featured item (Boolean, Optional)
  - Preparation time (Number, Optional)
  - Display order (Integer, Optional)
  - Tags (Multiple selection, Optional)
- **Variants:** e.g., Small, Medium, Large with independent prices.
- **Availability:** Instant toggle between Available and Unavailable.
- **Categories:** Create, rename, upload image, sort order, enable/disable, delete with item safeguarding.

---

## 7. Menu Customization Engine
- **Customization Modules:**
  - Branding: Logo, business name, tagline
  - Cover: Banner image, cover height
  - Colors: Primary, secondary, background
  - Typography: Font family, heading size
  - Layout: Grid, list, compact cards
  - Categories: Tabs, horizontal scrolling
  - Food cards: Image ratio, description, price style
  - Header: Sticky or standard
  - Footer: Address, phone, social links
  - Buttons: Shape, colors, and style
- **Templates:** Luxury, Minimal, Street Food, Fresh.
- **Publishing Rules:** Draft vs. Published versions. Saving draft does not update public view until explicitly published. Snapshots/version recovery.

---

## 8. QR Code Management
- Generate QR code automatically linked to permanent slug URL.
- Download PNG & SVG formats.
- Color customization & center logo overlay with scan reliability.
- Printable poster generation.
- Changing menu design or prices NEVER invalidates existing QR codes.

---

## 9. Database & Tenant Isolation
- PostgreSQL with Row Level Security (RLS) or rigorous backend tenant scoping.
- Models: `profiles`, `user_roles`, `stalls`, `stall_members`, `menus`, `categories`, `menu_items`, `item_variants`, `stall_themes`, `menu_publications`, `qr_codes`, `media`, `analytics_events`, `audit_logs`.
- Strict isolation: Stall A cannot access Stall B data.

---

## 10. Technical Architecture
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React, Recharts.
- **Backend / DB:** Supabase / PostgreSQL, Prisma ORM, Express session / auth, Edge functions / REST APIs, qrcode.
- **Hosting:** Vercel (Frontend), Render (Backend / Express) or unified full-stack.
