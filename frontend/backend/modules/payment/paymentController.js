const paymentService = require('./paymentService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

class PaymentController {
    /**
     * @desc    Create Stripe Checkout Session
     * @route   POST /api/payment/checkout
     * @access  Private
     */
    createCheckout = asyncHandler(async (req, res) => {
        const { orderId, isCart, cartData } = req.body;
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const result = await paymentService.createCheckoutSession({
            orderId,
            isCart,
            cartData,
            userId: req.user._id,
            successUrl: `${frontendUrl}/payment/success`,
            cancelUrl: `${frontendUrl}/payment/cancel`,
        });

        ApiResponse.success(res, result, 'Payment session created');
    });

    /**
     * @desc    Verify Payment Status
     * @route   GET /api/payment/verify/:sessionId
     * @access  Private
     */
    verifyPayment = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const result = await paymentService.verifyPayment(sessionId);
        ApiResponse.success(res, result, 'Payment verified');
    });

    /**
     * @desc    Get Payment History
     * @route   GET /api/payment/history
     * @access  Private
     */
    getPaymentHistory = asyncHandler(async (req, res) => {
        const history = await paymentService.getPaymentHistory(req.user._id);
        ApiResponse.success(res, history);
    });
}

module.exports = new PaymentController();
