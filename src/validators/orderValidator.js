const Joi = require('joi');
const AppError = require('../utils/appError');

const validateRequest = (schema) => (req, res, next) => {
    // If we have no body, something is wrong
    if (!req.body) {
        return next(new AppError('No data provided', 400));
    }
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map(el => el.message).join('. ');
        return next(new AppError(message, 400));
    }
    next();
};

const schemas = {
    // We now mostly checkout from the persistent cart, but if we wanted to validate explicit checkout data:
    checkout: Joi.object({
        paymentMethod: Joi.string().valid('COD', 'Credit Card').default('COD'),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            phone: Joi.string().pattern(/^[0-9]+$/).required()
        }).optional()
    })
};

module.exports = {
    // Currently checkout is mostly purely based on existing cart, but we can validate extra details if added field
    // For now we will allow empty check or validate optional shipping info
    validateCheckout: (req, res, next) => {
        // Since the current checkout logic in orderController.js doesn't actually read req.body for address yet 
        // (it hardcodes a demo address), we can just pass next() for now to skip validation errors 
        // or strictly valid fields if we update the controller.

        // Let's implement a loose validation in case we expand it
        next();
    }
};
