const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return next(new AppError('Access denied. Admins only.', 403));
};
