# 💎 Jewelry Shop Management System — New Priyanka Jewellery

> **Enterprise-level, Production-ready Full-Stack MERN Application**
> for automating jewelry shop operations including products, inventory, sales, customers, custom orders, and dynamic pricing.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Design Patterns](#-architecture--design-patterns)
4. [Folder Structure](#-folder-structure)
5. [Team Members & Module Ownership](#-team-members--module-ownership)
6. [Dynamic Price Engine](#-dynamic-price-engine)
7. [Database Schema Design](#-database-schema-design)
8. [API Endpoints](#-api-endpoints)
9. [Authentication & Security](#-authentication--security)
10. [Setup & Installation](#-setup--installation)
11. [Environment Variables](#-environment-variables)
12. [Seeding Data](#-seeding-data)
13. [Frontend Pages & Components](#-frontend-pages--components)
14. [System Diagrams](#-system-diagrams)
15. [Deployment Guide](#-deployment-guide)

---

## 🏗️ Project Overview

This system automates all operations of **New Priyanka Jewellery** shop:

| Feature | Description |
|---------|-------------|
| **Public Boutique Catalog** | Luxury storefront accessible without login |
| **AI Digital Goldsmith** | AI-powered custom jewelry design tool for customers |
| **Product Management** | CRUD with dynamic pricing (NO static price stored) |
| **Inventory Management** | Stock tracking, low-stock alerts, auto-reduce on sale |
| **Sales & Billing** | Invoice generation, dynamic price calculation, tax/discount |
| **Customer Management** | Loyalty points, purchase history, activation/deactivation |
| **Custom Orders** | Status tracking with Admin Notification System |
| **Dynamic Price Engine** | External API + cron job, MetalRate/StoneRate collections |
| **Admin & Reports** | Revenue reports, top products, user management |
| **Authentication** | JWT + bcrypt, role-based (Admin/Staff/Customer) |

---

## ⚙️ Technology Stack

### Backend
| Tech | Purpose |
|------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **node-cron** | Scheduled jobs (rate updates) |
| **axios** | External API calls |
| **express-validator** | Input validation |
| **cors** | Cross-origin requests |
| **dotenv** | Environment variables |

### Frontend
| Tech | Purpose |
|------|---------|
| **React 18** | UI framework (Functional Components + Hooks) |
| **React Router v6** | Client-side routing |
| **Context API** | Global state (AuthContext) |
| **React Hook Form** | Form validation |
| **Axios** | API communication |
| **react-icons** | Icon library |
| **react-toastify** | Toast notifications |
| **recharts** | Charts & graphs |
| **Custom CSS** | Premium dark theme with gold accents |

---

## 🏛️ Architecture & Design Patterns

### Backend Architecture
```
Routes → Controllers → Services → Models
```

- **Routes**: Define API endpoints, attach middleware
- **Controllers**: Handle HTTP request/response, delegate to services
- **Services**: Business logic layer (reusable, testable)
- **Models**: Mongoose schemas with validation
- **Middleware**: Auth, role-based access, error handling, validation
- **Cron**: Scheduled jobs for rate updates
- **Utils**: Reusable utilities (ApiError, ApiResponse, asyncHandler)

### Frontend Architecture
```
App → Router → Pages → Layouts → Components
                ↕
        Context (Auth State)
                ↕
        Services (API Layer)
```

---

## 📁 Folder Structure

### Backend (`/backend`)
```
backend/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── constants.js           # App-wide constants
├── controllers/
│   ├── authController.js      # Login, profile
│   ├── customerController.js  # Customer CRUD
│   ├── inventoryController.js # Stock management
│   ├── orderController.js     # Custom orders
│   ├── priceController.js     # Rate management
│   ├── productController.js   # Product CRUD
│   ├── reportController.js    # Analytics/reports
│   ├── saleController.js      # Sales & billing
│   └── userController.js      # User management
├── cron/
│   └── rateUpdateJob.js       # 24hr rate update cron
├── middleware/
│   ├── auth.js                # JWT verification
│   ├── authorize.js           # Role-based access
│   └── errorHandler.js        # Centralized error handling
├── models/
│   ├── Customer.js
│   ├── Inventory.js
│   ├── MetalRate.js
│   ├── Order.js
│   ├── PriceHistory.js
│   ├── Product.js
│   ├── Sale.js
│   ├── StoneRate.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── customerRoutes.js
│   ├── inventoryRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── rateRoutes.js
│   ├── reportRoutes.js
│   ├── saleRoutes.js
│   └── userRoutes.js
├── services/
│   ├── authService.js
│   ├── customerService.js
│   ├── inventoryService.js
│   ├── orderService.js
│   ├── priceService.js        # Dynamic pricing logic
│   ├── productService.js
│   ├── reportService.js
│   ├── saleService.js
│   └── userService.js
├── utils/
│   ├── ApiError.js            # Custom error class
│   ├── ApiResponse.js         # Standardized response
│   ├── asyncHandler.js        # Async error wrapper
│   └── seeder.js              # Database seeder
├── validations/
│   └── index.js               # Express-validator rules
├── .env                        # Environment variables
├── .env.example                # Template
├── package.json
└── server.js                   # Entry point
```

### Frontend (`/frontend`)
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.js
│   │   └── Modal.js
│   ├── context/
│   │   └── AuthContext.js     # Auth state management
│   ├── hooks/
│   │   └── useApi.js          # API call hook
│   ├── layouts/
│   │   ├── Header.js
│   │   ├── MainLayout.js
│   │   └── Sidebar.js
│   ├── pages/
│   │   ├── CustomersPage.js
│   │   ├── DashboardPage.js
│   │   ├── InventoryPage.js
│   │   ├── LoginPage.js
│   │   ├── OrdersPage.js
│   │   ├── ProductsPage.js
│   │   ├── RatesPage.js
│   │   ├── ReportsPage.js
│   │   ├── SalesPage.js
│   │   └── UsersPage.js
│   ├── protectedRoutes/
│   │   └── ProtectedRoute.js  # Auth + Admin guards
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   └── endpoints.js       # API service functions
│   ├── App.js
│   ├── index.css              # Global styles (dark theme)
│   └── index.js
├── .env
└── package.json
```

---

## 👥 Team Members & Module Ownership

This project is divided into 6 core modules, each owned and maintained by a specific team member. Below is the breakdown of module ownership, the files associated with each component, and their specific data flows.

### 1️⃣ Product & Pricing Management (Bala)
**Owner**: Bala
**Core Responsibility**: Managing the jewelry catalog, defining product characteristics (weight, purity), and building the dynamic price calculation engine that fetches real-time metal and stone rates.
**Files Involved**:
- **Models**: `Product.js`, `MetalRate.js`, `StoneRate.js`, `PriceHistory.js`
- **Controllers & Services**: `productController.js`, `priceController.js`, `productService.js`, `priceService.js`
- **Routes**: `productRoutes.js`, `rateRoutes.js`
- **Cron Jobs**: `rateUpdateJob.js`
- **Frontend Pages**: `ProductsPage.js`, `RatesPage.js`, `CatalogPage.js`

**Data Flow & Diagram**:
`External API / Cron Job` ➔ `Update Rate Models` ➔ `Price Service (Dynamic Price)` ➔ `Catalog UI`

### 2️⃣ Inventory & Stock Management (Sathursika)
**Owner**: Sathursika
**Core Responsibility**: Tracking product quantities, generating low-stock alerts, and automating stock ledger adjustments during sales or order placements.
**Files Involved**:
- **Models**: `Inventory.js`
- **Controllers & Services**: `inventoryController.js`, `inventoryService.js`
- **Routes**: `inventoryRoutes.js`
- **Frontend Pages**: `InventoryPage.js`

**Data Flow & Diagram**:
`Product Created` ➔ `Assign Stock Info` ➔ `Monitor Thresholds (< Low Stock Alert)` ➔ `Auto-reduce on Sale / Auto-restore on Cancel`

### 3️⃣ Order & Custom Jewellery Workflow (Parani)
**Owner**: Parani
**Core Responsibility**: Managing special user requests, integrating AI visual generation (Digital Goldsmith), and overseeing the end-to-end custom design lifecycle.
**Files Involved**:
- **Models**: `Order.js`
- **Controllers & Services**: `orderController.js`, `orderService.js`
- **Routes**: `orderRoutes.js`
- **AI Scripts**: `test-gemini-models.js`, `test-openai.js`, `test-leonardo.js`
- **Frontend Pages**: `OrdersPage.js`, `CustomDesignsPage.js`, `CustomPhotoUploadPage.js`, `DesignJewelryPage.js`

**Data Flow & Diagram**:
`Customer Uploads/Generates AI Design` ➔ `Submit Custom Order Request` ➔ `Admin Quotes Price (Pending ➔ In-Progress)` ➔ `Delivery`

### 4️⃣ Reporting, Analytics & Admin Dashboard (Sangirthana)
**Owner**: Sangirthana
**Core Responsibility**: Aggregating shop data into visual analytics, generating business intelligence reports, and handling administrative user roles and authentication.
**Files Involved**:
- **Models**: `User.js` (Admin/Staff roles)
- **Controllers & Services**: `reportController.js`, `authController.js`, `userController.js`, `reportService.js`
- **Routes**: `reportRoutes.js`, `authRoutes.js`, `userRoutes.js`
- **Frontend Pages**: `ReportsPage.js`, `DashboardPage.js`, `UsersPage.js`, `LoginPage.js`

**Data Flow & Diagram**:
`Collect Sales/Inventory/Customer Data` ➔ `Report Services (Aggregate/Filter)` ➔ `REST APIs` ➔ `Dashboard Charts (Recharts)`

### 5️⃣ Sales, Billing & Invoice Management (Nandujan)
**Owner**: Nandujan
**Core Responsibility**: Streamlining the Checkout process, computing taxes/discounts, handling secure payments, and generating downloadable PDF invoices.
**Files Involved**:
- **Models**: `Sale.js`
- **Controllers & Services**: `saleController.js`, `saleService.js`
- **Routes**: `saleRoutes.js`
- **Frontend Pages**: `SalesPage.js`, `CartPage.js`, `CheckoutPage.js`, `PaymentSuccessPage.js`, `PaymentCancelPage.js`

**Data Flow & Diagram**:
`Add to Cart` ➔ `Secure Checkout (Stripe / Cash)` ➔ `Generate Sale Record` ➔ `Trigger PDF Invoice (jsPDF)` ➔ `Deduct Inventory`

### 6️⃣ Customer Management & Loyalty System (Yalan)
**Owner**: Yalan
**Core Responsibility**: Maintaining the Customer CRM, developing the rewards program, assigning loyalty points, and tracking comprehensive purchase histories.
**Files Involved**:
- **Models**: `Customer.js`
- **Controllers & Services**: `customerController.js`, `customerService.js`
- **Routes**: `customerRoutes.js`
- **Frontend Pages**: `CustomersPage.js`, `UserDashboardPage.js`, `ProfilePage.js`, `RegisterPage.js`

**Data Flow & Diagram**:
`Customer Register` ➔ `Complete a Purchase` ➔ `Calculate Reward Points (e.g., 1pt / ₹100)` ➔ `Update CRM Profile` ➔ `Redeem Points`

---

## 💰 Dynamic Price Engine

### How It Works
1. **Cron Job** (`cron/rateUpdateJob.js`) runs every 24 hours at midnight
2. Fetches metal rates (gold, silver, platinum) from external API
3. Fetches gemstone rates from external API
4. Stores in `MetalRates` and `StoneRates` collections
5. Logs to `PriceHistory` collection for auditing
6. **Fallback**: If API fails, uses last stored rate

### Price Calculation Service (`services/priceService.js`)
```javascript
// Called during: Product listing, Product detail, Sale transaction
calculateProductPrice(product) {
  metalRate = getLatestMetalRate(product.material)
  stoneRate = getLatestStoneRate(product.stoneType)
  
  metalPrice = product.weight × metalRate × (product.purity / 100)
  stonePrice = product.stoneWeight × stoneRate
  finalPrice = metalPrice + stonePrice + product.makingCharge

  return { metalPrice, stonePrice, makingCharge, finalPrice }
}
```

### Collections Used
| Collection | Purpose |
|-----------|---------|
| `MetalRates` | Current rates for gold/silver/platinum |
| `StoneRates` | Current rates for diamond/ruby/emerald/sapphire/pearl |
| `PriceHistory` | Historical log of all rate changes |

### Admin Manual Override
- Admin can update rates manually via the `/rates` endpoint
- All manual updates are logged in PriceHistory with source="manual"

---

## 🗄️ Database Schema Design

### Collections (MongoDB)

#### Users
```
{ name, email, password(hashed), role(admin/staff), isActive, lastLogin }
```

#### Customers
```
{ name, phone, email, address{street,city,state,pincode}, loyaltyPoints, purchaseHistory[], isActive }
```

#### Products (NO price field!)
```
{ name, sku(auto), category, material, weight, purity, makingCharge, stoneType, stoneWeight, description, status, isDeleted }
```

#### MetalRates
```
{ metal(gold/silver/platinum), ratePerGram, unit, source, lastUpdated }
```

#### StoneRates
```
{ stoneType(diamond/ruby/etc), ratePerCarat, unit, source, lastUpdated }
```

#### PriceHistory
```
{ type(metal/stone), name, rate, source, recordedAt }
```

#### Inventory
```
{ productId(ref), quantity, lowStockThreshold, lastUpdated }
```

#### Sales
```
{ invoiceNumber, customerId(ref), items[{productId, productName, quantity, weight, unitPrice, itemTotal}],
  subtotal, discount, discountType, taxRate, taxAmount, totalAmount, finalAmount,
  paymentStatus, paymentMethod, isCancelled, cancelReason, saleDate }
```

#### Orders
```
{ orderNumber, customerId(ref), designDetails, material, weight, purity,
  estimatedPrice, advancePayment, status, deliveryDate, specialInstructions }
```

### Relationships
```
Products ←——→ Inventory (1:1 via productId)
Customers ←——→ Sales (1:N via customerId)
Customers ←——→ Orders (1:N via customerId)
Products ←——→ SaleItems (1:N via productId)
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Auth | Get profile |
| PUT | `/api/auth/profile` | Auth | Update profile |
| PUT | `/api/auth/change-password` | Auth | Change password |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Auth | List (with dynamic pricing) |
| GET | `/api/products/:id` | Auth | Detail (with pricing) |
| POST | `/api/products` | Admin | Create |
| PUT | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Soft delete |
| PUT | `/api/products/:id/restore` | Admin | Restore |

### Customers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/customers` | Auth | List |
| GET | `/api/customers/:id` | Auth | Detail |
| POST | `/api/customers` | Auth | Create |
| PUT | `/api/customers/:id` | Auth | Update |
| PUT | `/api/customers/:id/deactivate` | Admin | Deactivate |
| PUT | `/api/customers/:id/activate` | Admin | Activate |

### Inventory
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/inventory` | Auth | List |
| GET | `/api/inventory/low-stock` | Auth | Low stock alerts |
| POST | `/api/inventory/add-stock` | Auth | Add stock |
| PUT | `/api/inventory/update-stock` | Auth | Update stock |
| DELETE | `/api/inventory/:id` | Admin | Remove entry |

### Sales
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/sales` | Auth | List |
| GET | `/api/sales/:id` | Auth | Detail + invoice |
| POST | `/api/sales` | Auth | Create sale |
| PUT | `/api/sales/:id/cancel` | Admin | Cancel (restore stock) |
| PUT | `/api/sales/:id/payment-status` | Auth | Update payment |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders` | Auth | List |
| GET | `/api/orders/:id` | Auth | Detail |
| POST | `/api/orders` | Auth | Create |
| PUT | `/api/orders/:id` | Auth | Update |
| PUT | `/api/orders/:id/status` | Auth | Update status |
| PUT | `/api/orders/:id/cancel` | Admin | Cancel |

### Rates
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/rates/metals` | Auth | Get metal rates |
| GET | `/api/rates/stones` | Auth | Get stone rates |
| PUT | `/api/rates/metals` | Admin | Manual update metal |
| PUT | `/api/rates/stones` | Admin | Manual update stone |
| GET | `/api/rates/history` | Auth | Price history |

### Reports
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reports/dashboard` | Admin | Dashboard stats |
| GET | `/api/reports/sales` | Admin | Sales by date range |
| GET | `/api/reports/top-products` | Admin | Most sold products |
| GET | `/api/reports/inventory` | Admin | Inventory report |
| GET | `/api/reports/monthly-revenue` | Admin | Monthly revenue |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List users |
| POST | `/api/users` | Admin | Create staff |
| PUT | `/api/users/:id/role` | Admin | Change role |
| PUT | `/api/users/:id/deactivate` | Admin | Deactivate |
| PUT | `/api/users/:id/activate` | Admin | Activate |
| PUT | `/api/users/:id/reset-password` | Admin | Reset password |

---

## 🔐 Authentication & Security

### JWT Authentication Flow
1. User submits email + password
2. Server validates credentials (bcrypt compare)
3. Server generates JWT token (expires in 7 days)
4. Token stored in localStorage on frontend
5. Axios interceptor attaches token to every request
6. Backend `auth` middleware verifies token on protected routes

### Security Features
- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: Signed with secret, 7-day expiry
- **Role-based Authorization**: Admin/Staff roles
- **Input Validation**: express-validator on all endpoints
- **Centralized Error Handling**: Custom ApiError class
- **CORS**: Configured for frontend origin
- **Environment Variables**: Secrets in .env file

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+ (https://nodejs.org/)
- **MongoDB** (local or Atlas) (https://www.mongodb.com/)
- **npm** or **yarn**

### Step 1: Install Backend
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the template
cp .env.example .env

# Edit .env with your values:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A strong random secret
# - METAL_API_URL: Metal rate API endpoint (optional)
```

### Step 3: Seed Database
```bash
# From backend directory
node utils/seeder.js
```
This creates:
- Admin user: `admin@priyankajewellery.com` / `Admin@123456`
- Default metal rates (Gold, Silver, Platinum)
- Default stone rates (Diamond, Ruby, Emerald, Sapphire, Pearl)

### Step 4: Start Backend
```bash
# Development mode
npm run dev

# Production mode
npm start
```
Backend runs on `http://localhost:5000`

### Step 5: Install Frontend
```bash
cd frontend
npm install
```

### Step 6: Start Frontend
```bash
npm start
```
Frontend runs on `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection | mongodb://localhost:27017/jewelry_shop |
| `JWT_SECRET` | JWT signing secret | (set your own) |
| `JWT_EXPIRE` | Token expiry | 7d |
| `METAL_API_URL` | Metal rate source | (optional) |
| `STONE_API_URL` | Stone rate source | (optional) |
| `CRON_SCHEDULE` | Rate update schedule | 0 0 * * * (midnight) |
| `TAX_RATE` | Default GST rate | 3 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | http://localhost:5000/api |

---

## 🌱 Seeding Data

Run the seeder to populate initial data:

```bash
cd backend
node utils/seeder.js
```

### Default Admin Account
- **Email**: admin@priyankajewellery.com
- **Password**: Admin@123456
- **Role**: Admin

### Default Metal Rates
| Metal | Rate/gram |
|-------|-----------|
| Gold | ₹6,200 |
| Silver | ₹78 |
| Platinum | ₹3,100 |

### Default Stone Rates
| Stone | Rate/carat |
|-------|-----------|
| Diamond | ₹45,000 |
| Ruby | ₹25,000 |
| Emerald | ₹30,000 |
| Sapphire | ₹20,000 |
| Pearl | ₹5,000 |

---

## 🖥️ Frontend Pages & Components

### Pages
| Page | Path | Access | Description |
|------|------|--------|-------------|
| Login | `/login` | Public | JWT authentication |
| Dashboard | `/dashboard` | Auth | Stats, rates, summaries |
| Products | `/products` | Auth | CRUD with dynamic pricing |
| Inventory | `/inventory` | Auth | Stock management |
| Sales | `/sales` | Auth | Sales + invoices |
| Customers | `/customers` | Auth | Customer management |
| Orders | `/orders` | Auth | Custom orders |
| Rates | `/rates` | Auth | Metal/stone rates |
| Reports | `/reports` | Admin | Analytics & reports |
| Users | `/users` | Admin | Staff management |

### Design Features
- **Premium Dark Theme** with gold (#d4af37) accents
- **Glassmorphism** header with backdrop blur
- **Playfair Display** for headings + **Inter** for body
- **Smooth animations** (fade-in, slide-up)
- **Custom scrollbar** styling
- **Responsive design** (mobile-first)
- **Custom status badges** (active, pending, in-progress)
- **Invoice generation** with professional layout

---

## 📊 System Diagrams

### 1. System Architecture
```
┌──────────────┐     HTTP/REST      ┌──────────────┐
│   React App  │ ◄───────────────► │  Express.js   │
│   (Client)   │    Axios + JWT     │   (Server)    │
└──────────────┘                    └──────┬───────┘
                                           │
                           ┌───────────────┼───────────────┐
                           │               │               │
                     ┌─────┴─────┐   ┌─────┴─────┐   ┌────┴────┐
                     │  MongoDB  │   │ External  │   │  Cron   │
                     │ (Mongoose)│   │ Rate API  │   │  Jobs   │
                     └───────────┘   └───────────┘   └─────────┘
```

### 2. Request Flow
```
Client Request
      │
      ▼
  Express Router
      │
      ▼
  Auth Middleware (JWT verify)
      │
      ▼
  Role Middleware (admin/staff check)
      │
      ▼
  Validation Middleware (express-validator)
      │
      ▼
  Controller (parse request, send response)
      │
      ▼
  Service (business logic)
      │
      ▼
  Model (database operations)
      │
      ▼
  MongoDB
```

### 3. ER Diagram (Relationships)
```
┌─────────┐      ┌──────────┐      ┌───────────┐
│  Users  │      │ Customers │◄────►│   Sales   │
│ (Auth)  │      │           │      │           │
└─────────┘      │           │◄────►│           │
                 └──────────┘      └─────┬─────┘
                                         │
                 ┌──────────┐      ┌─────┴─────┐
                 │ Products │◄────►│ SaleItems │
                 │(no price)│      └───────────┘
                 └────┬─────┘
                      │
                 ┌────┴─────┐
                 │Inventory │
                 └──────────┘

┌──────────┐     ┌──────────┐     ┌──────────────┐
│MetalRates│────►│          │     │              │
└──────────┘     │ Price    │────►│ PriceHistory │
┌──────────┐     │ Engine   │     │              │
│StoneRates│────►│(Dynamic) │     │              │
└──────────┘     └──────────┘     └──────────────┘

┌──────────┐
│ Customers│◄────►┌──────────┐
│          │      │  Orders  │
└──────────┘      │ (Custom) │
                  └──────────┘
```

### 4. Data Flow Diagram - Level 0
```
┌──────────┐                    ┌──────────────────┐                    ┌──────────┐
│   Shop   │  Manage Products   │                  │   Store/Retrieve   │ MongoDB  │
│   Staff  │ ──────────────────►│   Jewelry Shop   │ ◄────────────────► │ Database │
│          │  Create Sales      │    Management    │                    │          │
│          │ ──────────────────►│     System       │   Fetch Rates      │          │
│          │◄──────────────────│                  │ ◄────────────────► ┌──────────┐
│          │  Reports/Invoices  │                  │                    │  Rate    │
└──────────┘                    └──────────────────┘                    │  APIs    │
                                                                       └──────────┘
```

### 5. Data Flow Diagram - Level 1
```
┌────────┐     ┌───────────┐     ┌───────────┐     ┌──────────┐
│  Auth  │────►│ Products  │────►│ Inventory │────►│  Sales   │
│ Module │     │  Module   │     │  Module   │     │  Module  │
└────────┘     └───────────┘     └───────────┘     └──────────┘
                     │                                    │
                     ▼                                    ▼
              ┌───────────┐                        ┌──────────┐
              │   Price   │                        │ Reports  │
              │  Engine   │                        │  Module  │
              └─────┬─────┘                        └──────────┘
                    │
              ┌─────┴─────┐
              │   Cron    │
              │   Job     │
              └───────────┘
```

---

## 🚢 Deployment Guide

### MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

### Backend Deployment (e.g., Render/Railway)
```bash
# Set environment variables on your platform
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
```

### Frontend Deployment (e.g., Vercel/Netlify)
```bash
# Build
cd frontend
npm run build

# Set env
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## 📝 Important Notes

1. **Product prices are NEVER stored** — always calculated dynamically
2. **Cron job** runs at midnight daily to update rates
3. **If API fails**, the system gracefully falls back to last stored rates
4. **Soft delete** is used for products (not permanent deletion)
5. **Invoice numbers** are auto-generated: `INV-YYYYMMDD-XXXX`
6. **Order numbers** are auto-generated: `ORD-YYYYMMDD-XXXX`
7. **Loyalty points** auto-awarded on sales (1 point per ₹100)
8. **Stock auto-reduces** on sale creation, auto-restores on cancellation

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add my feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

> **Built with ❤️ for New Priyanka Jewellery**
> Enterprise-grade Jewelry Shop Management System
