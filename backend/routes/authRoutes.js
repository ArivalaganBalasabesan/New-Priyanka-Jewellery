const express = require('express');
const router = express.Router();
const { login, register, verifyOtp, googleLogin, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { loginValidation, registerValidation } = require('../validations');

// Public
router.post('/login', loginValidation, login);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerValidation, register);
router.post('/google-login', googleLogin);

// Protected
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
