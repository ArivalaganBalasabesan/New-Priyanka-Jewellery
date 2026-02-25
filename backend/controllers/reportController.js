const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get dashboard summary
 * @route   GET /api/reports/dashboard
 * @access  Private (Admin)
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
    const summary = await reportService.getDashboardSummary();
    ApiResponse.success(res, summary);
});

/**HI
 * @desc    Get sales report
 * @route   GET /api/reports/sales
 * @access  Private (Admin)
 */
const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await reportService.getSalesReport(startDate, endDate);
    ApiResponse.success(res, report);
});

/**
 * @desc    Get most sold products
 * @route   GET /api/reports/top-products
 * @access  Private (Admin)
 */
const getMostSoldProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const products = await reportService.getMostSoldProducts(limit);
    ApiResponse.success(res, products);
});

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private (Admin)
 */
const getInventoryReport = asyncHandler(async (req, res) => {
    const report = await reportService.getInventoryReport();
    ApiResponse.success(res, report);
});

/**
 * @desc    Get monthly revenue chart
 * @route   GET /api/reports/monthly-revenue
 * @access  Private (Admin)
 */
const getMonthlyRevenueChart = asyncHandler(async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportService.getMonthlyRevenueChart(year);
    ApiResponse.success(res, data);
});

module.exports = {
    getDashboardSummary,
    getSalesReport,
    getMostSoldProducts,
    getInventoryReport,
    getMonthlyRevenueChart,
};
