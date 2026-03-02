const mongoose = require('mongoose');

const metalRateSchema = new mongoose.Schema(
    {
        metal: {
            type: String,
            required: [true, 'Metal type is required'],
            enum: ['gold', 'silver', 'platinum'],
            unique: true,
        },
        ratePerGram: {
            type: Number,
            required: [true, 'Rate per gram is required'],
            min: [0, 'Rate cannot be negative'],
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
    }
);

metalRateSchema.index({ metal: 1 });

module.exports = mongoose.model('MetalRate', metalRateSchema);
