const analyticsService = require('./analyticsService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * @desc    Get analytics summary and history
 * @route   GET /api/analytics
 * @access  Private (Admin)
 */
const getAnalytics = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;

    // Ensure we have today's snapshot
    await analyticsService.generateDailySnapshot();

    const history = await analyticsService.getAnalyticsHistory(days);
    const summary = await analyticsService.getRealTimeSummary();

    ApiResponse.success(res, {
        summary,
        history
    });
});

/**
 * @desc    Trigger snapshot generation (manual)
 * @route   POST /api/analytics/snapshot
 * @access  Private (Admin)
 */
const triggerSnapshot = asyncHandler(async (req, res) => {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const snapshot = await analyticsService.generateDailySnapshot(date);
    ApiResponse.success(res, snapshot, 'Snapshot generated successfully');
});

module.exports = {
    getAnalytics,
    triggerSnapshot
};
