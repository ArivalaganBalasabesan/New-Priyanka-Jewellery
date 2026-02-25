const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getSalesReport,
    getMostSoldProducts,
    getInventoryReport,
    getMonthlyRevenueChart,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardSummary);
router.get('/sales', getSalesReport);
router.get('/top-products', getMostSoldProducts);
router.get('/inventory', getInventoryReport);
router.get('/monthly-revenue', getMonthlyRevenueChart);

module.exports = router;
