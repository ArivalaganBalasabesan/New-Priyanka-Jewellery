const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class InventoryService {
    /**
     * Get all inventory with product details
     */
    async getAllInventory(query = {}) {
        const { page = 1, limit = 20, lowStock } = query;
        const filter = {};

        const inventory = await Inventory.find(filter)
            .populate({
                path: 'productId',
                select: 'name sku category material weight status',
            })
            .populate('updatedBy', 'name')
            .sort({ lastUpdated: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        let result = inventory;

        // Filter low stock items
        if (lowStock === 'true') {
            result = inventory.filter((item) => item.isLowStock);
        }

        const total = await Inventory.countDocuments(filter);

        return {
            inventory: result,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get inventory by product ID
     */
    async getInventoryByProductId(productId) {
        const inventory = await Inventory.findOne({ productId })
            .populate('productId', 'name sku category material')
            .populate('updatedBy', 'name');

        if (!inventory) {
            throw ApiError.notFound('Inventory record not found for this product');
        }

        return inventory;
    }

    /**
     * Add stock
     */
    async addStock(productId, quantity, userId) {
        const product = await Product.findById(productId);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }

        let inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            inventory = await Inventory.create({
                productId,
                quantity,
                updatedBy: userId,
                lastUpdated: new Date(),
            });
        } else {
            inventory.quantity += quantity;
            inventory.updatedBy = userId;
            inventory.lastUpdated = new Date();
            await inventory.save();
        }

        return inventory;
    }

    /**
     * Update stock (set exact quantity)
     */
    async updateStock(productId, quantity, userId) {
        const inventory = await Inventory.findOneAndUpdate(
            { productId },
            {
                quantity,
                updatedBy: userId,
                lastUpdated: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!inventory) {
            throw ApiError.notFound('Inventory record not found');
        }

        return inventory;
    }

    /**
     * Reduce stock (used during sales)
     */
    async reduceStock(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (!inventory) {
            throw ApiError.notFound('Inventory record not found');
        }

        if (inventory.quantity < quantity) {
            throw ApiError.badRequest(
                `Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`
            );
        }

        inventory.quantity -= quantity;
        inventory.lastUpdated = new Date();
        await inventory.save();

        return inventory;
    }

    /**
     * Restore stock (used when sale is cancelled)
     */
    async restoreStock(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });

        if (inventory) {
            inventory.quantity += quantity;
            inventory.lastUpdated = new Date();
            await inventory.save();
        }

        return inventory;
    }

    /**
     * Remove inventory entry
     */
    async removeInventory(inventoryId) {
        const inventory = await Inventory.findByIdAndDelete(inventoryId);
        if (!inventory) {
            throw ApiError.notFound('Inventory record not found');
        }
        return inventory;
    }

    /**
     * Get low stock alerts
     */
    async getLowStockAlerts() {
        const allInventory = await Inventory.find()
            .populate('productId', 'name sku category material status');

        const lowStockItems = allInventory.filter((item) => item.isLowStock && item.productId);

        return lowStockItems;
    }

    /**
     * Update threshold for a product
     */
    async updateThreshold(productId, threshold, userId) {
        const inventory = await Inventory.findOneAndUpdate(
            { productId },
            {
                lowStockThreshold: threshold,
                updatedBy: userId,
            },
            { new: true }
        );

        if (!inventory) {
            throw ApiError.notFound('Inventory record not found');
        }

        return inventory;
    }
}

module.exports = new InventoryService();
