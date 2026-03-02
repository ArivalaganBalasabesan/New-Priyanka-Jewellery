const express = require('express');
const router = express.Router();
const pricingController = require('./pricingController');
const { protect } = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

router.put('/override', protect, authorize('admin'), (req, res, next) => pricingController.updateRate(req, res, next));
router.post('/update-now', protect, authorize('admin'), (req, res, next) => pricingController.updateNow(req, res, next));

module.exports = router;
