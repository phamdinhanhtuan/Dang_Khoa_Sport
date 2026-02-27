const Product = require('../models/Product');

class AICustomerService {
    // 1. Smart Recommendation
    async getRecommendations(user, currentProduct = null) {
        // Mock Logic:
        // - If user has history, use it (omitted for now)
        // - If viewing a product, find same category
        // - Else, return "Popular" (high ratings)

        let query = {};

        if (currentProduct) {
            query = {
                category: currentProduct.category,
                _id: { $ne: currentProduct._id }
            };
        } else {
            query = { ratingsAverage: { $gte: 4.5 } };
        }

        return await Product.find(query).limit(4);
    }

    // 2. Smart Search Normalization
    normalizeSearchTerm(term) {
        if (!term) return "";

        // Remove tones
        const removeTones = (str) => {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            return str;
        };

        // 1. Lowercase & Trim
        let cleanTerm = term.toLowerCase().trim();

        // 2. Remove tones for broad matching (this is a simple strategy)
        // Note: Ideally we should search BOTH original and no-tone, but for MVP we return cleanTerm directly
        // or return a regex compatible string. For now, let's keep accents but handle common spaces.
        cleanTerm = cleanTerm.replace(/\s+/g, ' ');

        return cleanTerm;
    }

    // 3. Buying Assistant (Rule-based)
    getBuyingAdvice(product) {
        if (!product) return null;

        const advice = {
            tips: [],
            promotions: []
        };

        // Logic based on keywords or category
        if (product.name.toLowerCase().includes('giày')) {
            advice.tips.push("Nên chọn lớn hơn 0.5 size nếu chân bè.");
            advice.tips.push("Phù hợp sân cỏ nhân tạo (TF).");
        }

        if (product.price > 500000) {
            advice.promotions.push("Freeship cho đơn hàng này!");
        }

        return advice;
    }
}

module.exports = new AICustomerService();
