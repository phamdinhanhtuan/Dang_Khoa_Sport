const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('System Health Check', () => {

    beforeAll(async () => {
        // Connect to a test database or mock
        // For sanity check we might mock or skip DB dependent tests if not set up
        if (process.env.MONGO_URI) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('GET /health returns 200', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('UP');
    });

    test('GET / returns 200 (Home Page)', async () => {
        const res = await request(app).get('/');
        // Should return 200 and html
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Đăng Khoa Sport');
    });

    test('GET /products returns product list', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toEqual(200);
    });

});
