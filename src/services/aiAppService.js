const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const userRepository = require('../repositories/userRepository');

/**
 * AI & Analytics Service for Đăng Khoa Sport
 */
class AIAppService {
    // --- CUSTOMER AI ---

    async getRecommendations(user, currentProduct = null) {
        if (currentProduct) {
            return await productRepository.findSimilar(currentProduct);
        }
        // Fallback: recommend top selling products
        return await productRepository.findTopSelling();
    }

    getBuyingAdvice(product) {
        const tips = [
            "Sản phẩm này đang bán chạy, kho còn ít!",
            "Chất liệu thoáng mát, phù hợp chơi thể thao mùa hè.",
            "Thiết kế mới nhất năm 2024.",
            "Nên mua kèm tất/vớ để được freeship."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    normalizeSearchTerm(term) {
        return term ? term.trim().toLowerCase() : '';
    }

    async getCartRecommendations(cartItems) {
        if (!cartItems || cartItems.length === 0) return [];
        const productIdsInCart = cartItems.map(item => item.product._id || item.product);

        return await productRepository.find({
            _id: { $nin: productIdsInCart }
        }, '-soldCount', 4);
    }

    // --- ADMIN AI & ANALYTICS ---

    async getSalesAnalytics(days = 7) {
        // Business Logic: Typically this would query order aggregations by date
        // Maintaining mocked structure as per current business logic
        const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const revenue = [1500000, 2300000, 1800000, 3200000, 2100000, 4500000, 3800000];
        const orders = [5, 8, 6, 12, 7, 15, 13];

        return { labels, revenue, orders };
    }

    async getInventoryInsights() {
        const lowStock = await productRepository.findLowStock(5);
        const overStock = await productRepository.findOverStock(100);

        return {
            lowStockCount: lowStock.length,
            itemsToRestock: lowStock.map(p => p.name),
            overStockCount: overStock.length
        };
    }

    async getDashboardSummary() {
        const [productCount, orderCount, userCount, totalRevenue] = await Promise.all([
            productRepository.count(),
            orderRepository.count(),
            userRepository.count(),
            orderRepository.aggregateRevenue()
        ]);

        return {
            productCount,
            orderCount,
            totalRevenue,
            userCount
        };
    }
}

module.exports = new AIAppService();
