const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

class AdminService {
    /**
     * Dashboard Statistics
     */
    async getDashboardStats() {
        const stats = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Product.countDocuments({ isDeleted: false }),
            Order.countDocuments(),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Product.find({ stock: { $lt: 10 }, isDeleted: false }).limit(5)
        ]);

        return {
            userCount: stats[0],
            productCount: stats[1],
            orderCount: stats[2],
            totalRevenue: stats[3][0]?.total || 0,
            lowStockProducts: stats[4]
        };
    }

    async getMonthlyRevenue() {
        return await Order.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
    }

    /**
     * Product Management
     */
    async getAllProducts(query = {}) {
        const products = await Product.find({ isDeleted: false, ...query })
            .populate('category')
            .sort('-createdAt');
        return products;
    }

    async createProduct(data) {
        if (data.price <= 0) throw new AppError('Price must be greater than 0', 400);
        if (data.stock < 0) throw new AppError('Stock cannot be negative', 400);
        return await Product.create(data);
    }

    async updateProduct(id, data) {
        if (data.price !== undefined && data.price <= 0) throw new AppError('Price must be greater than 0', 400);
        if (data.stock !== undefined && data.stock < 0) throw new AppError('Stock cannot be negative', 400);

        const product = await Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!product) throw new AppError('Product not found', 404);
        return product;
    }

    async softDeleteProduct(id) {
        const product = await Product.findByIdAndUpdate(id, { isDeleted: true });
        if (!product) throw new AppError('Product not found', 404);
        return product;
    }

    /**
     * Order Management
     */
    async getAllOrders(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments();
        return { orders, total, pages: Math.ceil(total / limit) };
    }

    async getOrderDetail(id) {
        const order = await Order.findById(id).populate('user', 'name email');
        if (!order) throw new AppError('Order not found', 404);
        return order;
    }

    async updateOrderStatus(id, newStatus) {
        const order = await Order.findById(id);
        if (!order) throw new AppError('Order not found', 404);

        const validTransitions = {
            'pending': ['paid', 'cancelled'],
            'paid': ['shipped', 'cancelled'],
            'shipped': ['completed'],
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[order.status].includes(newStatus)) {
            throw new AppError(`Invalid status transition from ${order.status} to ${newStatus}`, 400);
        }

        // Atomic Stock Reduction on Confirmation (e.g., transition to 'paid' or 'shipped')
        if ((newStatus === 'paid' || newStatus === 'shipped') && order.status === 'pending') {
            for (const item of order.items) {
                const product = await Product.findOneAndUpdate(
                    { _id: item.product._id, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity, soldCount: item.quantity } },
                    { new: true }
                );
                if (!product) throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
            }
        }

        order.status = newStatus;
        return await order.save();
    }
}

module.exports = new AdminService();
