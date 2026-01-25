const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper
const getCartHelper = async (req) => {
    if (req.user) {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
        return cart;
    } else if (req.session) {
        if (!req.session.cart) req.session.cart = { items: [] };
        return req.session.cart;
    }
    return { items: [] };
};

exports.getCart = catchAsync(async (req, res, next) => {
    let cart = await getCartHelper(req);

    // Decorate session cart for view
    let displayItems = cart.items ? [...cart.items] : [];

    if (req.user) {
        // Filter out items where product is null (deleted product)
        const validItems = cart.items.filter(item => item.product);
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
            displayItems = [...cart.items];
        }
    } else if (req.session && displayItems.length > 0) {
        // Filter out items that are already objects (if sloppy session occurred)
        const productIds = displayItems.map(i => i.product._id || i.product);

        try {
            const products = await Product.find({ _id: { $in: productIds } });
            displayItems = displayItems.map(item => {
                const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
                const p = products.find(prod => prod._id.toString() === itemId);
                return { ...item, product: p || null }; // Return null if not found
            }).filter(item => item.product); // Filter out nulls

            // Optional: Update session cart to reflect removed items (if we want to be persistent)
            if (displayItems.length !== req.session.cart.items.length) {
                req.session.cart.items = displayItems.map(i => ({
                    product: i.product._id.toString(),
                    quantity: i.quantity,
                    color: i.color,
                    size: i.size
                }));
            }

        } catch (err) {
            console.error('Cart populate error:', err);
            // Fallback to empty or raw
            displayItems = [];
        }
    }

    // Use displayItems for calculation
    // cart.items = displayItems; // Avoid mutating mongoose doc or session directly if not needed, but we prepared displayItems.

    const calculatedItems = displayItems;

    // Calculate totals
    const totalPrice = calculatedItems.reduce((acc, item) => {
        const price = item.product.price || item.price || 0;
        return acc + (price * item.quantity);
    }, 0);
    const totalQuantity = calculatedItems.reduce((acc, item) => acc + item.quantity, 0);

    // Sync header badge immediately
    res.locals.cartCount = totalQuantity;

    // Attach for view/json
    const responseCart = {
        items: calculatedItems,
        totalQuantity,
        totalPrice,
        _id: cart._id
    };

    if (req.originalUrl.startsWith('/api') && !req.accepts('html')) {
        res.status(200).json({ status: 'success', data: { cart: responseCart } });
    } else {
        res.render('cart', { title: 'Cart', cart: responseCart });
    }
});

exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity, color, size } = req.body;
    let qty = parseInt(quantity, 10) || 1;
    if (qty < 1) qty = 1;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (product.stock < qty) {
        return next(new AppError('Out of stock', 400));
    }

    if (req.user) {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

        // Check if item with same product, color, and size exists
        const idx = cart.items.findIndex(i =>
            i.product.toString() === productId &&
            i.color === color &&
            i.size === size
        );

        if (idx > -1) {
            cart.items[idx].quantity += qty;
        } else {
            cart.items.push({ product: productId, quantity: qty, color, size });
        }
        await cart.save();
    } else {
        if (!req.session.cart) req.session.cart = { items: [] };
        const cart = req.session.cart;

        const idx = cart.items.findIndex(i =>
            i.product.toString() === productId &&
            i.color === color &&
            i.size === size
        );

        if (idx > -1) {
            cart.items[idx].quantity += qty;
        } else {
            cart.items.push({ product: productId, quantity: qty, price: product.price, color, size });
        }
    }

    res.status(200).json({ status: 'success', message: 'Added to cart' });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
    // We need to identify the item not just by productId but potentially by color/size if we supported multiple variants of same product.
    // However, the current API uses /api/cart/:productId. 
    // Creating a proper unique Item ID is better, but for now we'll assume the frontend passes the specific criteria or we update all matching products? 
    // Actually, normally cart items have their own _id in Mongoose. We should access by Item ID.
    // But the route is /api/cart/:productId. This is ambiguous if I have 2 Red Shoes and 1 Blue Shoe of same ID.
    // **FIX**: We will assume the frontend passes `itemId` in the body or we use a better identifier. 
    // But since I can't easily change the route signature without breaking things, let's try to match by productId AND (color/size if provided in body) or just update the first one?
    // The "Edit" modal allows changing color/size. This means we are UPDATING the specific item.
    // Best match: ObjectId of the item in the array.

    // For this specific turn, I'll stick to the existing route structure but look for `itemId` in body if available, or fallback to product match.

    const { productId } = req.params;
    const { quantity, color, size, itemId } = req.body;
    const qty = parseInt(quantity, 10);

    if (req.user) {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            // If itemId is provided (it should be for editing specific line item)
            let item;
            if (itemId) {
                item = cart.items.id(itemId);
            } else {
                // Legacy fallback
                item = cart.items.find(i => i.product.toString() === productId);
            }

            if (item) {
                if (qty > 0) item.quantity = qty;
                if (color) item.color = color;
                if (size) item.size = size;

                // If quantity is 0 or less, maybe remove? The logic below handled remove separately?
                // The prompt's screen shows "Update", so usually it's meant to modify.
            }
            await cart.save();
        }
    } else {
        const cart = req.session.cart;
        if (cart && cart.items) {
            let item;
            // Session items usually don't have _id unless we generated them. Mongoose creates them if we use the schema but here it's POJO?
            // We'll rely on index or matching properties.
            if (itemId) {
                item = cart.items.find(i => i._id === itemId || i.id === itemId);
            }
            if (!item) {
                item = cart.items.find(i => i.product.toString() === productId);
            }

            if (item) {
                if (qty > 0) item.quantity = qty;
                if (color) item.color = color;
                if (size) item.size = size;
            }
        }
    }
    res.status(200).json({ status: 'success' });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params; // Can be ItemID or ProductID

    if (req.user) {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            // Check if input is a valid Item ID in the array
            const itemExists = cart.items.id(productId);
            if (itemExists) {
                cart.items.pull(productId);
            } else {
                // Fallback: Filter by Product ID (removes all variants)
                cart.items = cart.items.filter(i => {
                    const pId = (i.product && i.product._id) ? i.product._id.toString() : i.product.toString();
                    return pId !== productId;
                });
            }
            await cart.save();
        }
    } else {
        const cart = req.session.cart;
        if (cart && cart.items) {
            cart.items = cart.items.filter(i => {
                const pId = (i.product && i.product._id) ? i.product._id.toString() : i.product.toString();
                return pId !== productId;
            });
        }
    }
    res.status(200).json({ status: 'success' });
});

exports.clearCart = catchAsync(async (req, res, next) => {
    if (req.user) {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
    } else {
        if (req.session.cart) {
            req.session.cart.items = [];
        }
    }
    res.status(200).json({ status: 'success', message: 'Cart cleared' });
});
