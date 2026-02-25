const priceService = require('../services/priceService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get all metal rates
 * @route   GET /api/rates/metals
 * @access  Private
 */
const getAllMetalRates = asyncHandler(async (req, res) => {
    const rates = await priceService.getAllMetalRates();
    ApiResponse.success(res, rates);
});

/**
 * @desc    Get single metal rate
 * @route   GET /api/rates/metals/:metal
 * @access  Private
 */
const getMetalRate = asyncHandler(async (req, res) => {
    const rate = await priceService.getMetalRate(req.params.metal);
    ApiResponse.success(res, rate);
});

/**
 * @desc    Update metal rate (Admin override)
 * @route   PUT /api/rates/metals
 * @access  Private (Admin)
 */
const updateMetalRate = asyncHandler(async (req, res) => {
    const { metal, ratePerGram } = req.body;
    const rate = await priceService.updateMetalRate(metal, ratePerGram, req.user._id);
    ApiResponse.success(res, rate, 'Metal rate updated successfully');
});

/**
 * @desc    Get all stone rates
 * @route   GET /api/rates/stones
 * @access  Private
 */
const getAllStoneRates = asyncHandler(async (req, res) => {
    const rates = await priceService.getAllStoneRates();
    ApiResponse.success(res, rates);
});

/**
 * @desc    Get single stone rate
 * @route   GET /api/rates/stones/:stoneType
 * @access  Private
 */
const getStoneRate = asyncHandler(async (req, res) => {
    const rate = await priceService.getStoneRate(req.params.stoneType);
    ApiResponse.success(res, rate);
});

/**
 * @desc    Update stone rate (Admin override)
 * @route   PUT /api/rates/stones
 * @access  Private (Admin)
 */
const updateStoneRate = asyncHandler(async (req, res) => {
    const { stoneType, ratePerCarat } = req.body;
    const rate = await priceService.updateStoneRate(stoneType, ratePerCarat, req.user._id);
    ApiResponse.success(res, rate, 'Stone rate updated successfully');
});

/**
 * @desc    Get price history
 * @route   GET /api/rates/history
 * @access  Private
 */
const getPriceHistory = asyncHandler(async (req, res) => {
    const result = await priceService.getPriceHistory(req.query);
    ApiResponse.paginated(res, result.history, result.pagination);
});

module.exports = {
    getAllMetalRates,
    getMetalRate,
    updateMetalRate,
    getAllStoneRates,
    getStoneRate,
    updateStoneRate,
    getPriceHistory,
};
