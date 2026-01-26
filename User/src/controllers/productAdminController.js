const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.render('admin/products', { title: 'Product Management', products });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.getNewProduct = (req, res) => {
    res.render('admin/product-form', { title: 'Add Product', product: {}, action: 'create' });
};

exports.createProduct = async (req, res) => {
    try {
        await Product.create(req.body);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.render('admin/product-form', {
            title: 'Add Product',
            product: req.body,
            action: 'create',
            error: err.message
        });
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin/product-form', { title: 'Edit Product', product, action: 'edit' });
    } catch (err) {
        res.redirect('/admin/products');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin/products');
    } catch (err) {
        res.redirect('/admin/products');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        res.redirect('/admin/products');
    }
};
