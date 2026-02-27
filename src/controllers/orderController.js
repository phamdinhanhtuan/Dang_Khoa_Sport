const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');

exports.getCheckout = (req, res) => {
    res.render('shop/checkout', {
        pageTitle: 'Thanh toán',
        user: req.user
    });
};

exports.postCheckout = catchAsync(async (req, res, next) => {
    // Form sends: fullName, phone, address, city (Province), district, ward, note
    const { fullName, phone, address, city, district, ward, note } = req.body;

    const shippingData = {
        fullName,
        phone,
        // Model expects: addressLine, city, province.
        // Mapping: 
        // addressLine = address + ward
        // city = district
        // province = city (from form)
        addressLine: `${address}, ${ward}`,
        city: district,
        province: city,
        note
    };

    try {
        const order = await orderService.createOrderFromCart(req.user._id, shippingData);
        // Bonus: Send Email here
        res.redirect(`/orders/${order._id}`);
    } catch (err) {
        console.error(err); // Log for debug
        res.render('shop/checkout', {
            pageTitle: 'Thanh toán',
            user: req.user,
            error: err.message
        });
    }
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await orderService.getUserOrders(req.user._id);
    res.render('shop/orders', {
        pageTitle: 'Đơn hàng của tôi',
        orders
    });
});

exports.getOrderDetail = catchAsync(async (req, res, next) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    res.render('shop/order-detail', {
        pageTitle: 'Chi tiết đơn hàng',
        order
    });
});
