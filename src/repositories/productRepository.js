const Product = require('../models/Product');

class ProductRepository {
    async find(filter = {}, sort = 'name', limit = null) {
        let query = Product.find(filter).sort(sort);
        if (limit) query = query.limit(limit);
        return await query;
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async count(filter = {}) {
        return await Product.countDocuments(filter);
    }

    async findSimilar(product, limit = 4) {
        return await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(limit);
    }

    async findTopSelling(limit = 4) {
        return await Product.find().sort('-soldCount').limit(limit);
    }

    async findLowStock(threshold = 5) {
        return await Product.find({ stock: { $lt: threshold } });
    }

    async findOverStock(threshold = 100) {
        return await Product.find({ stock: { $gt: threshold } });
    }
}

module.exports = new ProductRepository();
