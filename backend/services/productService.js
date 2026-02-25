const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const priceService = require('./priceService');
const ApiError = require('../utils/ApiError');

class ProductService {
    /**
     * Create a new product
     */
    async createProduct(productData, userId) {
        productData.createdBy = userId;
        const product = await Product.create(productData);

        // Auto-create inventory entry with 0 stock
        await Inventory.create({
            productId: product._id,
            quantity: 0,
            updatedBy: userId,
        });

        // Calculate dynamic price
        const pricing = await priceService.calculateProductPrice(product);

        return { ...product.toObject(), pricing };
    }

    /**
     * Get all products with dynamic pricing
     */
    async getAllProducts(query = {}) {
        const {
            page = 1,
            limit = 20,
            category,
            material,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const filter = {};
        if (category) filter.category = category;
        if (material) filter.material = material;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(filter)
            .populate('createdBy', 'name')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Dynamically calculate prices for each product
        const productsWithPrices = await Promise.all(
            products.map(async (product) => {
                const pricing = await priceService.calculateProductPrice(product);
                return { ...product.toObject(), pricing };
            })
        );

        const total = await Product.countDocuments(filter);

        return {
            products: productsWithPrices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single product with dynamic price
     */
    async getProductById(productId) {
        const product = await Product.findById(productId).populate('createdBy', 'name');

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        const pricing = await priceService.calculateProductPrice(product);
        const inventory = await Inventory.findOne({ productId: product._id });

        return {
            ...product.toObject(),
            pricing,
            inventory: inventory ? { quantity: inventory.quantity, isLowStock: inventory.isLowStock } : null,
        };
    }

    /**
     * Update product
     */
    async updateProduct(productId, updateData) {
        const product = await Product.findByIdAndUpdate(productId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        const pricing = await priceService.calculateProductPrice(product);

        return { ...product.toObject(), pricing };
    }

    /**
     * Soft delete product
     */
    async softDeleteProduct(productId) {
        const product = await Product.findByIdAndUpdate(
            productId,
            { isDeleted: true, deletedAt: new Date(), status: 'inactive' },
            { new: true }
        );

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        return product;
    }

    /**
     * Restore soft deleted product
     */
    async restoreProduct(productId) {
        const product = await Product.findOneAndUpdate(
            { _id: productId, includeDeleted: true },
            { isDeleted: false, deletedAt: null, status: 'active' },
            { new: true }
        );

        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        return product;
    }
}

module.exports = new ProductService();
