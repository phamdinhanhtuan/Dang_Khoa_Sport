const authService = require('../services/authService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cartService');

const createSendToken = (user, token, statusCode, req, res) => {
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

    const expectsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if ((req.originalUrl.startsWith('/api') || req.headers['content-type'] === 'application/json') && !expectsHtml) {
        res.status(statusCode).json({
            status: 'success',
            token,
            data: { user }
        });
    } else {
        const url = req.session.returnTo || '/';
        req.session.returnTo = null;

        // CRITICAL FIX: Ensure session is saved before redirecting
        if (req.session) {
            req.session.save((err) => {
                if (err) console.error('Session save error', err);
                res.redirect(url);
            });
        } else {
            res.redirect(url);
        }
    }
};

const mergeCart = async (user, req) => {
    if (req.session && req.session.cart) {
        await cartService.mergeSessionCart(user._id, req.session.cart);
        req.session.cart = null;
    }
};

exports.getLoginForm = (req, res) => {
    res.render('shop/login', {
        pageTitle: 'Đăng nhập',
        path: '/login'
    });
};

exports.getSignupForm = (req, res) => {
    res.render('shop/signup', {
        pageTitle: 'Đăng ký',
        path: '/signup'
    });
};

exports.signup = async (req, res, next) => {
    try {
        const { user, token } = await authService.signup({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: 'user'
        });

        await mergeCart(user, req);
        createSendToken(user, token, 201, req, res);
    } catch (err) {
        if (err.code === 11000) { // Duplicate email
            return res.render('shop/signup', {
                pageTitle: 'Đăng ký',
                path: '/signup',
                error: 'Email này đã được sử dụng. Vui lòng chọn email khác.'
            });
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    try {
        const { user, token } = await authService.login(email, password);
        await mergeCart(user, req);
        createSendToken(user, token, 200, req, res);
    } catch (err) {
        // Handle specific auth errors by re-rendering login
        // Only render login page if it's NOT an API request
        const expectsHtml = req.headers.accept && req.headers.accept.includes('text/html');
        if (!expectsHtml && (req.originalUrl.startsWith('/api') || req.headers['content-type'] === 'application/json')) {
            return res.status(err.statusCode || 401).json({
                status: 'fail',
                message: err.message
            });
        }

        return res.render('shop/login', {
            pageTitle: 'Đăng nhập',
            path: '/login',
            error: err.message || 'Đăng nhập thất bại'
        });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    if (req.session) {
        req.session.destroy();
    }
    res.redirect('/');
};
