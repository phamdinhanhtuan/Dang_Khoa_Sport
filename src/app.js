const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Cart = require('./models/Cart');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// USER REQUESTED LOCALE MIDDLEWARE
// GLOBAL DATA MIDDLEWARE
app.use(async (req, res, next) => {
    try {
        const lang = req.query.lang || req.cookies.lang || "vi";
        res.locals.locale = lang;
        res.locals.__ = (k) => k;
        res.locals.formatMoney = (amount) => {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        };

        // Auth & Cart Count Logic
        let user = null;
        let cartCount = 0;

        // 1. Check if user is logged in (Token in cookie or session)
        let token;
        if (req.cookies && req.cookies.jwt) token = req.cookies.jwt;
        else if (req.session && req.session.token) token = req.session.token;

        if (token) {
            try {
                // Verify token
                const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
                const currentUser = await require('./models/User').findById(decoded.id); // Lazy require User
                if (currentUser) {
                    user = currentUser;
                    // Fetch Cart from DB
                    const cart = await Cart.findOne({ user: user._id });
                    if (cart && cart.items) {
                        cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
                    }
                }
            } catch (err) {
                // Invalid token, ignore
            }
        }

        // 2. If no user, check session cart
        if (!user && req.session && req.session.cart) {
            cartCount = req.session.cart.totalQty || 0;
            // Or manual sum if totalQty not maintained
            if (!req.session.cart.totalQty && req.session.cart.items) {
                cartCount = req.session.cart.items.reduce((acc, item) => acc + item.quantity, 0);
            }
        }

        req.user = user;
        res.locals.user = user;
        res.locals.cartCount = cartCount;

    } catch (err) {
        console.error('Middleware Error:', err);
        res.locals.user = null;
        res.locals.cartCount = 0;
    }
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', uptime: process.uptime() });
});

// Route Mounting
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));


// Web Routes
app.use('/', require('./routes/viewRoutes'));
// app.use('/cart', ...); // cartRoutes logic mixed with API? It should generally be unique, but for legacy support:
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));


// 404
app.all(/(.*)/, (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
});

// Error Handler
const errorHandler = require('./middleware/errorHandler');

app.use(errorHandler);

module.exports = app;
