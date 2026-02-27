const Order = require('../models/Order');

class OrderRepository {
    async findAll(filter = {}) {
        return await Order.find(filter);
    }

    async count(filter = {}) {
        return await Order.countDocuments(filter);
    }

    async aggregateRevenue() {
        const orders = await Order.find();
        return orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    }
}

module.exports = new OrderRepository();
