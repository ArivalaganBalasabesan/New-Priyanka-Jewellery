const MetalRate = require('../models/MetalRate');
const StoneRate = require('../models/StoneRate');
const PriceHistory = require('../models/PriceHistory');
const ApiError = require('../utils/ApiError');
const { DEFAULT_METAL_RATES, DEFAULT_STONE_RATES } = require('../config/constants');

class PriceService {
    /**
     * Get current metal rate
     */
    async getMetalRate(metal) {
        const rate = await MetalRate.findOne({ metal });
        if (!rate) {
            // Return default rate if not found
            return {
                metal,
                ratePerGram: DEFAULT_METAL_RATES[metal] || 0,
                source: 'default',
            };
        }
        return rate;
    }

    /**
     * Get all metal rates
     */
    async getAllMetalRates() {
        const rates = await MetalRate.find().sort({ metal: 1 });
        return rates;
    }

    /**
     * Get current stone rate
     */
    async getStoneRate(stoneType) {
        if (stoneType === 'none') return { stoneType: 'none', ratePerCarat: 0 };

        const rate = await StoneRate.findOne({ stoneType });
        if (!rate) {
            return {
                stoneType,
                ratePerCarat: DEFAULT_STONE_RATES[stoneType] || 0,
                source: 'default',
            };
        }
        return rate;
    }

    /**
     * Get all stone rates
     */
    async getAllStoneRates() {
        const rates = await StoneRate.find().sort({ stoneType: 1 });
        return rates;
    }

    /**
     * Update metal rate (manual override by admin)
     */
    async updateMetalRate(metal, ratePerGram, userId) {
        const rate = await MetalRate.findOneAndUpdate(
            { metal },
            {
                ratePerGram,
                source: 'manual',
                lastUpdated: new Date(),
                updatedBy: userId,
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Log to price history
        await PriceHistory.create({
            type: 'metal',
            name: metal,
            rate: ratePerGram,
            source: 'manual',
            recordedAt: new Date(),
        });

        return rate;
    }

    /**
     * Update stone rate (manual override by admin)
     */
    async updateStoneRate(stoneType, ratePerCarat, userId) {
        const rate = await StoneRate.findOneAndUpdate(
            { stoneType },
            {
                ratePerCarat,
                source: 'manual',
                lastUpdated: new Date(),
                updatedBy: userId,
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Log to price history
        await PriceHistory.create({
            type: 'stone',
            name: stoneType,
            rate: ratePerCarat,
            source: 'manual',
            recordedAt: new Date(),
        });

        return rate;
    }

    /**
     * Calculate product price dynamically
     * 
     * Formula:
     * MetalPrice = weight × metalRate × (purity / 100)
     * StonePrice = stoneWeight × stoneRate
     * FinalPrice = MetalPrice + StonePrice + makingCharge
     */
    async calculateProductPrice(product) {
        const metalRateDoc = await this.getMetalRate(product.material);
        const stoneRateDoc = await this.getStoneRate(product.stoneType || 'none');

        const metalRate = metalRateDoc.ratePerGram;
        const stoneRate = stoneRateDoc.ratePerCarat;

        const metalPrice = product.weight * metalRate * (product.purity / 100);
        const stonePrice = (product.stoneWeight || 0) * stoneRate;
        const finalPrice = metalPrice + stonePrice + product.makingCharge;

        return {
            metalRate,
            stoneRate,
            metalPrice: Math.round(metalPrice * 100) / 100,
            stonePrice: Math.round(stonePrice * 100) / 100,
            makingCharge: product.makingCharge,
            finalPrice: Math.round(finalPrice * 100) / 100,
        };
    }

    /**
     * Get price history
     */
    async getPriceHistory(query = {}) {
        const { type, name, page = 1, limit = 50 } = query;
        const filter = {};

        if (type) filter.type = type;
        if (name) filter.name = name;

        const history = await PriceHistory.find(filter)
            .sort({ recordedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await PriceHistory.countDocuments(filter);

        return {
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
}

module.exports = new PriceService();
