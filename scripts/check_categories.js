const mongoose = require('mongoose');
const Category = require('../src/models/categoryModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dang-khoa-sport');
        console.log('Connected to DB');

        const groups = ['team-sports', 'racket-individual', 'billiards-accessories'];

        for (const g of groups) {
            const count = await Category.countDocuments({ group: g });
            console.log(`Group [${g}]: ${count} categories`);
            if (count > 0) {
                const cats = await Category.find({ group: g }).limit(3);
                cats.forEach(c => console.log(` - ${c.name} (${c.parent ? 'Child' : 'Parent'})`));
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkCategories();
