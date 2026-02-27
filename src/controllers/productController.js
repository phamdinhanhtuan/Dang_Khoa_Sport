const productService = require('../services/productService');
const aiService = require('../services/aiAppService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getHomePage = catchAsync(async (req, res, next) => {
    // 1. Fetch Data from Service
    const homeData = await productService.getHomePageData();

    // 2. AI Recommendations (User specific)
    const recommendations = await aiService.getRecommendations(req.user);

    res.render('shop/index', {
        pageTitle: 'Trang chủ',
        products: homeData.newArrivals, // Backward compatibility
        newArrivals: homeData.newArrivals,
        ...homeData, // spreads pickleballProducts, etc.
        recommendations
    });
});

exports.getProducts = catchAsync(async (req, res, next) => {
    // 1. Fetch Filtered Data from Service
    const result = await productService.filterProducts(req.query);

    res.render('shop/product-list', {
        pageTitle: 'Sản phẩm',
        products: result.products,
        categories: result.allCategories,
        searchQuery: result.searchQuery,
        currentCat: result.currentCategory ? result.currentCategory.slug : '', // Pass slug or ID as needed by view
        currentGender: result.currentGender,
        currentSort: result.currentSort,
        currentCategory: result.currentCategory // Pass object if view needs details
    });
});

exports.getProductDetail = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // 1. Fetch Product
    const product = await productService.getProductById(id);
    if (!product) {
        return next(new AppError('Sản phẩm không tồn tại', 404));
    }

    // 2. Handle Recently Viewed (Cookie Logic remains in Controller as it's HTTP-specific)
    let viewedIds = [];
    if (req.cookies.recentlyViewed) {
        try { viewedIds = JSON.parse(req.cookies.recentlyViewed); } catch (e) { viewedIds = []; }
    }

    // Update List
    const currentId = product._id.toString();
    viewedIds = viewedIds.filter(pid => pid !== currentId);
    viewedIds.unshift(currentId);
    if (viewedIds.length > 6) viewedIds = viewedIds.slice(0, 6);

    res.cookie('recentlyViewed', JSON.stringify(viewedIds), { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

    // 3. Fetch Recently Viewed Products Data
    // Exclude current one for display
    const recentViewedIds = viewedIds.filter(pid => pid !== currentId);
    const recentlyViewedProducts = await productService.getProductsByIds(recentViewedIds);

    // 4. AI Features
    const relatedProducts = await aiService.getRecommendations(req.user, product);
    const buyingAdvice = aiService.getBuyingAdvice(product);

    res.render('shop/product-detail', {
        pageTitle: product.name,
        product,
        relatedProducts,
        recentlyViewedProducts,
        buyingAdvice,
        user: req.user
    });
});

