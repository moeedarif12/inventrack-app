# 📦 Multi-Business Inventory & Sales Management System

A production-ready, multi-tenant SaaS platform re-engineered from a legacy C++ console application into a full-stack MERN application.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3.4 + ShadCN UI |
| Routing | React Router v6 |
| HTTP | Axios |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Uploads | Multer |

## 📁 Project Structure

```
root/
├── client/          # React Frontend (Vite + TS + Tailwind)
├── server/          # Express Backend
│   ├── config/      # DB connection
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth, upload, error, validate
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express routers
│   ├── uploads/     # Product image storage
│   └── utils/       # Helpers
├── .env.example
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- npm >= 9

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Server
cp server/.env.example server/.env
# Fill in your MongoDB URI and JWT secret

# Client
cp client/.env.example client/.env
# Set VITE_API_URL to your backend URL
```

### 3. Run Development

```bash
# Terminal 1 - Backend (port 5000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

## 🌐 API Endpoints

| Resource | Base Route |
|---|---|
| Auth | `/api/auth` |
| Business | `/api/business` |
| Categories | `/api/categories` |
| Products | `/api/products` |
| Customers | `/api/customers` |
| Sales | `/api/sales` |
| Inventory | `/api/inventory` |
| Dashboard | `/api/dashboard` |
| Reports | `/api/reports` |

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Features

- ✅ Multi-Business Registration & Login
- ✅ Modern Dashboard with Analytics & Charts
- ✅ Full Product & Category Management
- ✅ Customer Management with Purchase History
- ✅ Sales & Invoice Generation
- ✅ Inventory Tracking with Stock Alerts
- ✅ Comprehensive Reports
- ✅ Dark / Light Mode
- ✅ Mobile Responsive
- ✅ Image Upload for Products

## 🚀 Deployment

- **Backend**: Deploy to Railway / Render — set environment variables
- **Frontend**: Deploy to Vercel / Netlify — set `VITE_API_URL`

## 📄 Legacy System Re-Engineering

This project replaces a C++ console-based inventory system with:

| Old (C++) | New (MERN) |
|---|---|
| Console UI | Modern Web Dashboard |
| CSV/Text files | MongoDB Atlas |
| Single user | Multi-business SaaS |
| Local only | Cloud-based |
| Manual SKU | Auto-generated SKU |
| No analytics | Interactive charts |
