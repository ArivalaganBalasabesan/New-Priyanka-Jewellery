const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const { protect } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

// Create checkout session
router.post('/checkout', paymentController.createCheckout);

// Verify payment after redirect
router.get('/verify/:sessionId', paymentController.verifyPayment);

// Payment history
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
