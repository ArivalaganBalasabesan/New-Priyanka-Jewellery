const cron = require('node-cron');
const axios = require('axios');
const MetalRate = require('../models/MetalRate');
const StoneRate = require('../models/StoneRate');
const PriceHistory = require('../models/PriceHistory');
const { RATE_UPDATE_CRON, DEFAULT_METAL_RATES, DEFAULT_STONE_RATES } = require('../config/constants');

/**
 * Fetch metal rates from external API
 * Falls back to last stored rate if API fails
 */
const fetchMetalRatesFromAPI = async () => {
    try {
        console.log('🔄 Fetching metal rates from external API...');

        // Try to fetch from metals API
        const response = await axios.get(process.env.METAL_API_URL, {
            params: {
                access_key: process.env.METAL_API_KEY,
                base: 'INR',
                symbols: 'XAU,XAG,XPT', // Gold, Silver, Platinum
            },
            timeout: 10000,
        });

        if (response.data && response.data.success) {
            const rates = response.data.rates;

            // Convert from troy ounce to gram (1 troy ounce = 31.1035g)
            const metalRates = {
                gold: Math.round((1 / rates.XAU) * 31.1035 * 100) / 100,
                silver: Math.round((1 / rates.XAG) * 31.1035 * 100) / 100,
                platinum: Math.round((1 / rates.XPT) * 31.1035 * 100) / 100,
            };

            return metalRates;
        }

        throw new Error('API response unsuccessful');
    } catch (error) {
        console.warn(`⚠️  Metal API fetch failed: ${error.message}`);
        console.log('📌 Using last stored rates or defaults...');

        // Try to use last stored rates
        const storedRates = {};
        for (const metal of ['gold', 'silver', 'platinum']) {
            const stored = await MetalRate.findOne({ metal });
            storedRates[metal] = stored ? stored.ratePerGram : DEFAULT_METAL_RATES[metal];
        }

        return storedRates;
    }
};

/**
 * Update metal rates in database
 */
const updateMetalRates = async (rates, source = 'api') => {
    for (const [metal, rate] of Object.entries(rates)) {
        await MetalRate.findOneAndUpdate(
            { metal },
            {
                ratePerGram: rate,
                source,
                lastUpdated: new Date(),
            },
            { upsert: true, new: true }
        );

        // Log to price history
        await PriceHistory.create({
            type: 'metal',
            name: metal,
            rate,
            source,
            recordedAt: new Date(),
        });
    }
};

/**
 * Update stone rates (simulated - using stored/default values)
 * In production, integrate with a gemstone price API
 */
const updateStoneRates = async () => {
    try {
        console.log('🔄 Updating stone rates...');

        // In production, replace with actual API call
        // For now, use stored rates with minor fluctuation simulation
        for (const [stone, defaultRate] of Object.entries(DEFAULT_STONE_RATES)) {
            if (stone === 'none') continue;

            const stored = await StoneRate.findOne({ stoneType: stone });
            const currentRate = stored ? stored.ratePerCarat : defaultRate;

            // Keep current rate (or simulate minor market fluctuation)
            await StoneRate.findOneAndUpdate(
                { stoneType: stone },
                {
                    ratePerCarat: currentRate,
                    source: stored ? stored.source : 'manual',
                    lastUpdated: new Date(),
                },
                { upsert: true, new: true }
            );
        }

        console.log('✅ Stone rates updated');
    } catch (error) {
        console.error('❌ Stone rate update failed:', error.message);
    }
};

/**
 * Initialize the scheduled rate update job
 * Runs every 24 hours at midnight (configurable via constants)
 */
const initRateUpdateCron = () => {
    console.log(`⏰ Rate update cron scheduled: ${RATE_UPDATE_CRON}`);

    cron.schedule(RATE_UPDATE_CRON, async () => {
        console.log('=========================================');
        console.log(`🕐 Running scheduled rate update: ${new Date().toISOString()}`);
        console.log('=========================================');

        try {
            // Fetch and update metal rates
            const metalRates = await fetchMetalRatesFromAPI();
            await updateMetalRates(metalRates, 'api');
            console.log('✅ Metal rates updated:', metalRates);

            // Update stone rates
            await updateStoneRates();

            console.log('✅ All rates updated successfully');
        } catch (error) {
            console.error('❌ Scheduled rate update failed:', error.message);
        }
    });
};

module.exports = {
    initRateUpdateCron,
    fetchMetalRatesFromAPI,
    updateMetalRates,
    updateStoneRates,
};
