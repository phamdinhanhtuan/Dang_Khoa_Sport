const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Category = require('../models/categoryModel'); // Needed for form rendering

// API Controllers
exports.getAllProducts = catchAsync(async (req, res, next) => {
    const { products, total } = await productService.getAllProducts(req.query);
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 12;

    // If request wants JSON (API)
    if (req.originalUrl.startsWith('/api')) {
        res.status(200).json({
            status: 'success',
            results: products.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: { products }
        });
    } else {
        // If view rendering (Admin or Shop)
        res.locals.products = products;
        res.locals.total = total;
        res.locals.currentPage = page;
        res.locals.totalPages = Math.ceil(total / limit);
        next();
    }
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    if (req.originalUrl.startsWith('/api')) {
        res.status(200).json({ status: 'success', data: { product } });
    } else {
        res.locals.product = product;
        next();
    }
});

exports.createProduct = catchAsync(async (req, res, next) => {
    // Handle file upload if present
    if (req.file) req.body.images = [`/uploads/${req.file.filename}`];

    const newProduct = await productService.createProduct(req.body);

    if (req.originalUrl.startsWith('/api')) {
        res.status(201).json({ status: 'success', data: { product: newProduct } });
    } else {
        res.redirect('/admin/products');
    }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    if (req.file) req.body.images = [`/uploads/${req.file.filename}`];

    const updatedProduct = await productService.updateProduct(req.params.id, req.body);

    if (!updatedProduct) {
        return next(new AppError('No product found with that ID', 404));
    }

    if (req.originalUrl.startsWith('/api')) {
        res.status(200).json({ status: 'success', data: { product: updatedProduct } });
    } else {
        res.redirect('/admin/products');
    }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await productService.deleteProduct(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    if (req.originalUrl.startsWith('/api')) {
        res.status(204).json({ status: 'success', data: null });
    } else {
        res.redirect('/admin/products');
    }
});

// View Controllers for Admin Product Pages (Simplified here for cohesion)
exports.getAdminProductForm = catchAsync(async (req, res) => {
    const categories = await Category.find();
    res.render('admin/add-product', {
        title: 'Add Product',
        categories
    });
});

exports.getAdminEditProductForm = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    const categories = await Category.find();

    res.render('admin/edit-product', {
        title: 'Edit Product',
        product,
        categories
    });
});
