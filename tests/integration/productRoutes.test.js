const request = require('supertest');
const app = require('../../src/app');
const Product = require('../../src/models/Product');
const Category = require('../../src/models/categoryModel');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Product Routes Integration', () => {
    let adminToken;
    let categoryId;

    beforeEach(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@prod.com',
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'admin'
        });

        // Generate Token directly (mocking login)
        adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // Create Category
        const category = await Category.create({ name: 'Football' });
        categoryId = category._id;
    });

    describe('GET /api/products', () => {
        it('should return all products', async () => {
            await Product.create({
                name: 'Ball',
                brand: 'Nike',
                price: 100,
                category: categoryId,
                description: 'A ball',
                stock: 10
            });

            const res = await request(app).get('/api/products');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.results).toBe(1);
        });
    });

    describe('POST /api/products', () => {
        it('should allow admin to create product', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .set('Cookie', [`jwt=${adminToken}`])
                .attach('image', Buffer.from('fake image data'), 'test.jpg') // Add dummy image
                // Use .field() for multipart/form-data simulation which Multer expects
                .field('name', 'New Product')
                .field('brand', 'Adidas')
                .field('price', 200)
                .field('category', categoryId.toString())
                .field('description', 'New shiny product')
                .field('stock', 50);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.product.name).toBe('New Product');
        });

        it('should reject non-admin users', async () => {
            // Create normal user
            const user = await User.create({
                name: 'Normal User',
                email: 'user@prod.com',
                password: 'password123',
                passwordConfirm: 'password123'
            });
            const userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', [`jwt=${userToken}`])
                .send({
                    name: 'Hacker Product',
                    brand: 'Hack',
                    price: 0,
                    category: categoryId,
                    description: 'Hack',
                    stock: 0
                });

            // Depending on middleware implementation, might be 403 or 401
            expect([401, 403]).toContain(res.statusCode);
        });
    });
});
