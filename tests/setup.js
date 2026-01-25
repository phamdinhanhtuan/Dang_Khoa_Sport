const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
    // Connect to a test database
    // Fallback to a default test string if .env.test is missing (for safety)
    const dbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/dang-khoa-sport-test';
    await mongoose.connect(dbUri);
});

afterAll(async () => {
    // Drop the test database and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// Mock console.log to keep test output clean, if desired
// global.console = { ...console, log: jest.fn() };
