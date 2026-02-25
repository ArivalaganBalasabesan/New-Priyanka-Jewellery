const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        phone: {
            type: String,
            // required: [true, 'Phone number is required'], // Made optional for Google Auth Users
            sparse: true, // Allow multiple nulls/unique constraint handling
            trim: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
            min: [0, 'Loyalty points cannot be negative'],
        },
        purchaseHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sale',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
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

// Indexes
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
