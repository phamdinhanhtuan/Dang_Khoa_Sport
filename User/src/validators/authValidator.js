const Joi = require('joi');
const AppError = require('../utils/appError');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }
    next();
};

const schemas = {
    signup: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        passwordConfirm: Joi.string().valid(Joi.ref('password')).optional(),
        role: Joi.string().valid('user', 'admin').default('user')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

module.exports = {
    validateSignup: validateRequest(schemas.signup),
    validateLogin: validateRequest(schemas.login)
};
