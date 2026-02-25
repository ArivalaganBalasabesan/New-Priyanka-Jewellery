const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restoreProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { productValidation, mongoIdValidation } = require('../validations');

// Public GET routes
router.get('/', getAllProducts);
router.get('/:id', mongoIdValidation, getProductById);

// Protected routes (require login)
router.use(protect);

router.post('/', authorize('admin', 'staff'), productValidation, createProduct);
router.put('/:id', mongoIdValidation, authorize('admin', 'staff'), updateProduct);
router.delete('/:id', mongoIdValidation, authorize('admin'), deleteProduct);
router.put('/:id/restore', mongoIdValidation, authorize('admin'), restoreProduct);

module.exports = router;
