const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');

// Load env
dotenv.config();

// Fix Mongoose Promisify
mongoose.Promise = global.Promise;

// Connect DB (Options removed for Mongoose 6+)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dangkhoasport')
    .then(() => console.log('✅ DB Connected for Seeding'))
    .catch(err => {
        console.error('❌ DB Connection Error:', err);
        process.exit(1);
    });

// Models
const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    image: String
});
CategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    price: { type: Number, required: true },
    discountPrice: Number,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    stock: { type: Number, default: 100 },
    image: String,
    images: [String],
    isFeatured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 },
    ratingsAverage: { type: Number, default: 4.5 },
    ratingsQuantity: { type: Number, default: 0 }
});
ProductSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }) + '-' + Date.now();
    next();
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Data
const categories = [
    { name: 'Giày Bóng Đá', image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800' },
    { name: 'Quần Áo Thể Thao', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800' },
    { name: 'Phụ Kiện', image: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?auto=format&fit=crop&w=800' },
    { name: 'Giày Chạy Bộ', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800' }
];

const products = [
    {
        name: 'Giày Đá Bóng Nike Mercurial Vapor 15',
        price: 3500000,
        discountPrice: 2990000,
        description: 'Giày đá bóng sân cỏ nhân tạo cao cấp, thiết kế khí động học.',
        stock: 50,
        isFeatured: true,
        image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/f4ed4b9d-4786-4447-b8d4-53940173663b/mercurial-vapor-15-elite-fg-firm-ground-soccer-cleats-s1t8X1.jpg',
        images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/f4ed4b9d-4786-4447-b8d4-53940173663b/mercurial-vapor-15-elite-fg-firm-ground-soccer-cleats-s1t8X1.jpg'],
        ratingsAverage: 5.0,
        categoryName: 'Giày Bóng Đá'
    },
    {
        name: 'Áo Đấu Đội Tuyển Việt Nam 2024',
        price: 850000,
        description: 'Áo đấu chính hãng Grand Sport, chất liệu thoáng mát.',
        stock: 200,
        isFeatured: true,
        image: 'https://product.hstatic.net/200000278317/product/upload_4c668b5770d14878a8767e716ee890a2_master.jpg',
        images: ['https://product.hstatic.net/200000278317/product/upload_4c668b5770d14878a8767e716ee890a2_master.jpg'],
        ratingsAverage: 4.8,
        categoryName: 'Quần Áo Thể Thao'
    },
    {
        name: 'Giày Adidas Ultraboost Light',
        price: 4200000,
        description: 'Công nghệ Boost nhẹ nhất từng có, phản hồi năng lượng cực tốt.',
        stock: 30,
        isFeatured: true,
        image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0fbed4646c1d46e0aae5af6901301f46_9366/Giay_Ultraboost_Light_trang_HQ6351_01_standard.jpg',
        images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/0fbed4646c1d46e0aae5af6901301f46_9366/Giay_Ultraboost_Light_trang_HQ6351_01_standard.jpg'],
        ratingsAverage: 4.9,
        categoryName: 'Giày Chạy Bộ'
    },
    {
        name: 'Balo Puma TeamFlip',
        price: 650000,
        description: 'Balo thể thao tiện dụng, ngăn chứa rộng rãi.',
        stock: 80,
        isFeatured: false,
        image: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/079948/01/fnd/VNM/fmt/png/Ba-l%C3%B4-Th%E1%BB%83-Thao-Unisex-Deck-II',
        images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/079948/01/fnd/VNM/fmt/png/Ba-l%C3%B4-Th%E1%BB%83-Thao-Unisex-Deck-II'],
        ratingsAverage: 4.5,
        categoryName: 'Phụ Kiện'
    },
    {
        name: 'Găng Tay Thủ Môn Adidas Predator',
        price: 1200000,
        description: 'Độ bám dính cực tốt, bảo vệ ngón tay.',
        stock: 20,
        isFeatured: false,
        image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/20684f86151f49679198afbb00e47012_9366/Gang_Tay_Thu_Mon_Predator_Match_trang_HN5565_01_standard.jpg',
        images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/20684f86151f49679198afbb00e47012_9366/Gang_Tay_Thu_Mon_Predator_Match_trang_HN5565_01_standard.jpg'],
        ratingsAverage: 4.7,
        categoryName: 'Phụ Kiện'
    },
    {
        name: 'Giày Bóng Rổ Nike LeBron XX',
        price: 5100000,
        description: 'Siêu nhẹ, đệm Zoom Air đàn hồi.',
        stock: 15,
        isFeatured: true,
        image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/216f9f5b-d450-482f-87d2-74c10a4e7674/lebron-xx-basketball-shoes-CT1122.jpg',
        images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/216f9f5b-d450-482f-87d2-74c10a4e7674/lebron-xx-basketball-shoes-CT1122.jpg'],
        ratingsAverage: 5.0,
        categoryName: 'Giày Bóng Đá' // Mock category
    }
];

const seedDB = async () => {
    try {
        await Category.deleteMany({});
        await Product.deleteMany({});

        const createdCategories = await Category.insertMany(categories);
        console.log('✅ Categories Seeded');

        // Map Category IDs
        const catMap = {};
        createdCategories.forEach(cat => {
            catMap[cat.name] = cat._id;
        });

        const finalProducts = products.map(p => {
            const catName = p.categoryName || 'Quần Áo Thể Thao';
            // Default to first cat if not found
            const catId = catMap[catName] || createdCategories[0]._id;
            const { categoryName, ...productData } = p;
            return {
                ...productData,
                category: catId,
                viewCount: Math.floor(Math.random() * 500) + 50,
                soldCount: Math.floor(Math.random() * 100) + 5
            };
        });

        await Product.insertMany(finalProducts);
        console.log('✅ Products Seeded');
        console.log('🎉 Database Populated Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
