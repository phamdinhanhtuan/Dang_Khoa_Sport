const BaseRepository = require('./baseRepository');
const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');

class ProductRepository extends BaseRepository {
    constructor() {
        super(Product);
    }

    async findAllAdvanced(queryString) {
        // Resolve Category Slug to ID if needed
        if (queryString.category) {
            const mongoose = require('mongoose');
            const Category = require('../models/categoryModel');

            if (!mongoose.Types.ObjectId.isValid(queryString.category)) {
                const category = await Category.findOne({ slug: queryString.category });
                if (category) {
                    queryString.category = category._id;
                } else {
                    // Invalid category slug, returns empty
                    return { products: [], total: 0 };
                }
            }
        }

        // Handle Price Range (min/max -> price[gte]/price[lte])
        if (queryString.min || queryString.max) {
            queryString.price = {};
            if (queryString.min) queryString.price.gte = queryString.min;
            if (queryString.max) queryString.price.lte = queryString.max;
            delete queryString.min;
            delete queryString.max;
        }

        // 1. Create a query for counting (without pagination/sorting/limiting)
        const countFeatures = new APIFeatures(this.model.find(), queryString)
            .filter()
            .search();
        const total = await countFeatures.query.countDocuments();

        // 2. Create actual query
        const features = new APIFeatures(this.model.find().populate('category'), queryString)
            .filter()
            .search()
            .sort()
            .limitFields()
            .paginate();

        const products = await features.query;

        return { products, total };
    }

    async findByIdWithCategory(id) {
        return await this.model.findById(id).populate('category').populate('reviews');
    }
}

module.exports = new ProductRepository();
