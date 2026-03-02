const express = require('express');
const router = express.Router();
const {
    createSale,
    getAllSales,
    getSaleById,
    cancelSale,
    updatePaymentStatus,
    getDailySales,
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { saleValidation, mongoIdValidation } = require('../validations');

router.use(protect);

router.get('/daily', getDailySales);

router.route('/')
    .get(getAllSales)
    .post(saleValidation, createSale);

router.route('/:id')
    .get(mongoIdValidation, getSaleById);

router.put('/:id/cancel', mongoIdValidation, authorize('admin'), cancelSale);
router.put('/:id/payment-status', mongoIdValidation, updatePaymentStatus);

module.exports = router;
