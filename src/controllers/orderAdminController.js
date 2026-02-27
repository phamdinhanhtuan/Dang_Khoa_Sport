const orderService = require('../services/orderService');

exports.getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders(req.query);
        res.render('orders', {
            title: 'Manage Orders',
            orders,
            path: '/admin/orders'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.getOrder = async (req, res) => {
    try {
        // We reuse the existing getOrderById but might need to bypass the user check. 
        // Current getOrderById in service checks for user ownership: Order.findOne({ _id: orderId, user: userId })
        // We need an ADMIN specific get method or update the service.
        // Let's assume for now we need to add an admin method or use findById directly via service if we expose it?
        // Better: Update Service to have getOrderByIdForAdmin
        const order = await orderService.getOrderByIdForAdmin(req.params.id);

        if (!order) return res.redirect('/admin/orders');

        res.render('order-detail', {
            title: 'Order Detail',
            order,
            path: '/admin/orders'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/orders');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await orderService.updateOrderStatus(req.params.id, status);
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/admin/orders');
    }
};
