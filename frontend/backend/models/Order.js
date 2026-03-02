const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required'],
        },
        designDetails: {
            type: String,
            required: [true, 'Design details are required'],
            trim: true,
        },
        material: {
            type: String,
            enum: ['gold', 'silver', 'platinum'],
            required: [true, 'Material is required'],
        },
        category: {
            type: String,
            trim: true,
        },
        estimatedWeight: {
            type: Number,
            min: [0, 'Weight cannot be negative'],
        },
        estimatedPrice: {
            type: Number,
            required: [true, 'Estimated price is required'],
            min: [0, 'Price cannot be negative'],
        },
        advancePayment: {
            type: Number,
            default: 0,
            min: [0, 'Advance payment cannot be negative'],
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
        },
        deliveryDate: {
            type: Date,
            required: [true, 'Delivery date is required'],
        },
        completedDate: {
            type: Date,
        },
        specialInstructions: {
            type: String,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isCancelled: {
            type: Boolean,
            default: false,
        },
        cancellationReason: {
            type: String,
        },
        designImageUrl: {
            type: String,
        },
        isAdminSeen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryDate: 1 });

module.exports = mongoose.model('Order', orderSchema);
