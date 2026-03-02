const inventoryService = require('../services/inventoryService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get all inventory
 * @route   GET /api/inventory
 * @access  Private
 */
const getAllInventory = asyncHandler(async (req, res) => {
    const result = await inventoryService.getAllInventory(req.query);
    ApiResponse.paginated(res, result.inventory, result.pagination);
});

/**
 * @desc    Get inventory by product ID
 * @route   GET /api/inventory/product/:id
 * @access  Private
 */
const getInventoryByProduct = asyncHandler(async (req, res) => {
    const inventory = await inventoryService.getInventoryByProductId(req.params.id);
    ApiResponse.success(res, inventory);
});

/**
 * @desc    Add stock
 * @route   POST /api/inventory/add-stock
 * @access  Private (Admin, Staff)
 */
const addStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.addStock(productId, quantity, req.user._id);
    ApiResponse.success(res, inventory, 'Stock added successfully');
});

/**
 * @desc    Update stock
 * @route   PUT /api/inventory/update-stock
 * @access  Private (Admin)
 */
const updateStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.updateStock(productId, quantity, req.user._id);
    ApiResponse.success(res, inventory, 'Stock updated successfully');
});

/**
 * @desc    Remove inventory entry
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin)
 */
const removeInventory = asyncHandler(async (req, res) => {
    await inventoryService.removeInventory(req.params.id);
    ApiResponse.success(res, null, 'Inventory entry removed');
});

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
    const items = await inventoryService.getLowStockAlerts();
    ApiResponse.success(res, items);
});

/**
 * @desc    Update threshold
 * @route   PUT /api/inventory/threshold/:id
 * @access  Private (Admin)
 */
const updateThreshold = asyncHandler(async (req, res) => {
    const inventory = await inventoryService.updateThreshold(
        req.params.id,
        req.body.threshold,
        req.user._id
    );
    ApiResponse.success(res, inventory, 'Threshold updated');
});

module.exports = {
    getAllInventory,
    getInventoryByProduct,
    addStock,
    updateStock,
    removeInventory,
    getLowStockAlerts,
    updateThreshold,
};
