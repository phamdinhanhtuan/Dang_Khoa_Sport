const productService = require('../services/productService');

exports.ask = async (req, res, next) => {
    try {
        const { message } = req.body;
        const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

        const lowerMsg = message.toLowerCase();
        const unaccentedMsg = removeAccents(lowerMsg);

        let response = "";

        // 1. Identify Intent (Improved)

        // SHIPPING TIME & LOCATION
        // Check for provinces strings manual list or flexible keyworks
        const shippingKeywords = ['bao lâu', 'khi nào', 'mấy ngày', 'thời gian', 'ngày nào', 'hôm nay', 'giao ngay', 'hỏa tốc', 'nhanh'];
        const locationKeywords = ['tỉnh', 'thành phố', 'hcm', 'hà nội', 'đà nẵng', 'đắk lắk', 'daklak', 'bình dương', 'đồng nai', 'cần thơ'];

        // Helper to check both
        const matches = (keywords) => keywords.some(k => lowerMsg.includes(k) || unaccentedMsg.includes(removeAccents(k)));

        if (matches(shippingKeywords) || matches(locationKeywords) || lowerMsg.includes('shipping') || lowerMsg.includes('giao hàng')) {
            if (lowerMsg.includes('hỏa tốc') || lowerMsg.includes('ngay') || unaccentedMsg.includes('hoa toc')) {
                response = "Chúng tôi có hỗ trợ giao hỏa tốc 2h trong nội thành TP.HCM (Grab/Ahamove). Các tỉnh khác giao thường 2-5 ngày.";
            } else if (lowerMsg.includes('đắk lắk') || unaccentedMsg.includes('dak lak') || unaccentedMsg.includes('daklak') || lowerMsg.includes('tỉnh')) {
                response = "Giao hàng về Đắk Lắk và các tỉnh Tây Nguyên thường mất khoảng 3-4 ngày làm việc. Nếu bạn cần gấp, vui lòng liên hệ hotline để được hỗ trợ gửi nhà xe.";
            } else if (lowerMsg.includes('hà nội') || unaccentedMsg.includes('ha noi') || lowerMsg.includes('miền bắc')) {
                response = "Giao hàng ra Hà Nội và miền Bắc mất khoảng 3-5 ngày làm việc.";
            } else {
                response = "Thời gian giao hàng tiêu chuẩn:<br> - TP.HCM: 1-2 ngày (Hỏa tốc được hỗ trợ).<br> - Các tỉnh miền Nam: 2-3 ngày.<br> - Miền Trung/Tây Nguyên: 3-4 ngày.<br> - Miền Bắc: 3-5 ngày.";
            }
        }
        // POLICY
        else if (matches(['đổi trả', 'bảo hành', 'hoàn tiền', 'hu hỏng', 'lỗi'])) {
            response = "Chính sách: Đổi trả 1-1 trong 30 ngày nếu lỗi NSX. Bảo hành 12 tháng tại hãng hoặc cửa hàng.";
        }
        else if (matches(['vận chuyển', 'ship', 'giao hàng', 'phí ship'])) {
            response = "Miễn phí vận chuyển cho đơn hàng trên 1.200.000đ. Đơn dưới mức này phí ship khoảng 30k-50k tùy khu vực.";
        }
        else if (matches(['kích cỡ', 'size', 'chật', 'rộng', 'đo chân'])) {
            response = "Mỗi sản phẩm đều có bảng Size Guide chi tiết. Bạn có thể mang thử tại cửa hàng hoặc báo số đo để shop tư vấn size chuẩn nhất.";
        }
        else if (matches(['địa chỉ', 'cửa hàng', 'shop ở sđâu', 'đến mua'])) {
            response = "Mời bạn ghé Showroom: 123 Đường Thể Thao, Q.1, TP.HCM &bull; Hotline: 1900-1234. Giờ mở cửa: 8h-22h.";
        }
        // PRODUCT SEARCH (Explicit or Implicit)
        else {
            // Logic: If query seems to be about product (contains common product words OR is short enough to be a query)
            // Remove common stop words
            let searchInternal = lowerMsg;
            const stopWords = ['giá', 'bao nhiêu', 'tìm', 'cho tôi', 'xem', 'có', 'không', 'mua', 'bán', 'shop', 'ơi', 'à', 'nhé', 'với'];
            stopWords.forEach(w => searchInternal = searchInternal.replace(new RegExp(w, 'gi'), ''));
            const cleanMsg = searchInternal.trim();

            let isProductIntent = lowerMsg.includes('giá') || lowerMsg.includes('mua') || lowerMsg.includes('tìm') || lowerMsg.includes('có') || (cleanMsg.length > 3 && cleanMsg.length < 50);

            if (lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                const hour = new Date().getHours();
                const timeGreeting = hour < 12 ? "Chào buổi sáng" : (hour < 18 ? "Chào buổi chiều" : "Chào buổi tối");
                response = `${timeGreeting}! Tôi là trợ lý ảo Đăng Khoa Sport. Tôi có thể giúp tìm sản phẩm, tra cứu đơn hàng hoặc tư vấn size.`;
                isProductIntent = false;
            }

            if (isProductIntent && cleanMsg.length > 2) {
                // Search
                const searchResult = await productService.getAllProducts({ search: cleanMsg, limit: 3 });
                const products = searchResult.products;

                if (products && products.length > 0) {
                    response = `Tôi tìm thấy ${products.length} sản phẩm liên quan đến "${cleanMsg}":<br>`;
                    response += products.map(p => {
                        const stockStatus = p.stock > 0 ? `<span class="text-success small">Sẵn hàng</span>` : `<span class="text-danger small">Hết hàng</span>`;
                        return `<div class="mb-2 border-bottom pb-1">
                                    <a href="/product/${p._id}" class="fw-bold text-dark text-decoration-none">${p.name}</a><br>
                                    <span class="text-danger fw-bold">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</span> &bull; ${stockStatus}
                                 </div>`;
                    }).join('');
                    response += `<a href="/shop?search=${encodeURIComponent(cleanMsg)}" class="btn btn-sm btn-dark mt-2">Xem tất cả kết quả</a>`;
                } else {
                    // Fallback if search explicit but no result
                    if (lowerMsg.includes('giá') || lowerMsg.includes('mua')) {
                        response = `Hiện tại tôi chưa tìm thấy sản phẩm "${cleanMsg}". Bạn có thể thử từ khóa chung hơn (ví dụ: "vợt", "giày") hoặc liên hệ Hotline 1900-1234 để nhân viên kiểm tra kho kỹ hơn ạ.`;
                    } else {
                        // Likely just chatting unknown topic
                        response = "Xin lỗi, tôi chưa hiểu rõ ý bạn. Bạn cần hỗ trợ về sản phẩm hay đơn hàng? <br>Hotline hỗ trợ: <a href='tel:19001234'>1900-1234</a>";
                    }
                }
            } else if (!response) {
                response = "Xin lỗi, tôi chưa hiểu rõ ý bạn. Bạn cần hỗ trợ về sản phẩm hay đơn hàng? <br>Hotline hỗ trợ: <a href='tel:19001234'>1900-1234</a>";
            }
        }

        res.status(200).json({ status: 'success', message: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: "Xin lỗi, hệ thống đang bận." });
    }
};
