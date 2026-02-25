const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createStaffAccount,
    updateUserRole,
    deactivateUser,
    activateUser,
    resetUserPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { registerValidation, mongoIdValidation } = require('../validations');

// All routes require admin
router.use(protect, authorize('admin'));

router.route('/').get(getAllUsers).post(registerValidation, createStaffAccount);
router.route('/:id').get(mongoIdValidation, getUserById);
router.put('/:id/role', mongoIdValidation, updateUserRole);
router.put('/:id/deactivate', mongoIdValidation, deactivateUser);
router.put('/:id/activate', mongoIdValidation, activateUser);
router.put('/:id/reset-password', mongoIdValidation, resetUserPassword);

module.exports = router;
