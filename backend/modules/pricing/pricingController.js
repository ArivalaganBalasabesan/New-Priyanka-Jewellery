const pricingService = require('./pricingService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

class PricingController {
    /**
     * @desc    Manually update metal or stone rate
     * @route   PUT /api/pricing/override
     * @access  Private (Admin)
     */
    updateRate = asyncHandler(async (req, res) => {
        const { type, name, rate } = req.body;

        if (!type || !name || !rate) {
            return res.status(400).json({ success: false, message: 'Missing type, name, or rate' });
        }

        await pricingService.manualOverride(type, name, rate);
        ApiResponse.success(res, null, 'Rate updated successfully');
    });

    /**
     * @desc    Trigger immediate update from API
     * @route   POST /api/pricing/update-now
     * @access  Private (Admin)
     */
    updateNow = asyncHandler(async (req, res) => {
        await pricingService.updateDailyRates();
        ApiResponse.success(res, null, 'Rates updated from external source');
    });
}

module.exports = new PricingController();
