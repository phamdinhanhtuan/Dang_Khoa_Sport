# Đăng Khoa Sport — Enterprise E‑commerce Platform

## 🌐 Overview

**Đăng Khoa Sport** is a secure, scalable, and production‑oriented e‑commerce platform for sports equipment retail. The system is designed with clean architecture principles, strong security controls, and real‑world business workflows.

The platform follows a **dual‑application architecture**:

1.  **Customer Storefront**: A server‑side rendered shopping experience optimized for performance, SEO, and mobile responsiveness.
2.  **Administration Portal**: A secure, role‑based dashboard for managing products, orders, users, and operational analytics.

This project simulates a real production system, focusing on authentication, authorization, inventory control, order fulfillment, and security best practices.

## 🚀 Key Features

### 🛍️ Customer Experience
*   **Dynamic Navigation**: Hierarchical category system (tree data structure) for organizing extensive catalogs.
*   **Advanced Search**: Full‑text search with filters (price, category, attributes).
*   **Cart & Checkout**: Persistent cart management and multi‑step checkout flow.
*   **User Accounts**: Profiles, order history, and wishlist/favorites.
*   **Responsive UI**: Mobile‑first design using Bootstrap 5 and custom CSS.

### 🛡️ Admin Management
*   **Dashboard Analytics**: Revenue, orders, and user activity tracking.
*   **Inventory Control**: Full CRUD product management with multi‑image uploads.
*   **Category Management**: Multi‑level category structure management.
*   **Order Workflow**: Status pipeline (Pending → Shipping → Delivered).
*   **Access Control**: Role‑Based Access Control (RBAC) for admin routes.

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js |
| **Server Framework** | Express.js (REST API & SSR) |
| **Database** | MongoDB & Mongoose ODM |
| **Frontend Engine** | EJS (Embedded JavaScript Templates) |
| **Styling** | Bootstrap 5, SASS/SCSS, CSS3 |
| **Authentication** | JWT for API access, Session‑based auth for admin flows |
| **Validation** | Joi |
| **Deployment** | Docker & Docker Compose |

## 🔒 Security Measures

*   **Environment Configuration**: All sensitive credentials (database URIs, secrets, API keys) are managed via `.env` files and are not committed to version control.
*   **Authentication & Authorization**: JWT‑based authentication for API endpoints and session‑based authentication for admin dashboard flows. Role‑Based Access Control (RBAC) protects privileged operations.
*   **Password Protection**: User passwords are hashed using bcrypt before storage.
*   **Session Security**: HTTPOnly cookies and persistent session storage using connect-mongo.
*   **Input Validation**: Request payload validation to prevent malformed data, NoSQL injection, and XSS attacks.
*   **HTTP Security Headers**: Configured using Helmet.
*   **Rate Limiting**: Protection against brute‑force login attempts and abusive traffic.

## 📂 Folder Structure

```
Dang_Khoa_Sport/
├── Admin/              # Administration Portal
│   ├── src/
│   │   ├── config/     # Database and Cloudinary configuration
│   │   ├── controllers/# Request handlers (business logic)
│   │   ├── middleware/ # Auth, RBAC, and logic layers
│   │   ├── models/     # Mongoose schemas
│   │   └── views/      # Admin EJS templates
│   └── server.js       # Entry point
│
├── Customer/           # Customer Storefront
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── views/      # Storefront EJS templates
│   └── server.js       # Entry point
│
└── README.md           # Documentation
```

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js v16+
*   MongoDB v5+

### 1. Clone Repository
```bash
git clone https://github.com/phamdinhanhtuan/Dang_Khoa_Sport.git
cd Dang_Khoa_Sport
```

### 2. Setup Customer App
```bash
cd Customer
npm install
# Configure .env file (see below)
npm run dev
```

### 3. Setup Admin App
```bash
# Open a new terminal
cd ../Admin
npm install
# Configure .env file (see below)
npm run dev
```

### 4. Environment Variables
Create a `.env` file in **both** `Admin` and `Customer` directories:

```env
PORT=3000 (Customer) / 3001 (Admin)
MONGO_URI=mongodb://localhost:27017/dangkhoa_sport
JWT_SECRET=your-secure-jwt-secret-min-32-chars
SESSION_SECRET=your-session-secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

### 5. Seed Database (Optional)
```bash
cd Admin
npm run seed
```

## 📡 API Endpoints (Sample)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create a new user account |
| **POST** | `/api/auth/login` | Authenticate user & get token |
| **GET** | `/api/products` | List mobile-friendly products |
| **GET** | `/api/orders/my` | Get current user's order history |
| **POST** | `/api/cart` | Add item to shopping cart |

## 📌 Notes
*   This repository does not contain secrets, credentials, or production keys.
*   `node_modules` and `.env` files are excluded via `.gitignore`.
*   Designed for portfolio, learning, and production‑style architecture demonstration.

---
*Created with ❤️ by Tuan (Node.js Developer)*

© 2026 Đăng Khoa Sport. All rights reserved.
