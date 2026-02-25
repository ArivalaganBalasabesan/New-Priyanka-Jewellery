const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deactivateCustomer,
    activateCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { customerValidation, mongoIdValidation } = require('../validations');

router.use(protect);

router.route('/')
    .get(getAllCustomers)
    .post(customerValidation, createCustomer);

router.route('/:id')
    .get(mongoIdValidation, getCustomerById)
    .put(mongoIdValidation, updateCustomer);

router.put('/:id/deactivate', mongoIdValidation, authorize('admin'), deactivateCustomer);
router.put('/:id/activate', mongoIdValidation, activateCustomer);

module.exports = router;
