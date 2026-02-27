const mongoose = require('mongoose');
const Category = require('../src/models/categoryModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dang-khoa-sport');
        console.log('Connected to DB');

        // Define Categories
        const categories = [
            // GROUP: Team Sports
            { name: 'Bóng Đá', group: 'team-sports', parent: null },
            { name: 'Bóng Chuyền', group: 'team-sports', parent: null },
            { name: 'Bóng Rổ', group: 'team-sports', parent: null },

            // GROUP: Racket & Individual
            { name: 'Pickleball', group: 'racket-individual', parent: null },
            { name: 'Cầu Lông', group: 'racket-individual', parent: null },
            { name: 'Tennis', group: 'racket-individual', parent: null },
            { name: 'Chạy Bộ', group: 'racket-individual', parent: null },

            // GROUP: Billiards & Accessories
            { name: 'Bi-a', group: 'billiards-accessories', parent: null },
            { name: 'Phụ Kiện', group: 'billiards-accessories', parent: null },

            // Children Example
            // (We need parents first to get IDs, but for simplicity in this script we assume names are unique and fetch them)
        ];

        for (const catData of categories) {
            const exists = await Category.findOne({ name: catData.name });
            if (!exists) {
                await Category.create(catData);
                console.log(`Created: ${catData.name}`);
            } else {
                // Update group if it's 'other' (legacy data)
                if (exists.group === 'other') {
                    exists.group = catData.group;
                    await exists.save();
                    console.log(`Updated group for: ${catData.name}`);
                }
            }
        }

        // Add some children
        const pickleball = await Category.findOne({ name: 'Pickleball' });
        if (pickleball) {
            const kids = ['Vợt Pickleball', 'Bóng Pickleball', 'Giày Pickleball'];
            for (const kid of kids) {
                const exists = await Category.findOne({ name: kid });
                if (!exists) {
                    await Category.create({ name: kid, parent: pickleball._id, group: 'racket-individual' });
                    console.log(`Created Child: ${kid}`);
                }
            }
        }

        console.log('Seeding completed!');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

seedCategories();
