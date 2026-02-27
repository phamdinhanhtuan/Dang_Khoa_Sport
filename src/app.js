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
const User = require('./models/User');
const Review = require('./models/Review');
const Product = require('./models/Product');
const Category = require('./models/categoryModel');

dotenv.config();

const app = express();
// Force Restart for Chatbot Routes

app.set('view engine', 'ejs');
if (process.env.IS_ADMIN === 'true') {
    app.set('views', path.join(__dirname, 'views/admin'));
    console.log('🛡️  ADMIN VIEW ENGINE: src/views/admin');
} else {
    app.set('views', path.join(__dirname, 'views'));
    console.log('🛍️  CUSTOMER VIEW ENGINE: src/views');
}

// Core Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Global Data & Session Auth Middleware
app.use(async (req, res, next) => {
    try {
        res.locals.formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        res.locals.isAdmin = process.env.IS_ADMIN === 'true';
        res.locals.path = req.path;

        let user = null;
        let token = req.cookies.jwt || req.session.token;

        if (token) {
            try {
                const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
                user = await require('./models/User').findById(decoded.id);
            } catch (err) { }
        }

        res.locals.user = user;
        req.user = user;

        // Customer Only Logic
        if (!res.locals.isAdmin) {
            let cartCount = 0;
            if (user) {
                const cart = await Cart.findOne({ user: user._id });
                if (cart && cart.items) {
                    cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
                }
            }
            res.locals.cartCount = cartCount;
        }

    } catch (err) {
        console.error('Middleware Error:', err);
    }
    next();
});

// Mega Menu (Only for Storefront)
if (process.env.IS_ADMIN !== 'true') {
    app.use(require('./middleware/megaMenuMiddleware'));
}

// ROUTE MOUNTING
if (process.env.IS_ADMIN === 'true') {
    // --- ADMIN PORTAL ROUTES ---
    console.log('🛡️  Mounting ADMIN routes only');

    // Top-level redirects for common paths in Admin Portal
    app.get('/login', (req, res) => res.render('login')); // Renders src/views/admin/login.ejs
    app.use('/admin', require('./routes/admin.routes'));
    app.use('/auth', require('./routes/authRoutes'));

    // Convenience: Home redirects to Dashboard
    app.get('/', (req, res) => res.redirect('/admin'));
} else {
    // --- CUSTOMER STOREFRONT ROUTES ---
    console.log('🛍️  Mounting CUSTOMER routes only');
    app.get('/shop', (req, res) => res.redirect('/products'));
    app.use('/', require('./routes/viewRoutes'));
    app.use('/auth', require('./routes/authRoutes'));
    app.use('/api/chatbot', require('./routes/chatbotRoutes'));
}

// 404
app.use((req, res) => {
    if (process.env.IS_ADMIN === 'true') {
        res.status(404).render('404', {
            title: '404 - Not Found',
            path: '404'
        });
    } else {
        res.status(404).render('404', {
            pageTitle: 'Không tìm thấy trang'
        });
    }
});

// Error Handler
/* 
// For now, simple inline error handler to avoid requiring missing file
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(err.statusCode || 500).render('error', { 
        pageTitle: 'Lỗi', 
        message: err.message || 'Something went wrong'
    });
});
*/
app.use(require('./middleware/errorHandler'));

module.exports = app;
