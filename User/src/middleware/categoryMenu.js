const Category = require('../models/categoryModel');

module.exports = async (req, res, next) => {
    try {
        const categories = await Category.find().populate('parent');

        // Build Tree efficiently using Map
        const catMap = {};
        const roots = [];

        // 1. Initialize empty children arrays and map by ID
        categories.forEach(cat => {
            catMap[cat._id.toString()] = { ...cat.toObject(), children: [] };
        });

        // 2. Link children to parents
        categories.forEach(cat => {
            const catNode = catMap[cat._id.toString()];
            if (cat.parent) {
                const parentId = cat.parent._id.toString();
                if (catMap[parentId]) {
                    catMap[parentId].children.push(catNode);
                }
            } else {
                roots.push(catNode);
            }
        });

        res.locals.menuCategories = roots;
        next();
    } catch (err) {
        console.error('Menu Middleware Error:', err);
        res.locals.menuCategories = [];
        next();
    }
};
