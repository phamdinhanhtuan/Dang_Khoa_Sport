const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');
const categoryService = require('../services/categoryService');
const userService = require('../services/userService');
const Product = require('../models/Product');

class AdminController {
    /**
     * Dashboard
     */
    getDashboard = catchAsync(async (req, res) => {
        const stats = await adminService.getDashboardStats();
        const monthlyRevenue = await adminService.getMonthlyRevenue();

        res.render('dashboard', {
            title: 'Admin Dashboard',
            ...stats,
            monthlyRevenue,
            path: '/admin'
        });
    });

    /**
     * Products
     */
    listProducts = catchAsync(async (req, res) => {
        const products = await adminService.getAllProducts(req.query);
        const categories = await categoryService.getAllCategories();

        res.render('products', {
            title: 'Product Management',
            products,
            categories,
            searchQuery: req.query.q || '',
            currentCategory: req.query.category || '',
            path: '/admin/products'
        });
    });

    createProduct = catchAsync(async (req, res) => {
        const productData = { ...req.body };

        // Handle Main Image (Single)
        if (req.files && req.files['image']) {
            productData.image = `/images/products/${req.files['image'][0].filename}`;
        } else if (req.body.imageUrl) {
            productData.image = req.body.imageUrl;
        }

        // Handle Gallery Images (Multiple)
        if (req.files && req.files['galleryImages']) {
            productData.images = req.files['galleryImages'].map(f => `/images/products/${f.filename}`);
        }

        await adminService.createProduct(productData);
        res.redirect('/admin/products');
    });

    updateProduct = catchAsync(async (req, res) => {
        const productData = { ...req.body };

        // Handle Main Image
        if (req.files && req.files['image']) {
            productData.image = `/images/products/${req.files['image'][0].filename}`;
        } else if (req.body.imageUrl) {
            productData.image = req.body.imageUrl;
        }

        // Handle Gallery Images
        let gallery = [];
        if (req.body.existingImages) {
            gallery = req.body.existingImages.split(',').filter(img => img.length > 0);
        }

        if (req.files && req.files['galleryImages']) {
            const newImages = req.files['galleryImages'].map(f => `/images/products/${f.filename}`);
            gallery = [...gallery, ...newImages];
        }
        productData.images = gallery;

        await adminService.updateProduct(req.params.id, productData);
        res.redirect('/admin/products');
    });

    deleteProduct = catchAsync(async (req, res) => {
        await adminService.softDeleteProduct(req.params.id);
        res.redirect('/admin/products');
    });

    getProductForm = catchAsync(async (req, res) => {
        let product = {};
        if (req.params.id) {
            product = await Product.findById(req.params.id);
        }
        const categories = await categoryService.getAllCategories();
        res.render('product-form', {
            title: req.params.id ? 'Edit Product' : 'Add Product',
            product,
            categories,
            path: '/admin/products'
        });
    });

    /**
     * Orders
     */
    listOrders = catchAsync(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const result = await adminService.getAllOrders(page);

        res.render('orders', {
            title: 'Order Management',
            ...result,
            path: '/admin/orders'
        });
    });

    getOrderDetail = catchAsync(async (req, res) => {
        const order = await adminService.getOrderDetail(req.params.id);
        res.render('order-detail', {
            title: `Order #${order._id}`,
            order,
            path: '/admin/orders'
        });
    });

    updateOrderStatus = catchAsync(async (req, res) => {
        await adminService.updateOrderStatus(req.params.id, req.body.status);
        res.redirect(`/admin/orders/${req.params.id}`);
    });

    /**
     * Categories
     */
    listCategories = catchAsync(async (req, res) => {
        const categories = await categoryService.getAllCategories(req.query);
        res.render('categories', {
            title: 'Category Management',
            categories,
            searchQuery: req.query.q || '',
            path: '/admin/categories'
        });
    });

    getCategoryForm = catchAsync(async (req, res) => {
        let category = {};
        if (req.params.id) {
            category = await categoryService.getCategoryById(req.params.id);
        }
        const parents = await categoryService.getParentCategories(req.params.id);
        res.render('category-form', {
            title: req.params.id ? 'Edit Category' : 'Add Category',
            category,
            parents,
            path: '/admin/categories'
        });
    });

    createCategory = catchAsync(async (req, res) => {
        await categoryService.createCategory(req.body);
        res.redirect('/admin/categories');
    });

    updateCategory = catchAsync(async (req, res) => {
        await categoryService.updateCategory(req.params.id, req.body);
        res.redirect('/admin/categories');
    });

    seedCategories = catchAsync(async (req, res) => {
        await categoryService.seedDefaultCategories();
        res.redirect('/admin/categories');
    });

    deleteCategory = catchAsync(async (req, res) => {
        await categoryService.deleteCategory(req.params.id);
        res.redirect('/admin/categories');
    });

    /**
     * Users
     */
    listUsers = catchAsync(async (req, res) => {
        const users = await userService.getAllUsers();
        res.render('users', {
            title: 'User Management',
            users,
            path: '/admin/users'
        });
    });

    deleteUser = catchAsync(async (req, res) => {
        await userService.deleteUser(req.params.id);
        res.redirect('/admin/users');
    });
}

module.exports = new AdminController();
