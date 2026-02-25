const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    ApiResponse.paginated(res, result.users, result.pagination);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    ApiResponse.success(res, user);
});

/**
 * @desc    Create staff account
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createStaffAccount = asyncHandler(async (req, res) => {
    const user = await userService.createStaffAccount(req.body);
    ApiResponse.created(res, user, 'Staff account created successfully');
});

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    ApiResponse.success(res, user, 'User role updated');
});

/**
 * @desc    Deactivate user
 * @route   PUT /api/users/:id/deactivate
 * @access  Private (Admin)
 */
const deactivateUser = asyncHandler(async (req, res) => {
    const user = await userService.deactivateUser(req.params.id);
    ApiResponse.success(res, user, 'User deactivated');
});

/**
 * @desc    Activate user
 * @route   PUT /api/users/:id/activate
 * @access  Private (Admin)
 */
const activateUser = asyncHandler(async (req, res) => {
    const user = await userService.activateUser(req.params.id);
    ApiResponse.success(res, user, 'User activated');
});

/**
 * @desc    Reset user password
 * @route   PUT /api/users/:id/reset-password
 * @access  Private (Admin)
 */
const resetUserPassword = asyncHandler(async (req, res) => {
    const result = await userService.resetUserPassword(req.params.id, req.body.newPassword);
    ApiResponse.success(res, null, result.message);
});

module.exports = {
    getAllUsers,
    getUserById,
    createStaffAccount,
    updateUserRole,
    deactivateUser,
    activateUser,
    resetUserPassword,
};
