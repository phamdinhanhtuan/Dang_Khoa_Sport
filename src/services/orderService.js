const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/appError');

class OrderService {
    // 1. Create Order from Cart WITH INVENTORY CHECK
    async createOrderFromCart(userId, shippingData) {
        // Start Session for Transaction (Mocking transaction for junior level by manual checks)
        // In real world with Replica Set: const session = await mongoose.startSession();

        // Get Cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            throw new AppError('Giỏ hàng trống', 400);
        }

        // Calculate Total and Build Order Items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new AppError(`Sản phẩm không còn tồn tại`, 400);
            }
            if (product.stock < item.quantity) {
                throw new AppError(`Sản phẩm ${product.name} chỉ còn ${product.stock} cái`, 400);
            }

            totalAmount += item.price * item.quantity;

            orderItems.push({
                product: {
                    _id: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price
                },
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size
            });
        }

        // Apply Coupon Discount Logic to Final Total
        if (cart.coupon && cart.coupon.discount > 0) {
            const discountAmount = (totalAmount * cart.coupon.discount) / 100;
            totalAmount -= discountAmount;
            if (totalAmount < 0) totalAmount = 0;
        }

        // Create Order
        const newOrder = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            shippingAddress: shippingData
        });

        // Decrement Stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear Cart
        cart.items = [];
        cart.totalQty = 0;
        cart.coupon = null; // Clear coupon
        await cart.save();

        return newOrder;
    }

    // 2. Get Order by ID
    async getOrderById(orderId, userId) {
        const order = await Order.findOne({ _id: orderId, user: userId }).populate('user', 'name email');
        if (!order) {
            throw new AppError('Không tìm thấy đơn hàng', 404);
        }
        return order;
    }

    // 3. Get User Orders
    async getUserOrders(userId) {
        return await Order.find({ user: userId }).sort('-createdAt');
    }

    // 4. Update Order Status (Admin)
    async updateOrderStatus(orderId, status) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('No order found with that ID', 404);
        }
        order.status = status;
        await order.save();
        return order;
    }

    // 5. Admin: Get All Orders with Filtering
    async getAllOrders(query) {
        const statusFilter = query.status ? { status: query.status } : {};
        return await Order.find(statusFilter).sort('-createdAt').populate('user', 'name email');
    }

    // 6. Admin: Get Order by ID (No User Check)
    async getOrderByIdForAdmin(orderId) {
        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) {
            throw new AppError('Không tìm thấy đơn hàng', 404);
        }
        return order;
    }
    // 7. Admin: Count Orders
    async countOrders() {
        return await Order.countDocuments();
    }

    // 8. Admin: Get Recent Orders
    async getRecentOrders(limit = 5) {
        return await Order.find().sort('-createdAt').limit(limit).populate('user');
    }
}

module.exports = new OrderService();
