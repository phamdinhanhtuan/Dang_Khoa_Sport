const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dang-khoa-sport');
        const user = await User.findOne({ email: 'john@example.com' }).select('+password');
        console.log('User found:', user);
        if (user) {
            const isMatch = await user.correctPassword('password123', user.password);
            console.log('Password match:', isMatch);

            if (!isMatch) {
                // Reset if not match
                user.password = 'password123';
                await user.save();
                console.log('Password reset to password123');
            }
        } else {
            console.log('Creating John Doe user...');
            await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user'
            });
            console.log('User created');
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

check();
