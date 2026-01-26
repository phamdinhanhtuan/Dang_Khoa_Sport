const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
        res.render('admin/orders', { title: 'Order Management', orders });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        res.render('admin/order-detail', { title: 'Order Details', order });
    } catch (err) {
        res.redirect('/admin/orders');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (err) {
        res.redirect('/admin/orders');
    }
};
