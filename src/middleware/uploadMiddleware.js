const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use path.join to ensure correct path regardless of CWD
        // Assuming 'public' is in the project root
        cb(null, path.join(__dirname, '../../public/images/products'));
    },
    filename: function (req, file, cb) {
        // Generate unique filename: product-timestamp-random.ext
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `product-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// Check file type
const fileFilter = (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new AppError('Images Only! (jpeg, jpg, png, webp, gif)', 400), false);
    }
};

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
