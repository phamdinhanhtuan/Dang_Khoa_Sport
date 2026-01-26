const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Category = require('./src/models/categoryModel');
const Product = require('./src/models/Product');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        console.log('Data Destroyed...');

        // 1. Create Users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@dangkhoasport.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user'
            }
        ]);
        console.log('Users Created...');

        // 2. Create Categories
        const categories = await Category.create([
            { name: 'Badminton', description: 'Vợt, giày và phụ kiện cầu lông chính hãng' },
            { name: 'Football', description: 'Giày đá banh, quần áo và phụ kiện bóng đá' },
            { name: 'Running', description: 'Giày chạy bộ và trang phục thể thao' },
            { name: 'Accessories', description: 'Túi, balo, vớ và phụ kiện khác' }
        ]);
        console.log('Categories Created...');

        // 3. Create Products
        const products = await Product.create([
            // --- BADMINTON (Category 0) ---
            {
                name: 'Yonex Astrox 100ZZ Kurenai',
                brand: 'Yonex',
                price: 4100000,
                description: 'Vợt cầu lông Yonex Astrox 100ZZ Kurenai - Sức mạnh tấn công hủy diệt với công nghệ Namd.',
                category: categories[0]._id,
                stock: 20,
                images: [
                    'https://images.unsplash.com/photo-1626224583764-847890e05895?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1613918116376-729ebfc1b73e?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Lining Axforce 80',
                brand: 'Lining',
                price: 3500000,
                description: 'Vợt Lining Axforce 80 - Sự lựa chọn của nhà vô địch Chen Long. Công nghệ Box Wing Frame.',
                category: categories[0]._id,
                stock: 15,
                images: [
                    'https://images.unsplash.com/photo-1626224583764-847890e05895?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1594911470427-4467000788ae?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Giày Cầu Lông Yonex Eclipsion Z3',
                brand: 'Yonex',
                price: 2600000,
                description: 'Giày cầu lông Yonex Eclipsion Z3 - Ổn định tối đa, bám sân cực tốt.',
                category: categories[0]._id,
                stock: 30,
                images: [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Ống Cầu Lông Vina Star',
                brand: 'Vina',
                price: 180000,
                description: 'Cầu lông Vina Star tiêu chuẩn thi đấu, bền bỉ, đường cầu ổn định.',
                category: categories[0]._id,
                stock: 200,
                images: [
                    'https://images.unsplash.com/photo-1626818617830-ec3975487752?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1622325376722-e0bd26543b35?auto=format&fit=crop&w=600&q=80'
                ]
            },

            // --- FOOTBALL (Category 1) ---
            {
                name: 'Nike Mercurial Superfly 9 Elite',
                brand: 'Nike',
                price: 5800000,
                description: 'Giày đá bóng sân cỏ nhân tạo Nike Mercurial Superfly 9. Tốc độ bùng nổ.',
                category: categories[1]._id,
                stock: 25,
                images: [
                    'https://images.unsplash.com/photo-1511886929837-a978fed018ef?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1579298245158-33e8f568f7d3?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Adidas X Crazyfast.1',
                brand: 'Adidas',
                price: 4500000,
                description: 'Giày đá bóng Adidas X Crazyfast - Nhẹ hơn, nhanh hơn.',
                category: categories[1]._id,
                stock: 20,
                images: [
                    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1575035255476-cda12f667101?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Kamito TA11 - Tuấn Anh',
                brand: 'Kamito',
                price: 650000,
                description: 'Giày đá bóng Kamito TA11, thiết kế bởi cầu thủ Nguyễn Tuấn Anh. Form giày người Việt.',
                category: categories[1]._id,
                stock: 100,
                images: [
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Áo Bóng Đá Đội Tuyển Việt Nam 2024',
                brand: 'Grand Sport',
                price: 850000,
                description: 'Áo đấu chính hãng Đội Tuyển Việt Nam. Chất liệu thoáng mát.',
                category: categories[1]._id,
                stock: 80,
                images: [
                    'https://images.unsplash.com/photo-1518903823758-c09e338c9287?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1577215266716-e41b21237197?auto=format&fit=crop&w=600&q=80'
                ]
            },

            // --- RUNNING (Category 2) ---
            {
                name: 'Nike Air Zoom Pegasus 40',
                brand: 'Nike',
                price: 3200000,
                description: 'Đôi giày chạy bộ quốc dân, êm ái cho mọi cự ly.',
                category: categories[2]._id,
                stock: 50,
                images: [
                    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Adidas Ultraboost Light',
                brand: 'Adidas',
                price: 4200000,
                description: 'Hoàn trả năng lượng cực đại với công nghệ Light Boost mới nhất.',
                category: categories[2]._id,
                stock: 40,
                images: [
                    'https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=600&q=80'
                ]
            },

            // --- ACCESSORIES (Category 3) ---
            {
                name: 'Balo Thể Thao Đa Năng',
                brand: 'Adidas',
                price: 550000,
                description: 'Balo rộng rãi, có ngăn đựng giày riêng biệt.',
                category: categories[3]._id,
                stock: 60,
                images: [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=600&q=80'
                ]
            },
            {
                name: 'Bình Nước Thể Thao Lock&Lock',
                brand: 'Lock&Lock',
                price: 250000,
                description: 'Bình nước giữ nhiệt, an toàn cho sức khỏe.',
                category: categories[3]._id,
                stock: 100,
                images: [
                    'https://images.unsplash.com/photo-1602143407151-011141950038?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80'
                ]
            }

        ]);
        console.log('Products Created...');

        console.log('Seed Completed Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB().then(() => {
    importData();
});
