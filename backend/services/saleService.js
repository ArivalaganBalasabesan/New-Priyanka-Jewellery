const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const priceService = require('./priceService');
const inventoryService = require('./inventoryService');
const customerService = require('./customerService');
const ApiError = require('../utils/ApiError');
const { DEFAULT_TAX_RATE } = require('../config/constants');

class SaleService {
    /**
     * Create a new sale
     */
    async createSale(saleData, userId) {
        const { customerId, items, discount = 0, discountType = 'fixed', taxRate = DEFAULT_TAX_RATE, paymentStatus, paymentMethod, notes } = saleData;

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        // Process each item: fetch product, calculate dynamic price, check stock
        const processedItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw ApiError.notFound(`Product not found: ${item.productId}`);
            }

            if (product.status !== 'active') {
                throw ApiError.badRequest(`Product "${product.name}" is not available for sale`);
            }

            // Check stock
            const inventory = await inventoryService.getInventoryByProductId(item.productId);
            if (inventory.quantity < item.quantity) {
                throw ApiError.badRequest(
                    `Insufficient stock for "${product.name}". Available: ${inventory.quantity}`
                );
            }

            // Dynamic price calculation
            const pricing = await priceService.calculateProductPrice(product);
            const itemTotal = pricing.finalPrice * item.quantity;

            processedItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: pricing.finalPrice,
                metalRate: pricing.metalRate,
                stoneRate: pricing.stoneRate,
                itemTotal,
            });

            subtotal += itemTotal;
        }

        // Calculate discount
        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = (subtotal * discount) / 100;
        } else {
            discountAmount = discount;
        }

        const afterDiscount = subtotal - discountAmount;

        // Calculate tax
        const taxAmount = (afterDiscount * taxRate) / 100;
        const totalAmount = subtotal;
        const finalAmount = afterDiscount + taxAmount;

        // Create sale
        const sale = await Sale.create({
            customerId,
            items: processedItems,
            subtotal,
            discount: discountAmount,
            discountType,
            taxRate,
            taxAmount: Math.round(taxAmount * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            finalAmount: Math.round(finalAmount * 100) / 100,
            paymentStatus: paymentStatus || 'pending',
            paymentMethod: paymentMethod || 'cash',
            soldBy: userId,
            notes,
        });

        // Reduce stock for each item
        for (const item of processedItems) {
            await inventoryService.reduceStock(item.productId, item.quantity);
        }

        // Add to customer purchase history
        await customerService.addToPurchaseHistory(customerId, sale._id);

        // Add loyalty points (1 point per 1000 INR spent)
        const loyaltyPoints = Math.floor(finalAmount / 1000);
        if (loyaltyPoints > 0) {
            await customerService.addLoyaltyPoints(customerId, loyaltyPoints);
        }

        return sale;
    }

    /**
     * Get all sales
     */
    async getAllSales(query = {}) {
        const {
            page = 1,
            limit = 20,
            paymentStatus,
            startDate,
            endDate,
            customerId,
        } = query;

        const filter = { isCancelled: false };
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (customerId) filter.customerId = customerId;
        if (startDate || endDate) {
            filter.saleDate = {};
            if (startDate) filter.saleDate.$gte = new Date(startDate);
            if (endDate) filter.saleDate.$lte = new Date(endDate);
        }

        const sales = await Sale.find(filter)
            .populate('customerId', 'name phone')
            .populate('soldBy', 'name')
            .sort({ saleDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Sale.countDocuments(filter);

        return {
            sales,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single sale (Invoice)
     */
    async getSaleById(saleId) {
        const sale = await Sale.findById(saleId)
            .populate('customerId', 'name phone address email')
            .populate('soldBy', 'name')
            .populate('cancelledBy', 'name');

        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        return sale;
    }

    /**
     * Cancel sale (Admin only)
     */
    async cancelSale(saleId, userId, reason) {
        const sale = await Sale.findById(saleId);

        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        if (sale.isCancelled) {
            throw ApiError.badRequest('Sale is already cancelled');
        }

        // Restore stock for each item
        for (const item of sale.items) {
            await inventoryService.restoreStock(item.productId, item.quantity);
        }

        sale.isCancelled = true;
        sale.cancelledAt = new Date();
        sale.cancelledBy = userId;
        sale.cancellationReason = reason || 'Cancelled by admin';
        sale.paymentStatus = 'refunded';
        await sale.save();

        return sale;
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(saleId, paymentStatus) {
        const sale = await Sale.findByIdAndUpdate(
            saleId,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        return sale;
    }

    /**
     * Get daily sales summary
     */
    async getDailySales(date) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const sales = await Sale.find({
            saleDate: { $gte: startOfDay, $lte: endOfDay },
            isCancelled: false,
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
        const totalTransactions = sales.length;

        return {
            date: startOfDay,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalTransactions,
            sales,
        };
    }
}

module.exports = new SaleService();
