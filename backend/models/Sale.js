const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const saleItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    metalRate: {
        type: Number,
        required: true,
    },
    stoneRate: {
        type: Number,
        default: 0,
    },
    itemTotal: {
        type: Number,
        required: true,
    },
});

const saleSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            unique: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required'],
        },
        items: {
            type: [saleItemSchema],
            validate: {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'At least one item is required for a sale',
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'fixed',
        },
        taxRate: {
            type: Number,
            default: 3, // 3% GST for jewelry
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi', 'bank_transfer', 'mixed'],
            default: 'cash',
        },
        saleDate: {
            type: Date,
            default: Date.now,
        },
        isCancelled: {
            type: Boolean,
            default: false,
        },
        cancelledAt: {
            type: Date,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        cancellationReason: {
            type: String,
        },
        soldBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate invoice number
saleSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const prefix = `NPJ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = await mongoose.model('Sale').countDocuments();
        this.invoiceNumber = `${prefix}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});


// Indexes
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ customerId: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ soldBy: 1 });

module.exports = mongoose.model('Sale', saleSchema);
