const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Private (Admin)
 */
const Customer = require('../models/Customer');

const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    // Force role to customer for public registration
    const userPayload = { name, email, password, phone, role: 'customer', isActive: true };
    const { user, token } = await authService.register(userPayload);

    // Create Customer profile linked to User
    await Customer.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined
    });

    ApiResponse.created(res, { user, token }, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    ApiResponse.success(res, { user, token }, 'Login successful');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    ApiResponse.success(res, user);
});

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    ApiResponse.success(res, user, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    ApiResponse.success(res, null, result.message);
});

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const result = await authService.googleLogin(idToken);

    if (result.isNewUser) {
        await Customer.create({
            userId: result.user._id,
            name: result.user.name,
            email: result.user.email
        });
    }

    ApiResponse.success(res, { user: result.user, token: result.token }, 'Google login successful');
});

module.exports = {
    register,
    login,
    googleLogin,
    getProfile,
    updateProfile,
    changePassword,
};
