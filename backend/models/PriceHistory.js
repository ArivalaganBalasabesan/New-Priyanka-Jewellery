const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['metal', 'stone'],
        },
        name: {
            type: String,
            required: true, // e.g., 'gold', 'silver', 'diamond'
        },
        rate: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            default: 'LKR',
        },
        source: {
            type: String,
            enum: ['api', 'manual'],
            default: 'api',
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by type and date
priceHistorySchema.index({ type: 1, name: 1, recordedAt: -1 });
priceHistorySchema.index({ recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
