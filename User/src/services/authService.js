const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '90d' // Simplified for demo
    });
};

exports.signup = async (userData) => {
    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role // Be careful in prod, sanitize this
    });

    const token = signToken(newUser._id);
    return { user: newUser, token };
};

exports.login = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password!', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    const token = signToken(user._id);
    return { user, token };
};
