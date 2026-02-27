const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token;
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.redirect('/login');
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return res.redirect('/login');
        }

        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (err) {
        return res.redirect('/login');
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    // Prevent redirect loop: Clear invalid session and send to login
    res.clearCookie('jwt');
    if (req.session) req.session.token = null;
    res.redirect('/login');
};

module.exports = { auth, adminOnly };
