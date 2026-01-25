const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product'); // Ensure path is correct

dotenv.config();

const fixImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        const products = await Product.find();
        console.log(`Found ${products.length} products`);

        const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop';

        for (const p of products) {
            // Check if images are broken (simple heuristic: if it contains 'static.nike' or empty)
            if (!p.images || p.images.length === 0 || (p.images[0] && p.images[0].includes('static.nike')) || (p.images[0] && p.images[0].includes('assets.adidas'))) {
                p.images = [defaultImage];
                await p.save();
                console.log(`Updated images for ${p.name}`);
            }
        }

        console.log('Done');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixImages();
