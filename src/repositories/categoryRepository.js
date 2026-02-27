const Category = require('../models/categoryModel');

class CategoryRepository {
    async findAll(filter = {}, sort = 'order name') {
        return await Category.find(filter).populate('parent').sort(sort);
    }

    async findById(id) {
        return await Category.findById(id).populate('parent');
    }

    async findOne(filter) {
        return await Category.findOne(filter);
    }

    async create(data) {
        return await Category.create(data);
    }

    async update(id, data) {
        return await Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }

    async findParents(excludeId = null) {
        const query = { parent: null };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        return await Category.find(query).sort('name');
    }

    async findInHeader() {
        return await Category.find({ showInHeader: true }).sort('order name');
    }
}

module.exports = new CategoryRepository();
