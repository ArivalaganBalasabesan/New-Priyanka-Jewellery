const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { orderValidation, mongoIdValidation } = require('../validations');

router.use(protect);

router.get('/my-orders', getMyOrders);
router.post('/request-quote', requestQuote);
router.post('/upload-image', uploadCustomImage);

router.route('/')
    .get(getAllOrders)
    .post(orderValidation, createOrder);

router.route('/:id')
    .get(mongoIdValidation, getOrderById)
    .put(mongoIdValidation, updateOrder);

router.put('/:id/status', mongoIdValidation, updateOrderStatus);
router.put('/:id/cancel', mongoIdValidation, cancelOrder);
router.put('/:id/seen', mongoIdValidation, markAsSeen);

module.exports = router;
