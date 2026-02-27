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
    group: {
        type: String,
        enum: ['team-sports', 'racket-individual', 'billiards-accessories', 'brands', 'other', 'sale', 'featured'],
        default: 'other'
    },
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    showInHeader: {
        type: Boolean,
        default: false
    },
    showAsHot: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

categorySchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true });
    }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
