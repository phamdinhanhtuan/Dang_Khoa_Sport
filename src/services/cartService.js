const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const aiService = require('./aiAppService');

class CartService {
    /**
     * Get or Create Cart for a User
     * Ensures data integrity (price syncing, removal of stale items)
     * @param {String} userId 
     * @returns {Object} cart
     */
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return { items: [], totalQty: 0, totalCost: 0, coupon: null };
        }

        // Data Integrity: Check for deleted products and Sync Prices
        let needsSave = false;

        // 1. Filter out items referring to deleted products
        const validItems = [];
        for (const item of cart.items) {
            if (item.product) {
                // Sync price if missing (legacy data)
                if (!item.price) {
                    item.price = item.product.price;
                    needsSave = true;
                }
                validItems.push(item);
            } else {
                needsSave = true; // Item removed
            }
        }
        cart.items = validItems;

        // 2. Compute Totals
        cart.subTotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 3. Coupon Logic
        let discountAmount = 0;
        if (cart.coupon && cart.coupon.code) {
            if (cart.coupon.discount > 0) {
                discountAmount = (cart.subTotal * cart.coupon.discount) / 100;
            }
        }

        // Calculate Final Total
        cart.discountAmount = discountAmount;
        cart.totalCost = cart.subTotal - discountAmount;
        if (cart.totalCost < 0) cart.totalCost = 0;

        // Update DB properties for consistency/cache if needed
        cart.totalQty = cart.items.reduce((acc, item) => acc + item.quantity, 0);

        if (needsSave) {
            await cart.save();
        }

        // Attach Recommendations (AI) - loosely coupled
        try {
            cart.recommendations = await aiService.getCartRecommendations(cart.items);
        } catch (err) {
            cart.recommendations = [];
        }

        return cart;
    }

    /**
     * Add Item to Cart
     */
    async addToCart(userId, { productId, quantity, color, size }) {
        const qty = parseInt(quantity) || 1;
        const selectedColor = color || 'Default';
        const selectedSize = size || 'Default';

        const product = await Product.findById(productId);
        if (!product) throw new AppError('Sản phẩm không tồn tại', 404);

        if (product.stock < qty) {
            throw new AppError('Sản phẩm đã hết hàng', 400); // Controller handles redirect
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check for existing item with same ID + Color + Size
        const itemIndex = cart.items.findIndex(p =>
            (p.product.toString() === productId) &&
            (p.color === selectedColor) &&
            (p.size === selectedSize)
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({
                product: product._id,
                name: product.name,
                quantity: qty,
                color: selectedColor,
                size: selectedSize,
                price: product.price
            });
        }

        await this._saveCart(cart);
        return cart;
    }

    /**
     * Remove Item from Cart
     */
    async removeFromCart(userId, itemId) {
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = cart.items.filter(item => item._id.toString() !== itemId);
            await this._saveCart(cart);
        }
        return cart;
    }

    /**
     * Update Item Quantity
     */
    async updateItemQuantity(userId, itemId, quantity) {
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(p => p._id.toString() === itemId);
            if (itemIndex > -1) {
                let newQty = parseInt(quantity);
                if (newQty < 1) newQty = 1;
                cart.items[itemIndex].quantity = newQty;
                await this._saveCart(cart);
            }
        }
        return cart;
    }

    /**
     * Clear Cart
     */
    async clearCart(userId) {
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            cart.totalQty = 0;
            cart.totalCost = 0;
            cart.coupon = null;
            await cart.save();
        }
    }

    /**
     * Apply Coupon
     */
    async applyCoupon(userId, code) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return null;

        if (code && code.toUpperCase() === 'SAVE10') {
            cart.coupon = { code: 'SAVE10', discount: 10 };
        } else {
            // Logic for clearing or invalid
            cart.coupon = { code: null, discount: 0 };
        }

        await this._saveCart(cart); // Helper recalculates totals
        return cart;
    }

    /**
     * Merge Session Cart into User Cart
     * @param {String} userId 
     * @param {Object} sessionCart (req.session.cart)
     */
    async mergeSessionCart(userId, sessionCart) {
        if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
            return;
        }

        let dbCart = await Cart.findOne({ user: userId });
        if (!dbCart) {
            dbCart = await Cart.create({ user: userId, items: [] });
        }

        for (const sItem of sessionCart.items) {
            const sProdId = (sItem.product && sItem.product._id)
                ? sItem.product._id.toString()
                : (sItem.product ? sItem.product.toString() : null);

            if (!sProdId) continue;

            const idx = dbCart.items.findIndex(i => i.product && i.product.toString() === sProdId);
            if (idx > -1) {
                dbCart.items[idx].quantity += sItem.quantity;
            } else {
                dbCart.items.push({
                    product: sProdId,
                    quantity: sItem.quantity,
                    price: sItem.price || 0, // Ensure price is carried over or fetched
                    name: sItem.name,
                    color: sItem.color || 'Default',
                    size: sItem.size || 'Default'
                });
            }
        }

        await this._saveCart(dbCart);
    }

    /**
     * Helper to save cart with recalculated totals
     */
    async _saveCart(cart) {
        cart.totalQty = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        const subTotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        let discountAmount = 0;
        if (cart.coupon && cart.coupon.discount > 0) {
            discountAmount = (subTotal * cart.coupon.discount) / 100;
        }

        cart.totalCost = subTotal - discountAmount;
        if (cart.totalCost < 0) cart.totalCost = 0;

        await cart.save();
    }
}

module.exports = new CartService();
