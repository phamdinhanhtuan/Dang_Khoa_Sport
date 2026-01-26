const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress } = req.body;

    // 1. Get Cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty', 400));
    }

    // 2. Validate Address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.province) {
        // API: error
        // Web: If form submit, handle inside component or redirect.
        // Assuming API usage as per prompt.
        return next(new AppError('Please provide full shipping address', 400));
    }

    // 3. Process Items & Stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
        if (!item.product) continue;
        if (item.product.stock < item.quantity) {
            return next(new AppError(`Product ${item.product.name} out of stock`, 400));
        }

        totalAmount += item.product.price * item.quantity;
        orderItems.push({
            product: item.product.toObject(),
            quantity: item.quantity,
            price: item.product.price
        });
    }

    // 4. Create Order
    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        status: 'pending'
    });

    // 5. Reduce Stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // 6. Clear Cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    if (req.originalUrl.startsWith('/api')) {
        res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
    } else {
        res.render('my-orders', { title: 'My Orders', orders });
    }
});

exports.getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Permission denied', 403));
    }

    if (req.originalUrl.startsWith('/api')) {
        res.status(200).json({ status: 'success', data: { order } });
    } else {
        res.render('order-detail', { title: `Order #${order._id}`, order });
    }
});
