const mongoose = require('mongoose');
const Category = require('./src/models/categoryModel');
require('dotenv').config();

const categories = [
    // GROUP 1: TEAM SPORTS (THỂ THAO ĐỒNG ĐỘI)
    {
        name: 'BÓNG ĐÁ & FUTSAL',
        group: 'team-sports',
        slug: 'bong-da',
        showInHeader: false,
        children: [
            { name: 'Giày bóng đá', slug: 'giay-bong-da' },
            { name: 'Quần áo bóng đá', slug: 'quan-ao-bong-da' },
            { name: 'Phụ kiện bóng đá', slug: 'phu-kien-bong-da' },
            { name: 'Quả bóng đá', slug: 'qua-bong-da' }
        ]
    },
    {
        name: 'BÓNG RỔ',
        group: 'team-sports',
        slug: 'bong-ro',
        children: [
            { name: 'Giày bóng rổ', slug: 'giay-bong-ro' },
            { name: 'Bóng rổ tiêu chuẩn', slug: 'bong-ro-tieu-chuan' },
            { name: 'Quần áo bóng rổ', slug: 'quan-ao-bong-ro' }
        ]
    },
    {
        name: 'BÓNG CHUYỀN',
        group: 'team-sports',
        slug: 'bong-chuyen',
        showInHeader: true, // "Giày bóng chuyền Sao Vàng" will be a child or this parent renamed
        children: [
            { name: 'Giày bóng chuyền chuyên dụng', slug: 'giay-bong-chuyen-chuyen-dung' },
            { name: 'Quả bóng chuyền', slug: 'qua-bong-chuyen' },
            { name: 'Bó gối/Bó gót', slug: 'bo-goi-bo-got' }
        ]
    },

    // GROUP 2: RACKET & INDIVIDUAL (RACKET & CÁ NHÂN)
    {
        name: 'PICKLEBALL CHÍNH HÃNG',
        group: 'racket-individual',
        slug: 'pickleball',
        showInHeader: true,
        showAsHot: true,
        order: 1,
        children: [
            { name: 'Vợt Pickleball', slug: 'vot-pickleball' },
            { name: 'Giày Pickleball', slug: 'giay-pickleball' },
            { name: 'Bóng Pickleball', slug: 'bong-pickleball' },
            { name: 'Túi/Balo Pickleball', slug: 'tui-pickleball' }
        ]
    },
    {
        name: 'CẦU LÔNG',
        group: 'racket-individual',
        slug: 'cau-long',
        children: [
            { name: 'Vợt cầu lông', slug: 'vot-cau-long' },
            { name: 'Giày cầu lông', slug: 'giay-cau-long' },
            { name: 'Quả cầu lông', slug: 'qua-cau-long' },
            { name: 'Quấn cán vợt', slug: 'quan-can-vot' }
        ]
    },
    {
        name: 'CHẠY BỘ & GYM',
        group: 'racket-individual',
        slug: 'chay-bo-gym',
        children: [
            { name: 'Giày chạy bộ', slug: 'giay-chay-bo' },
            { name: 'Quần áo tập Gym', slug: 'quan-ao-tap-gym' },
            { name: 'Phụ kiện tập luyện', slug: 'phu-kien-tap-luyen' }
        ]
    },

    // GROUP 3: BILLIARDS & ACCESSORIES (BI-A & PHỤ KIỆN)
    {
        name: 'BI-A (BILLIARDS)',
        group: 'billiards-accessories',
        slug: 'billiards',
        showInHeader: true,
        order: 2,
        children: [
            { name: 'Gậy Bi-a (Cơ) Cá nhân', slug: 'gay-bi-a-ca-nhan' },
            { name: 'Gậy Phá/Nhảy chuyên dụng', slug: 'gay-pha-nhay-chuyen-dung' },
            { name: 'Bao đựng cơ cao cấp', slug: 'bao-dung-co-cao-cap' },
            { name: 'Phụ kiện Bi-a (Lơ, Đầu cơ)', slug: 'phu-kien-bi-a-lo-dau-co' }
        ]
    },
    {
        name: 'PHỤ KIỆN KHÁC',
        group: 'billiards-accessories',
        slug: 'phu-kien-khac',
        children: [
            { name: 'Tất thể thao dệt kim', slug: 'tat-the-thao-det-kim' },
            { name: 'Balo - Túi xách thể thao', slug: 'balo-tui-xach-the-thao' },
            { name: 'Băng quấn/Bảo vệ chấn thương', slug: 'bang-quan-bao-ve-chan-thuong' }
        ]
    },

    // SPECIAL HEADER ITEMS
    {
        name: 'GIÀY BÓNG CHUYỀN SAO VÀNG',
        group: 'team-sports',
        slug: 'volleyball',
        showInHeader: true,
        order: 3
    },
    {
        name: 'SEAGAMES 2025',
        group: 'featured',
        slug: 'seagames',
        showInHeader: true,
        showAsHot: true,
        order: 4
    },
    {
        name: 'XẢ KHO 50%',
        group: 'sale',
        slug: 'sale-50',
        showInHeader: true,
        order: 5
    }
];

const seedCategories = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dang-khoa-sport';
        await mongoose.connect(uri);
        console.log(`Connected to: ${uri}`);

        console.log('🗑️ Clearing existing categories...');
        await Category.deleteMany({});

        console.log('🌱 Seeding new hierarchy...');

        for (const parent of categories) {
            // Create Parent
            const parentDoc = await Category.create({
                name: parent.name,
                group: parent.group,
                slug: parent.slug,
                showInHeader: parent.showInHeader || false,
                showAsHot: parent.showAsHot || false,
                order: parent.order || 0,
                description: `Danh mục cha cho ${parent.name}`
            });
            console.log(`Created Parent: ${parentDoc.name}`);

            // Create Children
            if (parent.children && parent.children.length > 0) {
                for (const child of parent.children) {
                    await Category.create({
                        name: child.name,
                        group: parent.group, // Inherit group
                        slug: child.slug,
                        parent: parentDoc._id,
                        description: `Danh mục con của ${parentDoc.name}`
                    });
                    console.log(`  > Created Child: ${child.name}`);
                }
            }
        }

        console.log('✅ Seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedCategories();
