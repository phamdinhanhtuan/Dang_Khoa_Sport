const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/categoryModel');
const Order = require('../models/Order'); // Updated
const User = require('../models/User'); // Updated

exports.getHome = catchAsync(async (req, res) => {
    // Get top 4 latest products
    const { products } = await productService.getAllProducts({ limit: 4 });
    res.render('index', {
        title: 'Đăng Khoa Sport - Home',
        featuredProducts: products
    });
});

exports.getShop = catchAsync(async (req, res) => {
    const { products, total } = await productService.getAllProducts(req.query);
    const categories = await Category.find();
    res.render('shop', {
        title: 'Shop',
        products,
        categories,
        currentState: req.query,
        total // Pass total if view needs pagination
    });
});

exports.getProductDetail = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
        return res.status(404).render('error', { title: 'Product Not Found', message: 'The product does not exist' });
    }
    // Ensure images array exists for view
    if (!product.images) {
        product.images = product.image ? [product.image] : [];
    }

    // Fetch related products (same category, excluding current)
    let relatedQuery = { limit: 4 };
    if (product.category && product.category._id) {
        relatedQuery.category = product.category._id;
    }
    // We can't easily exclude ID in getAllProducts without updating repository to handle 'ne' (not equal)
    // or we fetch 5 and filter in JS. Let's try fetching 5.
    relatedQuery.limit = 5;

    const relatedResult = await productService.getAllProducts(relatedQuery);
    const relatedProducts = relatedResult.products
        .filter(p => p._id.toString() !== product._id.toString())
        .slice(0, 4);

    res.render('product-detail', {
        title: product.name,
        product,
        relatedProducts: relatedProducts
    });
});

exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
};

exports.getSignup = (req, res) => {
    res.render('signup', { title: 'Sign Up' });
};

exports.getCheckout = catchAsync(async (req, res) => {
    let cart;
    if (req.user) {
        cart = await require('../models/Cart').findOne({ user: req.user.id }).populate('items.product');
    } else if (req.session && req.session.cart) {
        // Hydrate session cart if needed, or redirect to login? 
        // Spec says "User model... roles". Usually Authentication is required for checkout.
        // My route protection middleware handles this.
        // So req.user is guaranteed.
    }

    // Safety check if cart empty
    if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
    }

    // Calculate totals again for view
    const totalPrice = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    cart.totalPrice = totalPrice;

    res.render('checkout', {
        title: 'Checkout',
        cart
    });
});

exports.getOrderSuccess = (req, res) => {
    res.render('success', { title: 'Order Successful' });
};

exports.getWishlist = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.render('wishlist', {
        title: 'Yêu Thích',
        wishlist: user.wishlist || []
    });
});

// Admin Views
exports.getAdminDashboard = catchAsync(async (req, res) => {
    const { total: productCount } = await productService.getAllProducts({}); // Lazy count
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();

    // Find recent orders
    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user');

    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats: {
            products: productCount,
            orders: orderCount,
            users: userCount
        },
        recentOrders
    });
});

exports.getAdminProducts = catchAsync(async (req, res) => {
    const { products } = await productService.getAllProducts({});
    res.render('admin/products', {
        title: 'Manage Products',
        products
    });
});
