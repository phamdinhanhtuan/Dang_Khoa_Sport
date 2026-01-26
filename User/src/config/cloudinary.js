const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

let storage;

if (process.env.NODE_ENV === 'test') {
    // Use memory storage for testing to avoid external calls
    storage = multer.memoryStorage();
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
        api_key: process.env.CLOUDINARY_API_KEY || '123456789',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'dang-khoa-sport',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        },
    });
}

module.exports = multer({ storage: storage });
