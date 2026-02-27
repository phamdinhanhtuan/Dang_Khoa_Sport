const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/appError');

class CategoryService {
    /**
     * Fetch all categories with optional filtering
     * @param {Object} queryParams 
     * @returns {Promise<Array>}
     */
    async getAllCategories(queryParams = {}) {
        const filter = {};
        if (queryParams.q) {
            filter.name = { $regex: queryParams.q, $options: 'i' };
        }
        return await categoryRepository.findAll(filter);
    }

    /**
     * Fetch categories specifically for the header
     * @returns {Promise<Array>}
     */
    async getHeaderCategories() {
        return await categoryRepository.findInHeader();
    }

    /**
     * Get categories sorted for admin view
     * @returns {Promise<Array>}
     */
    async getCategoriesSorted() {
        return await categoryRepository.findAll({}, 'group parent name');
    }

    /**
     * Get possible parent categories
     * @param {String} excludeId 
     * @returns {Promise<Array>}
     */
    async getParentCategories(excludeId = null) {
        return await categoryRepository.findParents(excludeId);
    }

    /**
     * Get a single category by ID
     * @param {String} id 
     * @returns {Promise<Object>}
     */
    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }

    /**
     * Create a new category with data normalization
     * @param {Object} categoryData 
     * @returns {Promise<Object>}
     */
    async createCategory(categoryData) {
        const normalizedData = this._normalizeData(categoryData);
        return await categoryRepository.create(normalizedData);
    }

    /**
     * Update an existing category
     * @param {String} id 
     * @param {Object} updateData 
     * @returns {Promise<Object>}
     */
    async updateCategory(id, updateData) {
        const normalizedData = this._normalizeData(updateData);
        const category = await categoryRepository.update(id, normalizedData);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }

    /**
     * Delete a category
     * @param {String} id 
     * @returns {Promise<Object>}
     */
    async deleteCategory(id) {
        const category = await categoryRepository.delete(id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }

    /**
     * Orchestrate data for the Mega Menu
     * @returns {Promise<Object>}
     */
    async getMegaMenuData() {
        const categories = await categoryRepository.findAll({}, 'name');
        const groups = ['team-sports', 'racket-individual', 'billiards-accessories'];
        const menu = {};

        groups.forEach(groupName => {
            menu[groupName] = { columns: [] };

            const parentsInGroup = categories.filter(c => c.group === groupName && !c.parent);

            parentsInGroup.forEach(parent => {
                const children = categories.filter(c =>
                    c.parent && c.parent._id.toString() === parent._id.toString()
                );

                menu[groupName].columns.push({
                    parent,
                    children
                });
            });
        });

        return menu;
    }

    /**
     * Seed default category structure
     */
    async seedDefaultCategories() {
        const defaultCategories = [
            { name: 'Bóng Đá', group: 'team-sports', parent: null },
            { name: 'Bóng Chuyền', group: 'team-sports', parent: null },
            { name: 'Bóng Rổ', group: 'team-sports', parent: null },
            { name: 'Pickleball', group: 'racket-individual', parent: null },
            { name: 'Cầu Lông', group: 'racket-individual', parent: null },
            { name: 'Tennis', group: 'racket-individual', parent: null },
            { name: 'Chạy Bộ', group: 'racket-individual', parent: null },
            { name: 'Bi-a', group: 'billiards-accessories', parent: null },
            { name: 'Phụ Kiện', group: 'billiards-accessories', parent: null }
        ];

        for (const cat of defaultCategories) {
            const exists = await categoryRepository.findOne({ name: cat.name });
            if (!exists) {
                await categoryRepository.create(cat);
            } else if (exists.group === 'other') {
                await categoryRepository.update(exists._id, { group: cat.group });
            }
        }

        const pickleball = await categoryRepository.findOne({ name: 'Pickleball' });
        if (pickleball) {
            const subCategories = ['Vợt Pickleball', 'Bóng Pickleball', 'Giày Pickleball'];
            for (const name of subCategories) {
                const exists = await categoryRepository.findOne({ name });
                if (!exists) {
                    await categoryRepository.create({
                        name,
                        parent: pickleball._id,
                        group: 'racket-individual'
                    });
                }
            }
        }
    }

    /**
     * Normalize incoming form data
     * @private
     */
    _normalizeData(data) {
        return {
            ...data,
            parent: data.parent === '' ? null : data.parent,
            showInHeader: data.showInHeader === 'true' || data.showInHeader === true,
            showAsHot: data.showAsHot === 'true' || data.showAsHot === true,
            order: data.order ? Number(data.order) : 0
        };
    }
}

module.exports = new CategoryService();
