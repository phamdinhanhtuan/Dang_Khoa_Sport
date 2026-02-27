const Category = require('../models/categoryModel');

const megaMenuMiddleware = async (req, res, next) => {
    try {
        const categories = await Category.find().sort('name');

        // 1. Initialize structure matching the frontend design for the main Mega Menu
        const megaMenu = {
            'team-sports': { title: 'THỂ THAO ĐỒNG ĐỘI', class: 'primary', columns: [] },
            'racket-individual': { title: 'RACKET & CÁ NHÂN', class: 'success', columns: [] },
            'billiards-accessories': { title: 'BI-A & PHỤ KIỆN', class: 'dark', columns: [] },
        };

        const parents = categories.filter(c => !c.parent);
        const childrenList = categories.filter(c => c.parent);

        parents.forEach(parent => {
            const groupKey = parent.group;
            if (megaMenu[groupKey]) {
                const children = childrenList.filter(c => c.parent.toString() === parent._id.toString());
                megaMenu[groupKey].columns.push({
                    parent: parent,
                    children: children
                });
            }
        });

        // 2. Fetch categories specifically for the horizontal bar in the header
        const headerCategories = categories
            .filter(c => c.showInHeader)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(cat => {
                const children = childrenList
                    .filter(child => child.parent.toString() === cat._id.toString())
                    .sort((a, b) => a.name.localeCompare(b.name));

                const catObj = cat.toObject ? cat.toObject() : cat;
                return { ...catObj, children };
            });

        // 3. Find specific 'Sale' category for special styling if needed
        const saleCategory = categories.find(c => c.group === 'sale' && c.showInHeader);

        res.locals.megaMenu = megaMenu;
        res.locals.headerCategories = headerCategories;
        res.locals.saleCategory = saleCategory;
        res.locals.allCategories = categories;

    } catch (err) {
        console.error('Mega Menu Middleware Error:', err);
        res.locals.megaMenu = {};
        res.locals.headerCategories = [];
        res.locals.saleCategory = null;
    }
    next();
};

module.exports = megaMenuMiddleware;
