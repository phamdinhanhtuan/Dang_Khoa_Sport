const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dang-khoa-sport');
        console.log('✅ Đã kết nối MongoDB');

        // Xóa admin cũ nếu có
        await User.deleteOne({ email: 'admin@gmail.com' });

        // Tạo admin mới
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@gmail.com',
            password: '123456',
            role: 'admin'
        });

        console.log('🎉 Đã tạo tài khoản thành công!');
        console.log('------------------------------');
        console.log('📧 Email: admin@gmail.com');
        console.log('🔑 Pass:  123456');
        console.log('------------------------------');
        console.log('👉 Hãy khởi động lại Server (npm start) và đăng nhập ngay!');

        process.exit();
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
};

resetAdmin();
