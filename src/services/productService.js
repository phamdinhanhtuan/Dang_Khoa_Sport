const Product = require('../models/Product');
const Category = require('../models/categoryModel');
const categoryService = require('./categoryService');
const AppError = require('../utils/appError');

class ProductService {
    /**
     * Fetch all data required for the Homepage
     * @returns {Object} { newArrivals, sectionProducts }
     */
    async getHomePageData() {
        // 1. New Arrivals
        const newArrivals = await Product.find().sort('-createdAt').limit(8);

        // 2. Helper to find category IDs
        const findCategoryIds = async (regex) => {
            const cats = await Category.find({ name: { $regex: regex, $options: 'i' } });
            return cats.map(c => c._id);
        };

        // 3. Fetch specific sections
        const sections = [
            { key: 'pickleballProducts', regex: 'Pickleball' },
            { key: 'volleyballProducts', regex: 'Bóng chuyền' },
            { key: 'runningProducts', regex: 'Chạy' },
            { key: 'billiardProducts', regex: 'Bi-a' },
            { key: 'basketballProducts', regex: 'Bóng rổ' }
        ];

        const sectionData = {};

        await Promise.all(sections.map(async (sec) => {
            const ids = await findCategoryIds(sec.regex);
            sectionData[sec.key] = await Product.find({ category: { $in: ids } }).limit(4).sort('-createdAt');
        }));


        // 4. Fetch Mega Menu Data
        const megaMenu = await categoryService.getMegaMenuData();

        return { newArrivals, megaMenu, ...sectionData };
    }

    /**
     * Filter, Search, and Sort Products based on Query Parameters
     * @param {Object} queryParams - req.query
     * @returns {Object} { products, currentCategory, filterMeta }
     */
    async filterProducts(queryParams) {
        let filter = {};
        let currentCategory = null;

        // 1. Search Logic
        if (queryParams.q) {
            const keyword = queryParams.q.trim();
            // Flexible fuzzy-like search: Each word must appear in any order
            const words = keyword.split(/\s+/).filter(w => w.length > 0);
            const regexString = words.map(w => `(?=.*${w})`).join('');
            const regex = new RegExp(regexString, 'i');

            filter.$or = [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { brand: { $regex: regex } }
            ];
        }

        // 2. Brand Logic
        if (queryParams.brand) {
            filter.brand = { $regex: queryParams.brand, $options: 'i' };
        }

        // 3. Gender Logic
        if (queryParams.gender) {
            const genderMap = {
                'male': 'Nam',
                'female': 'Nữ',
                'kid': 'Trẻ em',
                'unisex': 'Unisex'
            };
            const dbGender = genderMap[queryParams.gender] || queryParams.gender;
            filter.$or = [
                { gender: dbGender },
                { name: { $regex: dbGender, $options: 'i' } }
            ];
        }

        // 4. Category Logic
        if (queryParams.cat) {
            if (queryParams.cat.match(/^[0-9a-fA-F]{24}$/)) {
                filter.category = queryParams.cat;
                currentCategory = await Category.findById(queryParams.cat);
            } else {
                // Slug/Name magic
                const slug = queryParams.cat;
                let foundCat = await Category.findOne({ slug: slug });

                if (!foundCat) {
                    const looseName = slug.replace(/-/g, '.*');
                    foundCat = await Category.findOne({ name: { $regex: looseName, $options: 'i' } });
                }

                if (foundCat) {
                    currentCategory = foundCat;
                    const childCats = await Category.find({ parent: foundCat._id });
                    const allCatIds = [foundCat._id, ...childCats.map(c => c._id)];
                    filter.category = { $in: allCatIds };
                } else {
                    // Force empty result if explicit category not found
                    filter.category = '000000000000000000000000';
                }
            }
        }

        // 5. Build Query
        let query = Product.find(filter).populate('category');

        // 6. Sorting
        const sort = queryParams.sort || 'latest';
        if (sort === 'price-asc') query = query.sort({ price: 1 });
        else if (sort === 'price-desc') query = query.sort({ price: -1 });
        else query = query.sort({ createdAt: -1 });

        const products = await query;
        const allCategories = await Category.find(); // For sidebar

        return {
            products,
            allCategories,
            currentCategory,
            searchQuery: queryParams.q || '',
            currentGender: queryParams.gender || '',
            currentSort: sort
        };
    }

    /**
     * Get Product Details and increment view count
     * @param {String} id 
     * @returns {Object} Product document
     */
    async getProductById(id) {
        const product = await Product.findById(id)
            .populate('category')
            .populate({
                path: 'reviews',
                populate: { path: 'user', select: 'name' }
            });

        if (!product) return null;

        // Increment View Count
        product.viewCount = (product.viewCount || 0) + 1;
        await product.save({ validateBeforeSave: false });

        return product;
    }

    /**
     * Get Products by ID List (for Recently Viewed)
     */
    async getProductsByIds(ids) {
        return await Product.find({ _id: { $in: ids } });
    }
    // 5. Admin: Get All Products (with filters)
    async getAllProductsAdmin(query) {
        let filter = {};
        if (query.q) {
            filter.name = { $regex: query.q, $options: 'i' };
        }
        if (query.category) {
            filter.category = query.category;
        }

        return await Product.find(filter).populate('category').sort('-createdAt');
    }

    // 6. Admin: Create Product
    async createProduct(data) {
        return await Product.create(data);
    }

    // 7. Admin: Update Product
    async updateProduct(id, data) {
        return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    // 8. Admin: Delete Product
    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }
}

module.exports = new ProductService();
