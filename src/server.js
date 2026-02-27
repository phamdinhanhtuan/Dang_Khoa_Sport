const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dang-khoa-sport';

console.log('⏳ Connecting to Database...');

mongoose
    .connect(DB)
    .then(() => {
        console.log('✅ DB Connection Successful!');

        // Start Server ONLY after DB connection
        const mode = process.env.IS_ADMIN === 'true' ? 'ADMIN PANEL' : 'CUSTOMER STOREFRONT';
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 ${mode} running on port ${PORT}`);
            console.log(`👉 http://localhost:${PORT}`);
        });

        // Handle Server Errors (e.g. port in use)
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use! Please kill the process using port ${PORT} or change the port.`);
            } else {
                console.error('❌ Server startup error:', err);
            }
        });
    })
    .catch(err => {
        console.error('❌ DB Connection Failed:', err.message);
        // Optional: Exit if DB is critical
        // process.exit(1); 
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    // process.exit(1);
});
