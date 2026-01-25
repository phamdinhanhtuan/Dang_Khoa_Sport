const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1. Get token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.session && req.session.token) {
        token = req.session.token;
    }

    if (!token) {
        // API -> 401
        if (req.originalUrl.startsWith('/api')) {
            return next(new AppError('Not authorized to access this route', 401));
        }
        // Web -> Login
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }

    try {
        // 2. Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3. Check user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            // User deleted but token still valid
            if (req.originalUrl.startsWith('/api')) {
                return next(new AppError('User no longer exists', 401));
            }
            res.clearCookie('jwt');
            if (req.session) req.session.token = null;
            return res.redirect('/login');
        }

        // 4. Attach user
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (err) {
        if (req.originalUrl.startsWith('/api')) return next(new AppError('Invalid token', 401));
        return res.redirect('/login');
    }
});

// For Views (Optional auth)
exports.isLoggedIn = async (req, res, next) => {
    if ((req.cookies && req.cookies.jwt) || (req.session && req.session.token)) {
        try {
            const token = req.cookies.jwt || req.session.token;
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);
            if (currentUser) {
                req.user = currentUser;
                res.locals.user = currentUser;
            }
        } catch (err) { /**/ }
    }
    next();
};
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
