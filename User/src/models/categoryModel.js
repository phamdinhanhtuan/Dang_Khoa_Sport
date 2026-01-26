const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    }
});

categorySchema.pre('save', async function () {
    this.slug = slugify(this.name, { lower: true });
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
