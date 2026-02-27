const categoryService = require('../services/categoryService');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller for Admin Category Management
 */

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await categoryService.getAllCategories(req.query);

    res.render('categories', {
        title: 'Manage Categories',
        categories,
        searchQuery: req.query.q || '',
        path: '/admin/categories'
    });
});

exports.getNewCategoryForm = catchAsync(async (req, res, next) => {
    const parents = await categoryService.getParentCategories();

    res.render('admin/category-form', {
        title: 'New Category',
        category: {},
        parents,
        path: '/admin/categories'
    });
});

exports.createCategory = catchAsync(async (req, res, next) => {
    try {
        await categoryService.createCategory(req.body);
        res.redirect('/admin/categories');
    } catch (err) {
        // Handling validation or duplicate key errors for the UI
        const errorMessage = err.code === 11000
            ? 'Category name already exists.'
            : (err.message || 'Could not create category.');

        const parents = await categoryService.getParentCategories();
        res.render('admin/category-form', {
            title: 'New Category',
            category: req.body,
            parents,
            error: errorMessage,
            path: '/admin/categories'
        });
    }
});

exports.getEditCategoryForm = catchAsync(async (req, res, next) => {
    const category = await categoryService.getCategoryById(req.params.id);
    const parents = await categoryService.getParentCategories(category._id);

    res.render('admin/category-form', {
        title: 'Edit Category',
        category,
        parents,
        path: '/admin/categories'
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    try {
        await categoryService.updateCategory(req.params.id, req.body);
        res.redirect('/admin/categories');
    } catch (err) {
        const category = { _id: req.params.id, ...req.body };
        const parents = await categoryService.getParentCategories(req.params.id);

        res.render('admin/category-form', {
            title: 'Edit Category',
            category,
            parents,
            error: 'Could not update category.',
            path: '/admin/categories'
        });
    }
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    await categoryService.deleteCategory(req.params.id);
    res.redirect('/admin/categories');
});

exports.seedCategories = catchAsync(async (req, res, next) => {
    await categoryService.seedDefaultCategories();
    res.send('Seeding completed! You can check the menu now.');
});
