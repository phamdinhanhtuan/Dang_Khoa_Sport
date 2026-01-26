const Joi = require('joi');
const AppError = require('../utils/appError');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map(el => el.message).join('. ');
        return next(new AppError(message, 400));
    }
    next();
};

const schemas = {
    productCreate: Joi.object({
        name: Joi.string().required().min(3),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        category: Joi.string().required(), // Ideally validate objectId
        brand: Joi.string().optional(),
        stock: Joi.number().optional().min(0)
    }),
    productUpdate: Joi.object({
        name: Joi.string().min(3),
        price: Joi.number().min(0),
        description: Joi.string(),
        category: Joi.string(),
        brand: Joi.string(),
        stock: Joi.number().min(0)
    })
};

module.exports = {
    validateProductCreate: validateRequest(schemas.productCreate),
    validateProductUpdate: validateRequest(schemas.productUpdate)
};
