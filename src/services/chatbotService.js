const productService = require('./productService');
const orderRepository = require('../repositories/orderRepository');

class ChatbotService {
    constructor() {
        this.intents = {
            GREETING: ['chào', 'hello', 'hi', 'xin chào'],
            SHIPPING: ['bao lâu', 'khi nào', 'mấy ngày', 'thời gian', 'giao hàng', 'vận chuyển', 'ship'],
            LOCATION: ['tỉnh', 'thành phố', 'hcm', 'hà nội', 'đà nẵng', 'địa chỉ', 'khi nào tới'],
            POLICY: ['đổi trả', 'bảo hành', 'hoàn tiền', 'lỗi', 'hư hỏng'],
            ORDER_TRACKING: ['theo dõi', 'tra cứu', 'kiểm tra đơn', 'đơn hàng', 'status', 'tình trạng đơn'],
            PRODUCT: ['giá', 'mua', 'tìm', 'có không', 'bán']
        };
    }

    // Helper: Remove accents for flexible matching
    removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
    }

    checkIntent(message, keys) {
        const lowerMsg = message.toLowerCase();
        const unaccentedMsg = this.removeAccents(lowerMsg);
        return keys.some(k => lowerMsg.includes(k) || unaccentedMsg.includes(this.removeAccents(k)));
    }

    async extractPhoneNumber(message) {
        const phoneRegex = /(0[3|5|7|8|9]+[0-9]{8})\b/g;
        const match = message.match(phoneRegex);
        return match ? match[0] : null;
    }

    async processMessage(message, user) {
        const lowerMsg = message.toLowerCase();

        // 1. GREETING
        if (this.checkIntent(message, this.intents.GREETING)) {
            const hour = new Date().getHours();
            const timeGreeting = hour < 12 ? "Chào buổi sáng" : (hour < 18 ? "Chào buổi chiều" : "Chào buổi tối");
            return `${timeGreeting}! Tôi là trợ lý ảo Đăng Khoa Sport. Tôi có thể giúp tìm sản phẩm, tra cứu đơn hàng hoặc tư vấn chính sách.`;
        }

        // 2. ORDER TRACKING (Priority High)
        // Detect if user wants to track order OR provides a phone number contextually
        const isTracking = this.checkIntent(message, this.intents.ORDER_TRACKING);
        const phoneNumber = await this.extractPhoneNumber(message);

        if (isTracking || phoneNumber) {
            // Case A: User Logged In checks "Tra cứu đơn hàng"
            if (user && isTracking) {
                const orders = await orderRepository.findByUser(user._id);
                if (orders.length > 0) {
                    const latest = orders[0];
                    return `📦 **Đơn hàng mới nhất của bạn:**\n- Mã: #${latest._id.toString().slice(-6).toUpperCase()}\n- Ngày đặt: ${new Date(latest.createdAt).toLocaleDateString('vi-VN')}\n- Trạng thái: **${latest.status.toUpperCase()}**\n- Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(latest.totalAmount)}đ\n\nBạn có thể xem chi tiết trong mục 'Lịch sử mua hàng'.`;
                } else {
                    return "Bạn chưa có đơn hàng nào tại Đăng Khoa Sport.";
                }
            }

            // Case B: User NOT Logged In but provides Phone Number
            if (phoneNumber) {
                const orders = await orderRepository.findByPhone(phoneNumber);
                if (orders.length > 0) {
                    const latest = orders[0];
                    return `🔍 **Kết quả tra cứu cho SĐT ${phoneNumber}:**\n- Mã đơn: #${latest._id.toString().slice(-6).toUpperCase()}\n- Trạng thái: **${latest.status.toUpperCase()}**\n- Tổng: ${new Intl.NumberFormat('vi-VN').format(latest.totalAmount)}đ\n- Ngày: ${new Date(latest.createdAt).toLocaleDateString('vi-VN')}`;
                } else {
                    return `Không tìm thấy đơn hàng nào với số điện thoại ${phoneNumber}. Vui lòng kiểm tra lại.`;
                }
            }

            // Case C: Asking for tracking but no info
            if (isTracking) {
                if (user) return "Bạn chưa có đơn hàng nào.";
                return "Để tra cứu đơn hàng, vui lòng **nhập số điện thoại** bạn đã dùng để đặt hàng.";
            }
        }

        // 3. POLICIES
        if (this.checkIntent(message, this.intents.POLICY)) {
            return "🛡 **Chính sách Đổi Trả & Bảo Hành:**\n- Đổi trả 1-1 trong 30 ngày nếu lỗi NSX.\n- Bảo hành chính hãng 12 tháng.\n- Hoàn tiền 200% nếu phát hiện hàng giả.";
        }

        // 4. SHIPPING
        if (this.checkIntent(message, this.intents.SHIPPING)) {
            if (lowerMsg.includes('hỏa tốc') || lowerMsg.includes('ngay')) {
                return "🚀 **Giao Hỏa Tốc:** Hỗ trợ giao 2h nội thành TP.HCM (Grab/Ahamove).";
            }
            return "🚚 **Thời gian giao hàng:**\n- TP.HCM: 1-2 ngày.\n- Miền Nam: 2-3 ngày.\n- Miền Trung/Bắc: 3-5 ngày.\nMiễn phí ship cho đơn trên 1.200.000đ.";
        }

        // 5. PRODUCT SEARCH (Default Fallback Intent)
        // Clean common words
        let searchQuery = lowerMsg;
        ['giá', 'tìm', 'mua', 'cho tôi', 'xem'].forEach(w => searchQuery = searchQuery.replace(w, ''));
        searchQuery = searchQuery.trim();

        if (searchQuery.length > 2) {
            // Updated to use filterProducts instead of getAllProducts
            const { products } = await productService.filterProducts({ q: searchQuery });

            if (products && products.length > 0) {
                // Limit to 3 in display logic
                const displayProducts = products.slice(0, 3);
                let response = `🔎 Tìm thấy ${products.length} sản phẩm cho "${searchQuery}":<br>`;
                response += displayProducts.map(p => {
                    const stock = p.stock > 0 ? '<span class="text-success">Còn hàng</span>' : '<span class="text-danger">Hết hàng</span>';
                    return `<div class="mt-2 border-bottom pb-2">
                        <a href="/products/${p._id}" class="fw-bold text-dark">${p.name}</a><br>
                        <span class="text-danger fw-bold">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</span> • ${stock}
                    </div>`;
                }).join('');
                response += `<a href="/products?q=${encodeURIComponent(searchQuery)}" class="btn btn-sm btn-dark mt-2 w-100">Xem tất cả</a>`;
                return response;
            }
        }

        // Fallback
        return "Xin lỗi, tôi chưa hiểu rõ ý bạn. Bạn cần hỗ trợ về **Sản phẩm**, **Tra cứu đơn hàng** (nhập SĐT), hay **Chính sách**?";
    }
}

module.exports = new ChatbotService();
