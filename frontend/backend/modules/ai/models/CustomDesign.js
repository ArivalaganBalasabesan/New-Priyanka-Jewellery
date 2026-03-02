const mongoose = require('mongoose');

const customDesignSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    generatedImageURL: { type: String, required: true },
    jewelryType: { type: String, required: true },
    metalType: { type: String, required: true },
    stoneType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomDesign', customDesignSchema);
