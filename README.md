# Đăng Khoa Sport – E-Commerce Platform

## Overview
Đăng Khoa Sport is a full-stack e-commerce project built with Node.js and MongoDB. The system separates the Storefront and Admin Portal into independent processes while sharing the same service layer and database.

This project was developed to practice scalable backend architecture, authentication, and role-based access control in a real-world commerce scenario.

## Architecture
The application follows a layered architecture:
- **Controllers**: Handle HTTP requests and responses.
- **Services**: Contain business logic (Service-Layer Baseline).
- **Models**: Mongoose schemas and data persistence.
- **Views**: EJS templates for server-side rendering (SSR).

### Services
| Component | Port | Description |
| :--- | :--- | :--- |
| **Storefront** | `3000` | Customer interface |
| **Admin Portal** | `3100` | Management system |
| **MongoDB** | `27017` | Data storage |

## Project Structure
```text
src/
├── controllers/    # Request handlers
├── services/       # Business logic (shared)
├── models/         # Database schemas
├── routes/         # Express routing
├── middleware/     # Auth, error handling, etc.
├── views/          # EJS templates (Storefront)
│   └── admin/      # EJS templates (Admin Portal)
└── app.js          # Express app configuration
```

## Features
### Authentication
- JWT-based authentication.
- Role-based access control (RBAC).
- Bcrypt password hashing.

### E-commerce Flow
- Product & Category CRUD.
- Session-based cart management.
- Order creation and status tracking.
- Admin dashboard with revenue aggregation.
- Low stock warning logic.
- Basic chatbot logic for order inquiries.

## Tech Stack
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Frontend**: EJS (SSR), Bootstrap 5.
- **Infrastructure**: Docker support, environment-aware scripts.

## Installation
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run Storefront**:
   ```bash
   npm start
   ```
3. **Run Admin Portal**:
   ```bash
   npm run admin
   ```

## Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/dang-khoa-sport
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

## Known Limitations
- **Image Storage**: Currently using local storage (can be configured for Cloudinary).
- **Payment**: Simple order flow without real-time payment gateway integration (Momo/VNPay).
- **Search**: Basic string matching; not using Elasticsearch or Atlas Search.

## Future Improvements
- Integrate real-time notifications for new orders (Socket.io).
- Add payment gateway integration (VNPay/Momo).
- Implement advanced AI recommendation engine.

## Purpose
- Clean service-layer architecture.
- Proper authentication & authorization.
- Separation between public and private systems.
- Practice RESTful API and SSR patterns.

---
*Created with ❤️ by Tuan (Node.js Developer)

© 2026 Đăng Khoa Sport. All rights reserved.