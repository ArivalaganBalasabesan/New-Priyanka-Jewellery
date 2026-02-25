const mongoose = require('mongoose');

const stoneRateSchema = new mongoose.Schema(
    {
        stoneType: {
            type: String,
            required: [true, 'Stone type is required'],
            enum: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'none'],
            unique: true,
        },
        ratePerCarat: {
            type: Number,
            required: [true, 'Rate per carat is required'],
            min: [0, 'Rate cannot be negative'],
        },
        unit: {
            type: String,
            default: 'INR',
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

stoneRateSchema.index({ stoneType: 1 });

module.exports = mongoose.model('StoneRate', stoneRateSchema);
