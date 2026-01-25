const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Orders
exports.getAllOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find().sort('-createdAt').populate('user', 'name email');
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!order) return next(new AppError('Order not found', 404));

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

// Products (Admin Actions)
exports.createProduct = catchAsync(async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { product }
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({
        status: 'success',
        data: { product }
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    res.status(204).json({
        status: 'success',
        data: null
    });
});
