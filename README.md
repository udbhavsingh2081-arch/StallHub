# StallHub — MERN Stack Digital QR Menu Platform

A modern, clean, and simple **MERN Stack** (MongoDB, Express, React, Node.js) platform for food stalls and restaurants to manage digital menus with dynamic, permanent QR codes.

---

## 1. Architecture (MERN Stack)

```
stallhub/
├── client/                     # [R] REACT FRONTEND (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerMenu.jsx # Mobile-first public menu with search & Veg/Non-Veg filters
│   │   │   ├── StallAdmin.jsx   # Shopkeeper workspace: dishes, stock toggle, QR hub
│   │   │   ├── SuperAdmin.jsx   # Platform Owner console: approve stalls, stats
│   │   │   └── LoginPage.jsx    # Clean sign-in with quick one-click shortcuts
│   │   ├── api.js              # Fetch wrapper with JWT authentication
│   │   └── App.jsx              # Responsive single-page application & routing
│   └── package.json
│
├── src/
│   ├── models/                 # [M] MONGOOSE MODELS (MongoDB)
│   │   ├── User.js             # Platform users (Super Admin, Stall Owners)
│   │   ├── Stall.js            # Food stalls, slugs, scan & visitor counts
│   │   ├── Category.js         # Food categories (Pizzas, Beverages, etc.)
│   │   └── FoodItem.js         # Dishes, prices, variants, Veg/Non-Veg, In-Stock toggle
│   │
│   ├── controllers/            # [C] CONTROLLERS (Business Logic)
│   │   ├── authController.js       # Login, JWT issuing, current user
│   │   ├── stallController.js      # Stall details & dynamic QR generator
│   │   ├── categoryController.js   # Category management
│   │   ├── foodItemController.js   # Dish CRUD & instant stock status toggle
│   │   ├── superAdminController.js # Multi-stall overview, status toggle, check availability
│   │   └── publicMenuController.js # Public customer menu JSON & scan tracker
│   │
│   ├── routes/                 # [E] EXPRESS ROUTERS
│   │   ├── auth.js             # /api/auth
│   │   ├── stall.js            # /api/stall
│   │   ├── categories.js       # /api/categories
│   │   ├── foodItems.js        # /api/food-items
│   │   ├── superAdmin.js       # /api/super-admin
│   │   └── publicMenu.js       # /api/public/menu
│   │
│   ├── config/
│   │   └── db.js               # MongoDB connection & auto-seeding on first run
│   ├── middleware/
│   │   └── auth.js             # JWT bearer verification & role checks
│   ├── app.js                  # Express setup & static client hosting
│   └── server.js               # [N] NODE HTTP SERVER listener
│
├── vercel.json                 # Vercel serverless configuration
└── package.json
```

---

## 2. Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas)

### Setup & Run
```bash
# 1. Install dependencies
npm install
npm --prefix client install

# 2. Configure environment
cp .env.example .env

# 3. Build React client
npm run build

# 4. Start Server (Express serves React on http://localhost:5000)
npm start

# OR for full concurrent development with hot reload:
npm run dev
```

---

## 3. Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `udbhavsingh2081@gmail.com` | `Udbhavsingh2005%` |
| **Demo Stall Owner** | `owner@pizzacorner.com` | `StallOwnerPass123!` |

---

## 4. Key Features

- **Mobile-First Customer Menu (`#/menu/pizza-corner`):** Clean layout with instant search, sticky category pills, dietary tags (Veg / Non-Veg / Egg), dish size variants, phone call button, and opening status.
- **Shopkeeper Workspace (`#/stall-admin`):** Edit stall details, manage dishes & categories, toggle availability (In Stock / Sold Out) with one click.
- **Dynamic QR Hub:** Permanent QR code that opens the live menu without reprinting when prices or items change. Shows live camera scan count.
- **Super Admin Console (`#/super-admin`):** Platform analytics, approve/suspend stalls, check shopkeeper ID & slug availability, register new stalls.
