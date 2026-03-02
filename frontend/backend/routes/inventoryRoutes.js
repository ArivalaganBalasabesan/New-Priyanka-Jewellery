const express = require('express');
const router = express.Router();
const {
    getAllInventory,
    getInventoryByProduct,
    addStock,
    updateStock,
    removeInventory,
    getLowStockAlerts,
    updateThreshold,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { inventoryValidation, mongoIdValidation } = require('../validations');

router.use(protect);

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockAlerts);
router.get('/product/:id', mongoIdValidation, getInventoryByProduct);
router.post('/add-stock', authorize('admin', 'staff'), inventoryValidation, addStock);
router.put('/update-stock', authorize('admin'), inventoryValidation, updateStock);
router.put('/threshold/:id', mongoIdValidation, authorize('admin'), updateThreshold);
router.delete('/:id', mongoIdValidation, authorize('admin'), removeInventory);

module.exports = router;
