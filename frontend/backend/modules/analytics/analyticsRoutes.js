const express = require('express');
const router = express.Router();
const analyticsController = require('./analyticsController');
const { protect } = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

router.use(protect, authorize('admin'));

router.get('/', analyticsController.getAnalytics);
router.post('/snapshot', analyticsController.triggerSnapshot);

module.exports = router;
