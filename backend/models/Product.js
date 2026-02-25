const mongoose = require('mongoose');
const { PRODUCT_STATUS, MATERIALS, STONE_TYPES } = require('../config/constants');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        sku: {
            type: String,
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            enum: ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Bangle', 'Chain', 'Anklet', 'Mangalsutra', 'Other'],
        },
        material: {
            type: String,
            required: [true, 'Material is required'],
            enum: Object.values(MATERIALS),
        },
        weight: {
            type: Number,
            required: [true, 'Weight in grams is required'],
            min: [0.01, 'Weight must be greater than 0'],
        },
        purity: {
            type: Number,
            required: [true, 'Purity percentage is required'],
            min: [0, 'Purity cannot be negative'],
            max: [100, 'Purity cannot exceed 100'],
        },
        makingCharge: {
            type: Number,
            required: [true, 'Making charge is required'],
            min: [0, 'Making charge cannot be negative'],
        },
        stoneType: {
            type: String,
            enum: Object.values(STONE_TYPES),
            default: STONE_TYPES.NONE,
        },
        stoneWeight: {
            type: Number,
            default: 0,
            min: [0, 'Stone weight cannot be negative'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        images: [
            {
                type: String,
            },
        ],
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.ACTIVE,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
        createdBy: {
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

// NOTE: Price is NOT stored in the database.
// It is dynamically calculated using the latest metal and stone rates.

// Auto-generate SKU before saving
productSchema.pre('save', async function (next) {
    if (!this.sku) {
        const prefix = this.material.substring(0, 2).toUpperCase();
        const catPrefix = this.category.substring(0, 3).toUpperCase();
        const count = await mongoose.model('Product').countDocuments();
        this.sku = `${prefix}-${catPrefix}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Soft delete - exclude deleted products by default
productSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.where({ isDeleted: false });
    }
    next();
});

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ material: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
