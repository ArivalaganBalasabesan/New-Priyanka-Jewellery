const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * @desc    Create custom order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body, req.user._id);
    ApiResponse.created(res, order, 'Order created successfully');
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);
    ApiResponse.paginated(res, result.orders, result.pagination);
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    ApiResponse.success(res, order);
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    ApiResponse.success(res, order, 'Order status updated');
});

/**
 * @desc    Update order details
 * @route   PUT /api/orders/:id
 * @access  Private
 */
const updateOrder = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrder(req.params.id, req.body);
    ApiResponse.success(res, order, 'Order updated successfully');
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.body.reason);
    ApiResponse.success(res, order, 'Order cancelled');
});

/**
 * @desc    Get my orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getMyOrders(req.user._id);
    ApiResponse.success(res, orders);
});

/**
 * @desc    Request a quote from design (Customer)
 * @route   POST /api/orders/request-quote
 * @access  Private
 */
const requestQuote = asyncHandler(async (req, res) => {
    const order = await orderService.requestQuote(req.user._id, req.body);
    ApiResponse.created(res, order, 'Quote request submitted successfully! Our team will review your design.');
});

/**
 * @desc    Mark order as seen by admin
 * @route   PUT /api/orders/:id/seen
 * @access  Private (Staff/Admin)
 */
const markAsSeen = asyncHandler(async (req, res) => {
    const order = await orderService.markAsSeen(req.params.id);
    ApiResponse.success(res, order, 'Order marked as seen');
});

/**
 * @desc    Upload manual photo for custom order
 * @route   POST /api/orders/upload-image
 * @access  Private
 */
const uploadCustomImage = asyncHandler(async (req, res) => {
    const { base64Image } = req.body;
    if (!base64Image) {
        throw ApiError.badRequest('No image provided');
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const customDir = path.join(process.cwd(), 'public', 'uploads', 'custom');
    if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
    }

    const fileName = `custom_${crypto.randomBytes(8).toString('hex')}.jpeg`;
    const filePath = path.join(customDir, fileName);

    fs.writeFileSync(filePath, imageBuffer);
    const imageUrl = `/uploads/custom/${fileName}`;

    ApiResponse.success(res, { url: imageUrl }, 'Image uploaded locally');
});

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    cancelOrder,
    getMyOrders,
    requestQuote,
    markAsSeen,
    uploadCustomImage,
};
