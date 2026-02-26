const Order = require('../models/Order');
const Customer = require('../models/Customer');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class OrderService {
    /**
     * Create a custom order
     */
    async createOrder(orderData, userId) {
        const customer = await Customer.findById(orderData.customerId);
        if (!customer) {
            throw ApiError.notFound('Customer not found');
        }

        const order = await Order.create({
            ...orderData,
            createdBy: userId,
        });

        return order;
    }

    /**
     * Get all orders for the cust
     */
    async getAllOrders(query = {}) {
        const { page = 1, limit = 20, status, customerId } = query;
        const filter = { isCancelled: false };

        if (status) filter.status = status;
        if (customerId) filter.customerId = customerId;
        if (query.hasDesignImage === 'true') {
            filter.designImageUrl = { $ne: null, $exists: true, $ne: '' };
        }

        const orders = await Order.find(filter)
            .populate('customerId', 'name phone')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);

        return {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single order
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('customerId', 'name phone address email')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name');

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        return order;
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        const validTransitions = {
            'Pending': ['In Progress', 'Cancelled'],
            'In Progress': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': [],
        };

        const order = await Order.findById(orderId);
        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (!validTransitions[order.status]?.includes(status)) {
            throw ApiError.badRequest(
                `Cannot transition from '${order.status}' to '${status}'`
            );
        }

        order.status = status;
        if (status === 'Completed') {
            order.completedDate = new Date();
        }
        await order.save();

        return order;
    }

    /**
     * Update order details
     */
    async updateOrder(orderId, updateData) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (order.status === 'Completed' || order.isCancelled) {
            throw ApiError.badRequest('Cannot update a completed or cancelled order');
        }

        const allowedFields = [
            'designDetails', 'material', 'category', 'estimatedWeight',
            'estimatedPrice', 'advancePayment', 'deliveryDate',
            'specialInstructions', 'assignedTo', 'isAdminSeen'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                order[field] = updateData[field];
            }
        }

        await order.save();
        return order;
    }

    /**
     * Mark order as seen by admin
     */
    async markAsSeen(orderId) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { isAdminSeen: true },
            { new: true }
        );
        if (!order) {
            throw ApiError.notFound('Order not found');
        }
        return order;
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, reason) {
        const order = await Order.findById(orderId);

        if (!order) {
            throw ApiError.notFound('Order not found');
        }

        if (order.status === 'Completed') {
            throw ApiError.badRequest('Cannot cancel a completed order');
        }

        if (order.isCancelled) {
            throw ApiError.badRequest('Order is already cancelled');
        }

        order.isCancelled = true;
        order.status = 'Cancelled';
        order.cancellationReason = reason || 'Cancelled by user';
        await order.save();

        return order;
    }

    /**
     * Get orders for specific user
     */
    async getMyOrders(userId) {
        // Find orders created by user OR linked to their customer profile
        const customer = await Customer.findOne({ userId });
        const filter = customer
            ? { $or: [{ createdBy: userId }, { customerId: customer._id }] }
            : { createdBy: userId };

        return await Order.find(filter)
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
    }

    /**
     * Request a quote from a design (customer-facing)
     * Auto-creates a Customer record if the user doesn't have one
     */
    async requestQuote(userId, quoteData) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Find or create Customer record for this user
        let customer = await Customer.findOne({ userId: user._id });
        if (!customer) {
            customer = await Customer.create({
                name: user.name,
                email: user.email,
                phone: user.phone || undefined,
                userId: user._id,
            });
        }

        // Map design metal types to order material enum
        const materialMap = {
            'Gold': 'gold',
            'Silver': 'silver',
            'Platinum': 'platinum',
        };
        const material = materialMap[quoteData.metalType] || 'gold';

        // Build design description
        const designDetails = [
            `${quoteData.jewelryType} - ${quoteData.metalType} with ${quoteData.stoneType}`,
            quoteData.prompt ? `Style: ${quoteData.prompt}` : '',
            quoteData.specialInstructions ? `Notes: ${quoteData.specialInstructions}` : '',
        ].filter(Boolean).join('\n');

        // Set default delivery date to 14 days from now
        const deliveryDate = quoteData.preferredDate
            ? new Date(quoteData.preferredDate)
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        const order = await Order.create({
            customerId: customer._id,
            designDetails,
            material,
            category: quoteData.jewelryType || 'Ring',
            estimatedPrice: quoteData.estimatedPrice || 0, // Allow passing price for direct checkout
            deliveryDate,
            specialInstructions: quoteData.specialInstructions || '',
            designImageUrl: quoteData.designImageUrl || '',
            createdBy: userId,
            status: 'Pending',
        });

        return order;
    }
}

module.exports = new OrderService();
