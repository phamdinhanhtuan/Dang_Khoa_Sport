const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' }); // Adjust path if needed

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        const adminEmail = 'admin@dangkhoasport.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
            existingAdmin.role = 'admin';
            existingAdmin.password = 'admin123'; // Reset password to ensure we know it
            await existingAdmin.save();
            console.log('Admin updated: admin@dangkhoasport.com / admin123');
        } else {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin created: admin@dangkhoasport.com / admin123');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
