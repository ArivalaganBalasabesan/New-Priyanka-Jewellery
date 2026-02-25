const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    /**
     * Register a new user
     */
    async register(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw ApiError.conflict('User with this email already exists');
        }

        const user = await User.create(userData);
        const token = generateToken(user._id);

        return { user, token };
    }

    /**
     * Google Login
     */
    async googleLogin(idToken) {
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (error) {
            throw ApiError.unauthorized('Invalid Google Token');
        }

        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                role: 'customer',
                isActive: true
            });
            isNewUser = true;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);
        return { user: user.toJSON(), token, isNewUser };
    }

    /**
     * Login user
     */
    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (!user.isActive) {
            throw ApiError.unauthorized('Account has been deactivated. Contact admin.');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        return { user: user.toJSON(), token };
    }

    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }
        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'phone', 'profilePicture'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                updates[key] = updateData[key];
            }
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw ApiError.badRequest('Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

module.exports = new AuthService();
