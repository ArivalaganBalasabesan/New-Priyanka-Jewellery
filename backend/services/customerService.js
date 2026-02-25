const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');

class CustomerService {
    /**
     * Create a new customer
     */
    async createCustomer(customerData) {
        const existingCustomer = await Customer.findOne({ phone: customerData.phone });
        if (existingCustomer) {
            throw ApiError.conflict('Customer with this phone number already exists');
        }

        const customer = await Customer.create(customerData);
        return customer;
    }

    /**
     * Get all customers
     */
    async getAllCustomers(query = {}) {
        const { page = 1, limit = 20, search, isActive } = query;
        const filter = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const customers = await Customer.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Customer.countDocuments(filter);

        return {
            customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single customer
     */
    async getCustomerById(customerId) {
        const customer = await Customer.findById(customerId)
            .populate('purchaseHistory');

        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        return customer;
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, updateData) {
        const customer = await Customer.findByIdAndUpdate(customerId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        return customer;
    }

    /**
     * Deactivate customer
     */
    async deactivateCustomer(customerId) {
        const customer = await Customer.findByIdAndUpdate(
            customerId,
            { isActive: false },
            { new: true }
        );

        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        return customer;
    }

    /**
     * Activate customer
     */
    async activateCustomer(customerId) {
        const customer = await Customer.findByIdAndUpdate(
            customerId,
            { isActive: true },
            { new: true }
        );

        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        return customer;
    }

    /**
     * Add loyalty points
     */
    async addLoyaltyPoints(customerId, points) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        customer.loyaltyPoints += points;
        await customer.save();

        return customer;
    }

    /**
     * Add sale to purchase history
     */
    async addToPurchaseHistory(customerId, saleId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        customer.purchaseHistory.push(saleId);
        await customer.save();

        return customer;
    }
}

module.exports = new CustomerService();
