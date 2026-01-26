const BaseRepository = require('./baseRepository');
const Order = require('../models/orderModel');

class OrderRepository extends BaseRepository {
    constructor() {
        super(Order);
    }

    async findByUser(userId) {
        return await this.model.find({ user: userId }).sort('-createdAt');
    }

    async findRecent(limit = 5) {
        return await this.model.find().sort('-createdAt').limit(limit).populate('user');
    }
}

module.exports = new OrderRepository();
