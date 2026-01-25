# Đăng Khoa Sport - Backend (Portfolio Project)

Welcome to the backend API for **Đăng Khoa Sport**, a modern e-commerce platform specializing in sports equipment. This project simulates a real-world shopping experience with features like authentication, product management, and a shopping cart flow.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Bcrypt based
- **Validation**: Joi
- **Testing**: Jest & Supertest
- **Security**: Helmet, Rate Limiting, XSS Protection

## 📂 Folder Structure

```
src/
├── config/         # Database and Cloudinary config
├── controllers/    # Request handlers (Business logic)
├── middlewares/    # Auth, Error Handling, Security
├── models/         # Mongoose Schemas (User, Product, Cart, Order)
├── routes/         # API Routes declaration
├── services/       # Service layer (optional separation)
├── utils/          # Helpers (AppError, logger)
├── validators/     # Joi validation schemas
├── views/          # EJS templates (for server-side rendering)
└── app.js          # Express app setup
```

## 🛠️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/dang-khoa-sport.git
    cd dang-khoa-sport
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/dang-khoa-sport
    JWT_SECRET=your-super-secure-secret-key-min-32-chars
    SESSION_SECRET=your-session-secret
    CLOUDINARY_CLOUD_NAME=your_name
    CLOUDINARY_API_KEY=your_key
    CLOUDINARY_API_SECRET=your_secret
    NODE_ENV=development
    ```

4.  **Seed Database (Optional)**
    Populate the DB with demo data:
    ```bash
    npm run seed
    ```

5.  **Run the Server**
    ```bash
    # Development Mode
    npm run dev

    # Production Mode
    npm start
    ```

## 🧪 Running Tests

This project includes integration tests using Jest.
```bash
npm test
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - List all products (Pagination supported)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)

### Cart
- `GET /api/cart` - View cart
- `POST /api/cart` - Add item
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item

### Orders
- `POST /api/orders` - Checkout (Create Order)
- `GET /api/orders/my` - Get user order history

## 👤 Sample Accounts (from Seed)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@dangkhoasport.com` | `password123` |
| **User** | `john@example.com` | `password123` |

---
*Created with ❤️ by Tuan (Fresher Node.js Developer)*
