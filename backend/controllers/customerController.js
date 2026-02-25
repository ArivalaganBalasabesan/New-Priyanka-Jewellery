const customerService = require('../services/customerService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Create customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.createCustomer(req.body);
    ApiResponse.created(res, customer, 'Customer created successfully');
});

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
const getAllCustomers = asyncHandler(async (req, res) => {
    const result = await customerService.getAllCustomers(req.query);
    ApiResponse.paginated(res, result.customers, result.pagination);
});

/**
 * @desc    Get single customer
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    ApiResponse.success(res, customer);
});

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    ApiResponse.success(res, customer, 'Customer updated successfully');
});

/**
 * @desc    Deactivate customer
 * @route   PUT /api/customers/:id/deactivate
 * @access  Private (Admin)
 */
const deactivateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.deactivateCustomer(req.params.id);
    ApiResponse.success(res, customer, 'Customer deactivated');
});

/**
 * @desc    Activate customer
 * @route   PUT /api/customers/:id/activate
 * @access  Private
 */
const activateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.activateCustomer(req.params.id);
    ApiResponse.success(res, customer, 'Customer activated');
});

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deactivateCustomer,
    activateCustomer,
};
