module.exports = fn => {
    return (req, res, next) => {
        if (typeof next !== 'function') {
            console.error('CRITICAL ERROR: catchAsync middleware received invalid next function!', next);
            if (res && typeof res.status === 'function') {
                return res.status(500).json({ status: 'error', message: 'Internal Server Error: Middleware misconfiguration' });
            }
            return;
        }
        fn(req, res, next).catch(next);
    };
};
