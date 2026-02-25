const mongoose = require('mongoose');
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

const inventorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
            unique: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: LOW_STOCK_THRESHOLD,
            min: [0, 'Threshold cannot be negative'],
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: Check if stock is low
inventorySchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.lowStockThreshold;
});

// Index
inventorySchema.index({ productId: 1 });
inventorySchema.index({ quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
