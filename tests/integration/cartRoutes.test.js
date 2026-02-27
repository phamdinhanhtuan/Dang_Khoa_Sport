const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');
const Cart = require('../../src/models/Cart');
const jwt = require('jsonwebtoken');

describe('Cart Routes Integration', () => {
    let userToken;
    let userId;
    let productId;

    beforeEach(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});

        // Create User
        const user = await User.create({
            name: 'Cart User',
            email: 'cart@example.com',
            password: 'password123'
        });
        userId = user._id;
        userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create Product
        const product = await Product.create({
            name: 'Test Shoe',
            brand: 'Nike',
            price: 100,
            category: new mongoose.Types.ObjectId(),
            description: 'Test Desc',
            stock: 10
        });
        productId = product._id;
    });

    describe('POST /api/cart', () => {
        it('should add product to cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Cookie', [`jwt=${userToken}`])
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    productId: productId,
                    quantity: 2
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.cart.items).toHaveLength(1);
            expect(res.body.data.cart.items[0].quantity).toBe(2);
        });
    });

    describe('GET /api/cart', () => {
        it('should get user cart', async () => {
            // Setup existing cart
            await Cart.create({
                user: userId,
                items: [{ product: productId, quantity: 1, price: 100 }]
            });

            const res = await request(app)
                .get('/api/cart')
                .set('Cookie', [`jwt=${userToken}`])
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.cart.items).toHaveLength(1);
        });
    });
});
