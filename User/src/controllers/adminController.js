const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
    try {
        const stats = {
            users: await User.countDocuments({ role: 'user' }),
            products: await Product.countDocuments(),
            orders: await Order.countDocuments(),
            revenue: 0
        };

        const revenueData = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        if (revenueData.length > 0) {
            stats.revenue = revenueData[0].total;
        }

        res.render('admin/dashboard', {
            title: 'Dashboard',
            stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
