class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return await this.model.create(data);
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findOne(filter) {
        return await this.model.findOne(filter);
    }

    async findAll(filter = {}, sort = '-createdAt', limit = null, skip = 0) {
        let query = this.model.find(filter).sort(sort).skip(skip);
        if (limit) query = query.limit(limit);
        return await query;
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }
}

module.exports = BaseRepository;
