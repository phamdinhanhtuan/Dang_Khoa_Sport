const productRepository = require('../repositories/productRepository');
const cache = require('../utils/cache');

exports.createProduct = async (productData) => {
    // Clear cache when new product is added
    await cache.del('all_products');
    return await productRepository.create(productData);
};

exports.getAllProducts = async (queryString) => {
    // Basic caching strategy: cache the result based on queryString
    // Note: Complex query keys might get large, keeping it simple for now
    const cacheKey = `products_${JSON.stringify(queryString)}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const result = await productRepository.findAllAdvanced(queryString);

    // Cache for 1 hour
    await cache.set(cacheKey, JSON.stringify(result), 3600);

    return result;
};

exports.getProductById = async (id) => {
    const cacheKey = `product_${id}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const product = await productRepository.findByIdWithCategory(id);

    if (product) {
        await cache.set(cacheKey, JSON.stringify(product), 3600);
    }

    return product;
};

exports.updateProduct = async (id, updateData) => {
    // Invalidate caches
    await cache.del(`product_${id}`);
    await cache.del('all_products'); // Brute force clear for now

    return await productRepository.update(id, updateData);
};

exports.deleteProduct = async (id) => {
    // Invalidate caches
    await cache.del(`product_${id}`);
    await cache.del('all_products');

    return await productRepository.delete(id);
};

