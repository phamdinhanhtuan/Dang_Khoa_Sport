const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/Cart');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '90d'
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };

    res.cookie('jwt', token, cookieOptions);
    if (req.session) {
        req.session.token = token;
        req.session.user = user;
    }

    user.password = undefined;

    // Check if client expects JSON or if it's a browser form submission
    const expectsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (req.originalUrl.startsWith('/api') && !expectsHtml) {
        res.status(statusCode).json({
            status: 'success',
            token,
            data: { user }
        });
    } else {
        const url = req.session.returnTo || '/';
        req.session.returnTo = null;
        res.redirect(url);
    }
};

// Merge Helper
const mergeCart = async (user, req) => {
    if (req.session && req.session.cart && req.session.cart.items.length > 0) {
        let dbCart = await Cart.findOne({ user: user._id });
        if (!dbCart) dbCart = await Cart.create({ user: user._id, items: [] });
        for (const sItem of req.session.cart.items) {
            const sProdId = (sItem.product && sItem.product._id) ? sItem.product._id.toString() : (sItem.product ? sItem.product.toString() : null);
            if (!sProdId) continue;

            const idx = dbCart.items.findIndex(i => i.product && i.product.toString() === sProdId);
            if (idx > -1) {
                dbCart.items[idx].quantity += sItem.quantity;
            } else {
                dbCart.items.push({ product: sProdId, quantity: sItem.quantity });
            }
        }
        await dbCart.save();
        req.session.cart = null;
    }
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'user' // Force role user for public signup
    });

    await mergeCart(newUser, req);
    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    await mergeCart(user, req);
    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    if (req.session) {
        req.session.destroy();
    }
    // Check if client expects JSON (API client) vs Browser (HTML)
    // But usually logout from browser is a GET request link.
    // If we want to support both, we can check accepts header, but redirecting to / is safe for now as this is primarily a web app.
    res.redirect('/');
};
