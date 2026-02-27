const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ]
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    // this.password = await bcrypt.hash(this.password, 12);
    // TEMPORARY: NO HASH FOR DEBUG
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // return await bcrypt.compare(candidatePassword, userPassword);
    return candidatePassword === userPassword; // DBG: Simple compare
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
