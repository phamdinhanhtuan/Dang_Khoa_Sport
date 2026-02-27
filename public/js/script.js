// Custom Scripts
document.addEventListener('DOMContentLoaded', function () {
    // Chatbot Logic
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('d-none');
        });
        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.add('d-none');
        });

        // Helper to add message
        const addMessage = (text, isUser = false) => {
            const div = document.createElement('div');
            div.className = `d-flex mb-3 ${isUser ? 'justify-content-end' : ''}`;
            const bubble = document.createElement('div');
            bubble.className = `${isUser ? 'bg-dark text-white' : 'bg-white'} p-2 rounded shadow-sm`;
            bubble.style.maxWidth = '80%';
            // Use innerHTML for Bot to support links, innerText for User for security
            if (isUser) bubble.innerText = text;
            else bubble.innerHTML = text;

            div.appendChild(bubble);
            chatbotMessages.appendChild(div);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };

        // Async Bot Response
        const handleBotResponse = async (userMsg) => {
            try {
                // Show typing indicator or just wait
                const res = await fetch('/api/chatbot/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMsg })
                });
                const data = await res.json();

                if (data.status === 'success') {
                    addMessage(data.message, false);
                } else {
                    addMessage('Hệ thống đang bận, vui lòng thử lại sau.', false);
                }
            } catch (err) {
                console.error(err);
                addMessage('Lỗi kết nối.', false);
            }
        };

        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = chatbotForm.querySelector('input');
            const userMsg = input.value;
            if (!userMsg) return;

            addMessage(userMsg, true);
            input.value = '';

            handleBotResponse(userMsg);
        });

        document.querySelectorAll('.chatbot-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const msg = chip.innerText;
                addMessage(msg, true);
                handleBotResponse(msg);
            });
        });
    }
    // Review Form Submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Đang gửi...';
            btn.disabled = true;

            const formData = new FormData(this);
            const data = {
                product: formData.get('product'),
                rating: formData.get('rating'),
                review: formData.get('review')
            };

            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.status === 'success') {
                    showToast('Cảm ơn bạn đã đánh giá!', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(result.message || 'Lỗi khi gửi đánh giá', 'danger');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi kết nối', 'danger');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
    // Fade in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Initialize Tooltips/Popovers
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // URL Param Helper
    window.updateQueryParam = function (key, value) {
        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
        window.location.href = url.toString();
    };

    // Global Delete Cart Item (Inline Fallback)
    window.deleteCartItem = async function (btn) {
        if (!confirm('Are you sure you want to remove this item?')) return;
        const id = btn.dataset.id;
        try {
            const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                // If showToast is available, use it, otherwise alert
                if (typeof showToast === 'function') {
                    showToast('Item removed from cart', 'success');
                } else {
                    console.log('Item removed from cart');
                }
                setTimeout(() => window.location.reload(), 500);
            } else {
                alert(data.message || 'Failed to remove');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
    };

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;

            try {
                const res = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred');
            }
        });
    }

    // Toast Helper
    // Toast Helper (using Toastify)
    window.showToast = function (message, type = 'success') {
        if (typeof Toastify === 'function') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: type === 'success' ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
                stopOnFocus: true,
                className: "fw-bold",
            }).showToast();
        } else {
            // Fallback: Create a simple bootstrap alert if Toastify missing
            console.warn('Toastify not loaded, falling back to simple alert');
            // Check if we can inject a bootstrap toast
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer) {
                // Implementation for bootstrap toast if structure exists
            } else {
                // Simple console or alert for now to not block UI
                console.log(message);
            }
        }
    }

    // Product Detail Add to Cart Form
    const addToCartForm = document.getElementById('addToCartForm');
    if (addToCartForm) {
        addToCartForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const productId = this.querySelector('input[name="productId"]').value;
            const quantity = this.querySelector('[name="quantity"]').value;
            const color = this.querySelector('input[name="color"]').value;
            const size = this.querySelector('input[name="size"]').value;

            // Validate Size
            if (!size) {
                showToast('Vui lòng chọn kích cỡ!', 'danger');
                // Shake the size options to draw attention
                const sizeOptions = document.getElementById('sizeOptions');
                if (sizeOptions) {
                    sizeOptions.classList.add('shake-animation'); // Ensure you have css for this or just simple highlight
                    sizeOptions.style.border = '1px solid red';
                    setTimeout(() => {
                        sizeOptions.style.border = 'none';
                    }, 2000);
                }
                return;
            }

            try {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity, color, size })
                });

                const data = await res.json();

                if (res.ok) {
                    showToast('Đã thêm vào giỏ hàng!', 'success');

                    // Show success modal if exists (from footer)
                    const modalEl = document.getElementById('addToCartModal');
                    if (modalEl) {
                        // We might need to fetch product info or just rely on static info from page
                        // For now, reload so header cart count updates or use toast
                        const productImg = document.querySelector('.card-img-top') ? document.querySelector('.card-img-top').src : '';
                        const productName = document.querySelector('h2.display-6') ? document.querySelector('h2.display-6').innerText : 'Sản phẩm';

                        document.getElementById('modalProductImage').src = productImg;
                        document.getElementById('modalProductName').innerText = productName;

                        const modal = new bootstrap.Modal(modalEl);
                        modal.show();
                    } else {
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } else {
                    showToast(data.message || 'Có lỗi xảy ra', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi kết nối', 'danger');
            }
        });
    }

    // Cart Interactions (Table)
    // Cart Interactions (New List Layout)
    // 1. Delete Trigger (Open Modal)
    document.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.btn-delete-trigger');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const name = deleteBtn.dataset.name;

            // Update Modal Content
            const modalNameEl = document.getElementById('deleteModalProductName');
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            const modalEl = document.getElementById('deleteModal');

            if (modalNameEl) modalNameEl.innerText = `${name} sẽ bị xóa.`;
            if (confirmBtn) confirmBtn.dataset.id = id;

            // Show Modal
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        }
    });

    // 2. Confirm Delete Action
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function () {
            const id = this.dataset.id;
            const originalText = this.innerText;
            this.innerText = 'Đang xóa...';
            this.disabled = true;

            try {
                const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    window.location.reload();
                } else {
                    const data = await res.json();
                    alert(data.message || 'Không thể xóa sản phẩm');
                    this.innerText = originalText;
                    this.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối');
                this.innerText = originalText;
                this.disabled = false;
            }
        });
    }

    // 3. Quantity Change
    document.addEventListener('change', async function (e) {
        if (e.target.classList.contains('qty-select')) {
            const id = e.target.dataset.id;
            const newQty = e.target.value;

            // Visual Feedback (optional, maybe disable select)
            e.target.disabled = true;

            try {
                const res = await fetch(`/api/cart/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQty })
                });

                if (res.ok) {
                    window.location.reload();
                } else {
                    alert('Không thể cập nhật số lượng');
                    e.target.disabled = false;
                }
            } catch (err) {
                console.error(err);
                e.target.disabled = false;
            }
        }
    });

    // Quick Add to Cart (Listings)
    document.addEventListener('click', async function (e) {
        const btn = e.target.closest('.btn-add-cart');
        if (btn) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Stop Card Navigation

            const productId = btn.dataset.id;
            // Get product info from card for Modal
            const card = btn.closest('.product-card');
            const productName = card ? card.querySelector('.product-name').innerText : 'Product';
            const productImg = card ? card.querySelector('img').src : '';

            const originalText = btn.innerText;
            btn.innerText = 'Run...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity: 1 })
                });

                const data = await res.json();

                if (res.ok) {
                    btn.innerText = 'Added!';
                    btn.classList.add('btn-success');

                    // Show Modal
                    const modalEl = document.getElementById('addToCartModal');
                    if (modalEl) {
                        document.getElementById('modalProductName').innerText = productName;
                        document.getElementById('modalProductImage').src = productImg;
                        const modal = new bootstrap.Modal(modalEl);
                        modal.show();
                    }

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.classList.remove('btn-success');
                        btn.disabled = false;
                    }, 2000);
                } else {
                    alert(data.message || 'Error');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('Network Error: Check console');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    });

    // Card Navigation
    document.addEventListener('click', function (e) {
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('.btn-add-cart') && !e.target.closest('a')) {
            const url = card.dataset.url;
            if (url) window.location.href = url;
        }
    });

    // Cart Interaction: Edit Button (Pen Icon)
    document.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit-cart');
        if (editBtn) {
            const itemId = editBtn.dataset.itemId;
            const productId = editBtn.dataset.productId;
            const name = editBtn.dataset.name;
            const price = editBtn.dataset.price;
            const img = editBtn.dataset.img;
            const color = editBtn.dataset.color || 'Mặc định';
            const size = editBtn.dataset.size || 'Tiêu chuẩn';
            const qty = editBtn.dataset.qty;
            const isShoe = editBtn.dataset.isShoe === 'true';

            // Populate Modal
            document.getElementById('editModalName').innerText = name;
            document.getElementById('editModalPrice').innerText = price;
            document.getElementById('editModalImg').src = img;
            document.getElementById('editModalProductId').value = productId;
            document.getElementById('editModalItemId').value = itemId;
            document.getElementById('editModalQty').value = qty;

            // Dynamic Size Options
            const sizeSelect = document.getElementById('editModalSize');
            sizeSelect.innerHTML = '';

            const shoeSizes = ['EUR 39', 'EUR 40', 'EUR 40.5', 'EUR 41', 'EUR 42', 'EUR 43', 'EUR 44.5', 'EUR 46'];
            const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            const sizesToUse = isShoe ? shoeSizes : clothingSizes;

            sizesToUse.forEach(s => {
                const opt = document.createElement('option');
                // Normalize value to remove 'EUR ' for comparison if needed, but data-size usually has 'EUR '
                opt.value = s;
                opt.text = s;
                sizeSelect.add(opt);
            });

            // Set selected value
            // Try exact match first
            sizeSelect.value = size;
            // If not found, try adding/removing EUR prefix just in case
            if (sizeSelect.selectedIndex === -1) {
                if (isShoe && !size.includes('EUR')) sizeSelect.value = `EUR ${size}`;
                else if (isShoe && size.includes('EUR')) sizeSelect.value = size;
            }


            // Update View Full Details Link
            const viewDetailsBtn = document.getElementById('btnViewFullDetails');
            if (viewDetailsBtn) viewDetailsBtn.href = `/product/${productId}`;

            // Show Modal
            const modalEl = document.getElementById('editCartModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        }
    });

    // Cart Interaction: Update Cart Item Button
    const btnUpdateCartItem = document.getElementById('btnUpdateCartItem');
    if (btnUpdateCartItem) {
        btnUpdateCartItem.addEventListener('click', async function () {
            const productId = document.getElementById('editModalProductId').value;
            const itemId = document.getElementById('editModalItemId').value;
            const qty = document.getElementById('editModalQty').value;
            const size = document.getElementById('editModalSize').value;
            // Color is usually fixed per SKU in basic implementations or selectable. We'll leave it simple.

            const originalText = this.innerText;
            this.innerText = 'Updating...';
            this.disabled = true;

            try {
                const res = await fetch(`/api/cart/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: qty, size: size, itemId: itemId })
                });

                if (res.ok) {
                    window.location.reload();
                } else {
                    const data = await res.json();
                    alert(data.message || 'Update failed');
                    this.innerText = originalText;
                    this.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('Network Error');
                this.innerText = originalText;
                this.disabled = false;
            }
        });
    }

    // Checkout Form - Address Handling
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const wardSelect = document.getElementById('wardSelect');

    if (provinceSelect) {
        const host = "https://provinces.open-api.vn/api/";

        // Hardcoded Provinces to ensure they LOAD immediately
        const provinces = [
            { code: 1, name: "Thành phố Hà Nội" },
            { code: 2, name: "Tỉnh Hà Giang" },
            { code: 4, name: "Tỉnh Cao Bằng" },
            { code: 6, name: "Tỉnh Bắc Kạn" },
            { code: 8, name: "Tỉnh Tuyên Quang" },
            { code: 10, name: "Tỉnh Lào Cai" },
            { code: 11, name: "Tỉnh Điện Biên" },
            { code: 12, name: "Tỉnh Lai Châu" },
            { code: 14, name: "Tỉnh Sơn La" },
            { code: 15, name: "Tỉnh Yên Bái" },
            { code: 17, name: "Tỉnh Hoà Bình" },
            { code: 19, name: "Tỉnh Thái Nguyên" },
            { code: 20, name: "Tỉnh Lạng Sơn" },
            { code: 22, name: "Tỉnh Quảng Ninh" },
            { code: 24, name: "Tỉnh Bắc Giang" },
            { code: 25, name: "Tỉnh Phú Thọ" },
            { code: 26, name: "Tỉnh Vĩnh Phúc" },
            { code: 27, name: "Tỉnh Bắc Ninh" },
            { code: 30, name: "Tỉnh Hải Dương" },
            { code: 31, name: "Thành phố Hải Phòng" },
            { code: 33, name: "Tỉnh Hưng Yên" },
            { code: 34, name: "Tỉnh Thái Bình" },
            { code: 35, name: "Tỉnh Hà Nam" },
            { code: 36, name: "Tỉnh Nam Định" },
            { code: 37, name: "Tỉnh Ninh Bình" },
            { code: 38, name: "Tỉnh Thanh Hóa" },
            { code: 40, name: "Tỉnh Nghệ An" },
            { code: 42, name: "Tỉnh Hà Tĩnh" },
            { code: 44, name: "Tỉnh Quảng Bình" },
            { code: 45, name: "Tỉnh Quảng Trị" },
            { code: 46, name: "Tỉnh Thừa Thiên Huế" },
            { code: 48, name: "Thành phố Đà Nẵng" },
            { code: 49, name: "Tỉnh Quảng Nam" },
            { code: 51, name: "Tỉnh Quảng Ngãi" },
            { code: 52, name: "Tỉnh Bình Định" },
            { code: 54, name: "Tỉnh Phú Yên" },
            { code: 56, name: "Tỉnh Khánh Hòa" },
            { code: 58, name: "Tỉnh Ninh Thuận" },
            { code: 60, name: "Tỉnh Bình Thuận" },
            { code: 62, name: "Tỉnh Kon Tum" },
            { code: 64, name: "Tỉnh Gia Lai" },
            { code: 66, name: "Tỉnh Đắk Lắk" },
            { code: 67, name: "Tỉnh Đắk Nông" },
            { code: 68, name: "Tỉnh Lâm Đồng" },
            { code: 70, name: "Tỉnh Bình Phước" },
            { code: 72, name: "Tỉnh Tây Ninh" },
            { code: 74, name: "Tỉnh Bình Dương" },
            { code: 75, name: "Tỉnh Đồng Nai" },
            { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu" },
            { code: 79, name: "Thành phố Hồ Chí Minh" },
            { code: 80, name: "Tỉnh Long An" },
            { code: 82, name: "Tỉnh Tiền Giang" },
            { code: 83, name: "Tỉnh Bến Tre" },
            { code: 84, name: "Tỉnh Trà Vinh" },
            { code: 86, name: "Tỉnh Vĩnh Long" },
            { code: 87, name: "Tỉnh Đồng Tháp" },
            { code: 89, name: "Tỉnh An Giang" },
            { code: 91, name: "Tỉnh Kiên Giang" },
            { code: 92, name: "Thành phố Cần Thơ" },
            { code: 93, name: "Tỉnh Hậu Giang" },
            { code: 94, name: "Tỉnh Sóc Trăng" },
            { code: 95, name: "Tỉnh Bạc Liêu" },
            { code: 96, name: "Tỉnh Cà Mau" }
        ];

        // Populate Provinces Immediately
        provinces.forEach(item => {
            let option = document.createElement("option");
            option.value = item.code;
            option.text = item.name;
            provinceSelect.add(option);
        });

        // Or fallback to fetch if needed, but embedded is safer for "fix" request
        /* fetch(host + "?depth=1") ... */

        // On Province Change
        provinceSelect.addEventListener('change', function () {
            const code = this.value;
            const name = this.options[this.selectedIndex].text;
            document.getElementById('provinceName').value = name;

            districtSelect.innerHTML = '<option value="">Chọn Quận / Huyện</option>';
            wardSelect.innerHTML = '<option value="">Chọn Phường / Xã</option>';
            districtSelect.disabled = true;
            wardSelect.disabled = true;

            if (code) {
                // Fetch Districts based on Code
                fetch(host + "p/" + code + "?depth=2")
                    .then(response => response.json())
                    .then(data => {
                        data.districts.forEach(item => {
                            let option = document.createElement("option");
                            option.value = item.code;
                            option.text = item.name;
                            districtSelect.add(option);
                        });
                        districtSelect.disabled = false;
                    })
                    .catch(err => {
                        console.error("Error fetching districts:", err);
                        alert("Không thể tải danh sách Quận/Huyện. Vui lòng thử lại.");
                    });
            }
        });

        // On District Change
        districtSelect.addEventListener('change', function () {
            const code = this.value;
            const name = this.options[this.selectedIndex].text;
            document.getElementById('districtName').value = name;

            wardSelect.innerHTML = '<option value="">Chọn Phường / Xã</option>';
            wardSelect.disabled = true;

            if (code) {
                fetch(host + "d/" + code + "?depth=2")
                    .then(response => response.json())
                    .then(data => {
                        data.wards.forEach(item => {
                            let option = document.createElement("option");
                            option.value = item.code;
                            option.text = item.name;
                            wardSelect.add(option);
                        });
                        wardSelect.disabled = false;
                    })
                    .catch(err => console.error("Error fetching wards:", err));
            }
        });

        // On Ward Change
        wardSelect.addEventListener('change', function () {
            const name = this.options[this.selectedIndex].text;
            document.getElementById('wardName').value = name;
        });
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);

            // Construct address string or object
            const fullName = formData.get('lastName') + ' ' + formData.get('firstName');
            const address = [
                formData.get('addressLine'),
                formData.get('ward'),
                formData.get('city'), // This is district name now
                formData.get('province')
            ].filter(Boolean).join(', ');

            const shippingAddress = {
                fullName: fullName,
                phone: formData.get('phone'),
                addressLine: address,
                city: formData.get('province'), // Mapping for schema
                province: formData.get('province'),
                postalCode: formData.get('postalCode') || '700000',
                country: formData.get('country') || 'Vietnam',
                note: ''
            };

            // Basic Validation
            // Basic Validation
            if (!shippingAddress.fullName || !shippingAddress.phone || !formData.get('addressLine') || !formData.get('province') || !formData.get('city') || !formData.get('ward')) {
                showToast('Vui lòng điền đầy đủ thông tin địa chỉ!', 'danger');
                return;
            }

            // Phone Validation (10-11 digits)
            const phoneDigits = shippingAddress.phone.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                showToast('Số điện thoại phải bao gồm 10 hoặc 11 chữ số!', 'danger');
                // Highlight the input
                const phoneInput = this.querySelector('input[name="phone"]');
                if (phoneInput) {
                    phoneInput.focus();
                    phoneInput.style.borderColor = 'red';
                    setTimeout(() => phoneInput.style.borderColor = '', 3000);
                }
                return;
            }

            try {
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerText;
                btn.innerText = 'Processing...';
                btn.disabled = true;

                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shippingAddress })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/orders/success';
                } else {
                    alert(data.message || 'Order failed');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('Network Error');
            }
        });
    }

    // 4. Quick View Event Listener
    document.addEventListener('click', function (e) {
        // Handle Quick View button click (and its children)
        const btn = e.target.closest('.btn-quick-view');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();

            const name = btn.dataset.name;
            const price = btn.dataset.price;
            const img = btn.dataset.image;
            const desc = btn.dataset.description;
            const id = btn.dataset.id;

            const qvName = document.getElementById('qvName');
            const qvPrice = document.getElementById('qvPrice');
            const qvImage = document.getElementById('qvImage');
            const qvDesc = document.getElementById('qvDescription');
            const qvLink = document.getElementById('qvLink');

            if (qvName) qvName.innerText = name;
            if (qvPrice) qvPrice.innerText = price;
            if (qvImage) qvImage.src = img;
            if (qvDesc) qvDesc.innerText = desc || 'Mô tả đang cập nhật...';
            if (qvLink) qvLink.href = `/product/${id}`;

            const modalEl = document.getElementById('quickViewModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        }
    });

    // 5. Cart Stepper Logic
    document.addEventListener('click', async function (e) {
        const btn = e.target.closest('.btn-qty-update');
        if (btn) {
            e.preventDefault();
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const input = btn.parentElement.querySelector('input');
            let currentQty = parseInt(input.value);

            // Calculate new quantity
            if (action === 'plus') currentQty++;
            else if (action === 'minus' && currentQty > 1) currentQty--;
            else return;

            // Optimistic update
            input.value = currentQty;

            try {
                // Determine item ID or product ID logic used in backend
                const res = await fetch(`/api/cart/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: currentQty })
                });

                if (res.ok) {
                    window.location.reload();
                } else {
                    const data = await res.json();
                    showToast(data.message || 'Cập nhật thất bại', 'danger');
                    // Revert
                    if (action === 'plus') input.value = currentQty - 1;
                    else input.value = currentQty + 1;
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi kết nối', 'danger');
            }
        }
    });

    // Wishlist Button Logic
    const addToWishlistBtn = document.getElementById('addToWishlistBtn');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const productId = this.dataset.id;
            const icon = this.querySelector('i');

            try {
                const res = await fetch('/api/users/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId })
                });

                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                const data = await res.json();
                if (data.status === 'success') {
                    if (data.action === 'added') {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        showToast('Đã thêm vào danh sách yêu thích!');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        showToast('Đã xóa khỏi danh sách yêu thích!');
                    }
                } else {
                    showToast(data.message || 'Lỗi', 'danger');
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi kết nối', 'danger');
            }
        });
    }

});
// Exit Intent Popup
let exitPopupShown = false;
const exitPopupEl = document.getElementById('exitIntentPopup');

// Check session storage
if (!sessionStorage.getItem('exitPopupShown') && exitPopupEl) {
    document.addEventListener('mouseleave', function (e) {
        if (e.clientY < 0 && !exitPopupShown) {
            exitPopupShown = true;
            sessionStorage.setItem('exitPopupShown', 'true');
            const modal = new bootstrap.Modal(exitPopupEl);
            modal.show();
        }
    });
}

// Coupon Logic
const applyCouponBtn = document.getElementById('applyCouponBtn');
if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', function () {
        const code = document.getElementById('couponCode').value.trim().toUpperCase();
        const msgEl = document.getElementById('couponMessage');

        if (!code) return;

        // Mock Validation
        if (code === 'SAVE10') {
            msgEl.innerText = 'Mã giảm giá hợp lệ! Giảm 10%.';
            msgEl.className = 'small mb-3 text-success fw-bold';
        } else if (code === 'FREESHIP') {
            msgEl.innerText = 'Mã Free Ship đã được áp dụng.';
            msgEl.className = 'small mb-3 text-success fw-bold';
        } else {
            msgEl.innerText = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
            msgEl.className = 'small mb-3 text-danger';
        }
    });
}

// Copy Voucher Code
window.copyCode = function (btn, code) {
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Đã Copy!';
        btn.classList.remove('btn-outline-dark');
        btn.classList.add('btn-dark');
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('btn-dark');
            btn.classList.add('btn-outline-dark');
        }, 2000);
    });
};

// Smart Nudges: Social Proof Notifications
document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const NOTIFICATION_DELAY_START = 15000; // Start 15s after load
    const NOTIFICATION_INTERVAL_MIN = 20000; // 20s
    const NOTIFICATION_INTERVAL_MAX = 45000; // 45s
    const NOTIFICATION_DISPLAY_TIME = 6000;  // Show for 6s

    // Mock Data - Realism focused
    const socialProofData = [
        { name: "Minh Tuấn", location: "Quận 1, TP.HCM", product: "Găng Tay Thủ Môn Predator Pro", time: "vừa xong", img: "https://dummyimage.com/100x100/333/fff&text=Gloves" },
        { name: "Hoàng Nam", location: "Cầu Giấy, Hà Nội", product: "Giày Bóng Đá X Crazyfast", time: "2 phút trước", img: "https://dummyimage.com/100x100/333/fff&text=Shoes" },
        { name: "Thanh Hà", location: "Đà Nẵng", product: "Áo Đấu CLB Arsenal 2024", time: "5 phút trước", img: "https://dummyimage.com/100x100/333/fff&text=Jersey" },
        { name: "Đức Thịnh", location: "Bình Dương", product: "Giày Chạy Bộ Adizero SL", time: "12 phút trước", img: "https://dummyimage.com/100x100/333/fff&text=Running" },
        { name: "Bảo Ngọc", location: "Hải Phòng", product: "Túi Đựng Giày Thể Thao", time: "vừa xong", img: "https://dummyimage.com/100x100/333/fff&text=Bag" }
    ];

    // Create Notification Container
    const container = document.createElement('div');
    container.id = 'social-proof-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '20px';
    container.style.zIndex = '9999';
    container.style.pointerEvents = 'none'; // Allow clicks through when hidden
    document.body.appendChild(container);

    const showNotification = (data) => {
        const el = document.createElement('div');
        el.className = 'social-proof-toast bg-white shadow-sm rounded overflow-hidden d-flex align-items-center mb-3';
        el.style.transform = 'translateY(100px)';
        el.style.opacity = '0';
        el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.width = '320px';
        el.style.borderLeft = '4px solid #a89166'; // Gold accent
        el.style.pointerEvents = 'auto';

        el.innerHTML = `
            <div class="p-2">
                <img src="${data.img}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
            </div>
            <div class="py-2 pe-3 ps-1">
                <p class="mb-0 small fw-bold text-dark">${data.name} <span class="text-muted fw-normal">từ ${data.location}</span></p>
                <p class="mb-0 small text-success"><i class="fas fa-check-circle"></i> Đã mua <strong>${data.product}</strong></p>
                <small class="text-muted" style="font-size: 0.75rem;">${data.time}</small>
            </div>
            <button type="button" class="btn-close ms-auto me-2 small" aria-label="Close" onclick="this.parentElement.remove()"></button>
        `;

        container.appendChild(el);

        // Animate In
        setTimeout(() => {
            el.style.transform = 'translateY(0)';
            el.style.opacity = '1';
        }, 100);

        // Animate Out
        setTimeout(() => {
            el.style.transform = 'translateY(20px)';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }, NOTIFICATION_DISPLAY_TIME);
    };

    const scheduleNext = () => {
        const delay = Math.floor(Math.random() * (NOTIFICATION_INTERVAL_MAX - NOTIFICATION_INTERVAL_MIN + 1)) + NOTIFICATION_INTERVAL_MIN;
        setTimeout(() => {
            const randomData = socialProofData[Math.floor(Math.random() * socialProofData.length)];

            // Don't show on Cart/Checkout pages to avoid distraction
            if (!window.location.pathname.includes('/cart') && !window.location.pathname.includes('/checkout')) {
                showNotification(randomData);
            }

            scheduleNext();
        }, delay);
    };

    // Initialize
    setTimeout(scheduleNext, NOTIFICATION_DELAY_START);
});
