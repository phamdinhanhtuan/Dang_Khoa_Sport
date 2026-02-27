const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

// --- CONFIG ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dangkhoa_sport';

// --- MODELS (Simplified Definition for Reporting) ---
// Using existing models would be better but requires dealing with relative paths carefully
// For a standalone script, defining schemas or requiring models is fine.
// Let's try requiring models to ensure consistency.

const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Order = require('../src/models/Order');

async function generateReport() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);
        console.log("==================================================");
        console.log("📊 REPORT: SALES & SYSTEM STATS");
        console.log("==================================================");

        // 1. Basic Counts
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();

        console.log(`📦 Total Products: ${productCount}`);
        console.log(`👥 Total Users:    ${userCount}`);
        console.log(`🛒 Total Orders:   ${orderCount}`);

        // 2. Financials
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
        const revenueFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);

        console.log(`💰 Total Revenue:  ${revenueFormatted}`);

        // 3. Order Status Breakdown
        const statusStats = {};
        orders.forEach(o => {
            const s = o.status || 'unknown';
            statusStats[s] = (statusStats[s] || 0) + 1;
        });

        console.log("\n📋 Orders by Status:");
        Object.keys(statusStats).forEach(s => {
            console.log(`   - ${s.toUpperCase().padEnd(10)}: ${statusStats[s]}`);
        });

        console.log("==================================================");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

generateReport();
