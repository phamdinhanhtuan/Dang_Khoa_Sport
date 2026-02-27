const User = require('../models/User');

class UserRepository {
    async findById(id) {
        return await User.findById(id);
    }

    async findOne(filter) {
        return await User.findOne(filter);
    }

    async count(filter = {}) {
        return await User.countDocuments(filter);
    }

    async create(data) {
        return await User.create(data);
    }

    async deleteOne(filter) {
        return await User.deleteOne(filter);
    }
}

module.exports = new UserRepository();
