const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['daily', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    topProducts: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        revenue: Number
    }],
    customerGrowth: {
        type: Number,
        default: 0
    },
    metalPriceTrends: {
        gold: Number,
        silver: Number,
        platinum: Number
    }
}, {
    timestamps: true
});

// Index for fast lookups by date and type
analyticsSchema.index({ date: -1, type: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
