const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class UserService {
    /**
     * Get all users (Admin)
     */
    async getAllUsers(query = {}) {
        const { page = 1, limit = 20, role, isActive } = query;
        const filter = {};

        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single user
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw ApiError.notFound('User not found');
        }
        return user;
    }

    /**
     * Create staff account (Admin only)
     */
    async createStaffAccount(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw ApiError.conflict('User with this email already exists');
        }

        const user = await User.create({
            ...userData,
            role: userData.role || 'staff',
        });

        return user;
    }

    /**
     * Update user role (Admin only)
     */
    async updateUserRole(userId, role) {
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    /**
     * Deactivate user (Admin only)
     */
    async deactivateUser(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    /**
     * Activate user (Admin only)
     */
    async activateUser(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true }
        );

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    /**
     * Reset user password (Admin only)
     */
    async resetUserPassword(userId, newPassword) {
        const user = await User.findById(userId);

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        user.password = newPassword;
        await user.save();

        return { message: 'Password reset successfully' };
    }
}

module.exports = new UserService();
