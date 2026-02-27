const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/aiAppService');

/**
 * Controller for General Admin Actions
 */

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.getDashboard = catchAsync(async (req, res, next) => {
    // Parallelize data fetching for performance
    const [summary, salesData, inventory] = await Promise.all([
        aiService.getDashboardSummary(),
        aiService.getSalesAnalytics(),
        aiService.getInventoryInsights()
    ]);

    res.render('dashboard', {
        title: 'Admin Dashboard',
        userCount: summary.userCount,
        productCount: summary.productCount,
        orderCount: summary.orderCount,
        totalRevenue: summary.totalRevenue,
        salesData,
        inventory,
        path: '/admin'
    });
});
