const productService = require('../services/productService');
const categoryService = require('../services/categoryService');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProductsAdmin(req.query);
        const categories = await categoryService.getCategoriesSorted();

        res.render('admin/products', {
            title: 'Manage Products',
            products,
            categories,
            searchQuery: req.query.q || '',
            currentCategory: req.query.category || '',
            path: '/admin/products'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.getNewProductForm = async (req, res) => {
    try {
        const categories = await categoryService.getCategoriesSorted();
        res.render('admin/product-form', {
            title: 'New Product',
            product: {},
            categories,
            path: '/admin/products'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        // Sanitize numeric fields
        if (productData.discountPrice === '') productData.discountPrice = null;

        // Handle Main Image Upload (using upload.fields, so check req.files['image'])
        if (req.files && req.files['image']) {
            productData.image = '/images/products/' + req.files['image'][0].filename;
        } else if (req.body.imageUrl) {
            productData.image = req.body.imageUrl;
        }

        // Handle Gallery Images (URL + File Uploads)
        productData.images = [];
        // 1. URLs from text area
        if (req.body.imagesUrl) {
            const urls = req.body.imagesUrl.split(',').map(url => url.trim()).filter(url => url);
            productData.images.push(...urls);
        }
        // 2. Files from upload
        if (req.files && req.files['galleryImages']) {
            const uploadedUrls = req.files['galleryImages'].map(file => '/images/products/' + file.filename);
            productData.images.push(...uploadedUrls);
        }

        await productService.createProduct(productData);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products/new');
    }
};

exports.getEditProductForm = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        const categories = await categoryService.getCategoriesSorted();

        if (!product) return res.redirect('/admin/products');

        res.render('admin/product-form', {
            title: 'Edit Product',
            product,
            categories,
            path: '/admin/products'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        // Sanitize numeric fields
        if (productData.discountPrice === '') productData.discountPrice = null;

        // Handle Main Image Upload (using upload.fields)
        if (req.files && req.files['image']) {
            productData.image = '/images/products/' + req.files['image'][0].filename;
        } else if (req.body.imageUrl) {
            productData.image = req.body.imageUrl;
        }

        // Handle Gallery Images
        productData.images = [];

        // 1. Existing images (from hidden field)
        if (req.body.existingImages) {
            const existing = req.body.existingImages.split(',').map(url => url.trim()).filter(url => url);
            productData.images.push(...existing);
        }

        // 2. New uploads
        if (req.files && req.files['galleryImages']) {
            const uploadedUrls = req.files['galleryImages'].map(file => '/images/products/' + file.filename);
            productData.images.push(...uploadedUrls);
        }

        await productService.updateProduct(req.params.id, productData);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect(`/admin/products/${req.params.id}/edit`);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};
