const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error for debugging
    // console.error('ERROR 💥 MESSAGE:', err.message);
    // console.error('ERROR 💥 STACK:', err.stack);

    // API Response
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // Rendered Error Page
    res.locals.user = res.locals.user || null;
    res.locals.cartCount = res.locals.cartCount || 0;

    // Ensure 118n helper is available
    res.locals.__ = res.locals.__ || (req && req.__) || ((key) => key);
    res.locals.locale = res.locals.locale || 'vi';
    res.locals.megaMenu = res.locals.megaMenu || {};

    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message,
        error: err
    });
};

module.exports = errorHandler;
