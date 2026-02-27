const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Category = require('./src/models/categoryModel'); // Ensure this matches actual filename

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dang-khoa-sport')
    .then(() => console.log('DB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // 1. Clean Data
        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Category.deleteMany({});

        console.log('🧹 Data cleaned.');

        // 2. Create Categories
        const categories = await Category.create([
            { name: 'Football Shoes', slug: 'football-shoes' },
            { name: 'Football Jerseys', slug: 'football-jerseys' },
            { name: 'Running Shoes', slug: 'running-shoes' },
            { name: 'Tennis Gear', slug: 'tennis-gear' },
            { name: 'Basketball', slug: 'basketball' },
            { name: 'Accessories', slug: 'accessories' }
        ]);

        console.log('✅ Categories created.');

        // 3. Create Users
        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@gmail.com',
            password: '123456',
            role: 'admin'
        });

        const customerUser = await User.create({
            name: 'John Doe',
            email: 'user@gmail.com',
            password: '123456',
            role: 'user'
        });

        console.log('✅ Users created:');
        console.log('   - Admin: admin@gmail.com / 123456');
        console.log('   - Customer: user@gmail.com / 123456');

        // 4. Create Products
        const productsList = [
            {
                name: 'Nike Mercurial Superfly 9',
                price: 2500000,
                stock: 50,
                category: categories[0]._id,
                description: 'Professional football boots for firm ground.',
                image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80&w=500'
            },
            {
                name: 'Adidas X Crazyfast',
                price: 2100000,
                stock: 30,
                category: categories[0]._id,
                description: 'Ultra-lightweight boots designed for pure speed.',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500'
            },
            {
                name: 'Vietnam National Team Jersey 2024',
                price: 350000,
                stock: 100,
                category: categories[1]._id,
                description: 'Official match jersey with breathable fabric.',
                image: 'https://images.unsplash.com/photo-1507764923504-cd90bf7da7e8?auto=format&fit=crop&q=80&w=500'
            },
            {
                name: 'Nike Air Zoom Pegasus 40',
                price: 3200000,
                stock: 25,
                category: categories[2]._id,
                description: 'Responsive cushioning for every run.',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500'
            },
            {
                name: 'Wilson Pro Staff 97',
                price: 4500000,
                stock: 15,
                category: categories[3]._id,
                description: 'Precision and feel for advanced tennis players.',
                image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?q=80&w=500'
            },
            {
                name: 'Spalding NBA Official Ball',
                price: 1200000,
                stock: 40,
                category: categories[4]._id,
                description: 'Genuine leather basketball for professional play.',
                image: 'https://images.unsplash.com/photo-1519861531158-2863f68d117d?q=80&w=500'
            },
            {
                name: 'Anti-slip Sports Socks',
                price: 50000,
                stock: 200,
                category: categories[5]._id,
                description: 'High-quality socks with rubber grips for stabilization.',
                image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=500'
            }
        ];

        const products = await Product.insertMany(productsList);

        console.log('✅ Products created.');

        // 5. Create Sample Orders
        await Order.create({
            user: customerUser._id,
            totalAmount: 2500000,
            status: 'completed',
            shippingAddress: { fullName: 'Nguyen Van A', phone: '0909123456', addressLine: '123 Le Loi', city: 'HCM', province: 'District 1' },
            items: [{ product: products[0], quantity: 1, price: 2500000 }]
        });

        await Order.create({
            user: customerUser._id,
            totalAmount: 350000,
            status: 'pending',
            shippingAddress: { fullName: 'Nguyen Van A', phone: '0909123456', addressLine: '123 Le Loi', city: 'HCM', province: 'District 1' },
            items: [{ product: products[2], quantity: 1, price: 350000 }]
        });

        console.log('✅ Sample Orders created.');

        console.log('🎉 SEEDING COMPLETE! You can now login.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
