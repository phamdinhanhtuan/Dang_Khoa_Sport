const productService = require('../services/productService');
const categoryService = require('../services/categoryService');
const cartService = require('../services/cartService');
const orderService = require('../services/orderService');
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

exports.getHome = catchAsync(async (req, res) => {
    // Get top 4 latest products
    const { products } = await productService.getAllProducts({ limit: 4 });

    // AI Recommendations (Mocked if not logged in)
    const recommendations = await require('../services/aiCustomerService').getRecommendations(req.user);

    res.render('shop/index', {
        title: 'Đăng Khoa Sport - Trang Chủ',
        products,
        recommendations
    });
});

exports.getShop = catchAsync(async (req, res) => {
    const { products } = await productService.getAllProducts(req.query);
    const categories = await categoryService.getAllCategories();

    res.render('shop/index', {
        title: 'Cửa Hàng',
        products,
        categories,
        recommendations: [],
        currentState: req.query
    });
});

exports.getProductDetail = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
        return res.status(404).render('404', { pageTitle: 'Không tìm thấy', message: 'Sản phẩm không tồn tại' });
    }
    // Ensure images array exists for view
    if (!product.images) {
        product.images = product.image ? [product.image] : [];
    }

    // Fetch related products
    let relatedQuery = { limit: 5 };
    if (product.category && product.category._id) {
        relatedQuery.category = product.category._id;
    }
    const relatedResult = await productService.getAllProducts(relatedQuery);
    const relatedProducts = relatedResult.products
        .filter(p => p._id.toString() !== product._id.toString())
        .slice(0, 4);

    // AI Advice
    const buyingAdvice = require('../services/aiCustomerService').getBuyingAdvice(product);

    res.render('shop/product-detail', {
        title: product.name,
        product,
        relatedProducts,
        buyingAdvice
    });
});

exports.getLogin = (req, res) => {
    res.render('shop/login', { title: 'Đăng Nhập' });
};

exports.getSignup = (req, res) => {
    res.render('shop/signup', { title: 'Đăng Ký' });
};

exports.getCheckout = catchAsync(async (req, res) => {
    let cart;
    if (req.user) {
        cart = await cartService.getCart(req.user.id);
    }
    // Session cart handling for checkout is limited. 
    // Ideally authentication is required. 
    // Assuming auth middleware protects this route or user is redirected.

    // Safety check if cart empty
    if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
    }

    // Calculate totals again for view (cartService handling mostly done)
    // cartService.getCart returns populated items and totalCost (handled inside service logic)
    // However, original code re-calculated. We should trust the Service.
    // The service returns "totalCost" which includes discounts.
    // The view might expect 'totalPrice'. Let's alias it if needed or rely on 'totalCost' from service.

    // Legacy support: ensure view uses valid properties.
    if (!cart.totalPrice) cart.totalPrice = cart.totalCost;

    res.render('shop/checkout', {
        title: 'Thanh Toán',
        cart
    });
});

exports.getOrderSuccess = (req, res) => {
    res.redirect('/?order=success');
};

exports.getWishlist = catchAsync(async (req, res) => {
    // Mock wishlist or empty
    res.render('shop/index', {
        title: 'Yêu Thích',
        products: [],
        recommendations: []
    });
});

// Admin Views
exports.getAdminDashboard = catchAsync(async (req, res) => {
    const { total: productCount } = await productService.getAllProducts({});
    const orderCount = await orderService.countOrders();
    const userCount = await userService.countUsers();

    // Find recent orders
    const recentOrders = await orderService.getRecentOrders(5);

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
