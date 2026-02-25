const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (Admin, Staff)
 */
const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body, req.user._id);
    ApiResponse.created(res, product, 'Product created successfully');
});

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private
 */
const getAllProducts = asyncHandler(async (req, res) => {
    const result = await productService.getAllProducts(req.query);
    ApiResponse.paginated(res, result.products, result.pagination);
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    ApiResponse.success(res, product);
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Staff)
 */
const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    ApiResponse.success(res, product, 'Product updated successfully');
});

/**
 * @desc    Soft delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
    await productService.softDeleteProduct(req.params.id);
    ApiResponse.success(res, null, 'Product deleted successfully');
});

/**
 * @desc    Restore product
 * @route   PUT /api/products/:id/restore
 * @access  Private (Admin)
 */
const restoreProduct = asyncHandler(async (req, res) => {
    const product = await productService.restoreProduct(req.params.id);
    ApiResponse.success(res, product, 'Product restored successfully');
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restoreProduct,
};
