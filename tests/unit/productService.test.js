const productService = require('../../src/services/productService');
const productRepository = require('../../src/repositories/productRepository');
const cache = require('../../src/utils/cache');

// Mock dependencies
jest.mock('../../src/repositories/productRepository');
jest.mock('../../src/utils/cache');

describe('Product Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return products from cache if available', async () => {
            // Arrange
            const mockQuery = { page: 1 };
            const mockCachedData = { products: [{ id: 1, name: 'Cached Product' }], total: 1 };
            cache.get.mockResolvedValue(JSON.stringify(mockCachedData));

            // Act
            const result = await productService.getAllProducts(mockQuery);

            // Assert
            expect(cache.get).toHaveBeenCalled();
            expect(productRepository.findAllAdvanced).not.toHaveBeenCalled();
            expect(result).toEqual(mockCachedData);
        });

        it('should fetch from repository if cache is empty', async () => {
            // Arrange
            const mockQuery = { page: 1 };
            const mockRepoData = { products: [{ id: 2, name: 'Repo Product' }], total: 1 };

            cache.get.mockResolvedValue(null);
            productRepository.findAllAdvanced.mockResolvedValue(mockRepoData);

            // Act
            const result = await productService.getAllProducts(mockQuery);

            // Assert
            expect(cache.get).toHaveBeenCalled();
            expect(productRepository.findAllAdvanced).toHaveBeenCalledWith(mockQuery);
            expect(cache.set).toHaveBeenCalled();
            expect(result).toEqual(mockRepoData);
        });
    });

    describe('createProduct', () => {
        it('should create product and invalidate cache', async () => {
            // Arrange
            const mockProductData = { name: 'New Product' };
            const mockCreatedProduct = { id: 1, ...mockProductData };

            productRepository.create.mockResolvedValue(mockCreatedProduct);

            // Act
            const result = await productService.createProduct(mockProductData);

            // Assert
            expect(cache.del).toHaveBeenCalledWith('all_products');
            expect(productRepository.create).toHaveBeenCalledWith(mockProductData);
            expect(result).toEqual(mockCreatedProduct);
        });
    });
});
