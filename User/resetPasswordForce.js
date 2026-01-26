const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPass = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dang-khoa-sport');
        console.log('Connected to DB');

        const email = 'john@example.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Updating password...');
            user.password = 'password123';
            await user.save();
            console.log('Password updated specifically to: password123');
        } else {
            console.log('User not found. Creating...');
            user = await User.create({
                name: 'John Doe',
                email: email,
                password: 'password123',
                role: 'user'
            });
            console.log('User created with password: password123');
        }

        // Verify
        const verifyUser = await User.findOne({ email }).select('+password');
        const match = await verifyUser.correctPassword('password123', verifyUser.password);
        console.log('Verification match:', match);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

resetPass();
