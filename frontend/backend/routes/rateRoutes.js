const express = require('express');
const router = express.Router();
const {
    getAllMetalRates,
    getMetalRate,
    updateMetalRate,
    getAllStoneRates,
    getStoneRate,
    updateStoneRate,
    getPriceHistory,
    syncMarketRates,
} = require('../controllers/priceController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { metalRateValidation, stoneRateValidation } = require('../validations');

router.use(protect);

// Metal rates
router.get('/metals', getAllMetalRates);
router.get('/metals/:metal', getMetalRate);
router.put('/metals', authorize('admin'), metalRateValidation, updateMetalRate);
router.post('/sync', authorize('admin'), syncMarketRates);

// Stone rates
router.get('/stones', getAllStoneRates);
router.get('/stones/:stoneType', getStoneRate);
router.put('/stones', authorize('admin'), stoneRateValidation, updateStoneRate);

// Price history
router.get('/history', getPriceHistory);

module.exports = router;
