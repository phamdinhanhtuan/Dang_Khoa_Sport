const User = require('../models/User');
const AppError = require('../utils/appError');

class UserService {
    // 1. Toggle Wishlist Item
    async toggleWishlist(userId, productId) {
        let user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const productIndex = user.wishlist.indexOf(productId);
        let action;

        if (productIndex === -1) {
            user.wishlist.push(productId);
            action = 'added';
        } else {
            user.wishlist.splice(productIndex, 1);
            action = 'removed';
        }

        await user.save({ validateBeforeSave: false });

        return {
            action,
            wishlist: user.wishlist
        };
    }

    // 2. Get User Wishlist
    async getWishlist(userId) {
        const user = await User.findById(userId).populate('wishlist');
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user.wishlist;
    }

    // 3. Admin: Get All Users
    async getAllUsers() {
        return await User.find().sort({ createdAt: -1 });
    }

    // 4. Admin: Delete User
    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }
    // 5. Admin: Count Users
    async countUsers() {
        return await User.countDocuments();
    }
}

module.exports = new UserService();
