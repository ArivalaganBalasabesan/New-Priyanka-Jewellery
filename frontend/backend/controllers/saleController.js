const saleService = require('../services/saleService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create sale
 * @route   POST /api/sales
 * @access  Private
 */
const createSale = asyncHandler(async (req, res) => {
    const sale = await saleService.createSale(req.body, req.user._id);
    ApiResponse.created(res, sale, 'Sale created successfully');
});

/**
 * @desc    Get all sales
 * @route   GET /api/sales
 * @access  Private
 */
const getAllSales = asyncHandler(async (req, res) => {
    const result = await saleService.getAllSales(req.query);
    ApiResponse.paginated(res, result.sales, result.pagination);
});

/**
 * @desc    Get single sale / invoice
 * @route   GET /api/sales/:id
 * @access  Private
 */
const getSaleById = asyncHandler(async (req, res) => {
    const sale = await saleService.getSaleById(req.params.id);
    ApiResponse.success(res, sale);
});

/**
 * @desc    Cancel sale
 * @route   PUT /api/sales/:id/cancel
 * @access  Private (Admin)
 */
const cancelSale = asyncHandler(async (req, res) => {
    const sale = await saleService.cancelSale(req.params.id, req.user._id, req.body.reason);
    ApiResponse.success(res, sale, 'Sale cancelled successfully');
});

/**
 * @desc    Update payment status
 * @route   PUT /api/sales/:id/payment-status
 * @access  Private
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const sale = await saleService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
    ApiResponse.success(res, sale, 'Payment status updated');
});

/**
 * @desc    Get daily sales
 * @route   GET /api/sales/daily
 * @access  Private
 */
const getDailySales = asyncHandler(async (req, res) => {
    const result = await saleService.getDailySales(req.query.date);
    ApiResponse.success(res, result);
});

module.exports = {
    createSale,
    getAllSales,
    getSaleById,
    cancelSale,
    updatePaymentStatus,
    getDailySales,
};
