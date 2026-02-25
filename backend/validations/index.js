const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((err) => err.msg);
        throw ApiError.badRequest('Validation failed', messages);
    }
    next();
};

// ========================
// Auth Validations
// ========================
const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['admin', 'staff'])
        .withMessage('Role must be admin or staff'),
    validate,
];

// ========================
// Product Validations
// ========================
const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Bangle', 'Chain', 'Anklet', 'Mangalsutra', 'Other'])
        .withMessage('Invalid category'),
    body('material')
        .notEmpty()
        .withMessage('Material is required')
        .isIn(['gold', 'silver', 'platinum'])
        .withMessage('Material must be gold, silver, or platinum'),
    body('weight')
        .isFloat({ min: 0.01 })
        .withMessage('Weight must be greater than 0'),
    body('purity')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Purity must be between 0 and 100'),
    body('makingCharge')
        .isFloat({ min: 0 })
        .withMessage('Making charge must be 0 or more'),
    body('stoneType')
        .optional()
        .isIn(['diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'none'])
        .withMessage('Invalid stone type'),
    body('stoneWeight')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Stone weight must be 0 or more'),
    validate,
];

// ========================
// Customer Validations
// ========================
const customerValidation = [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('phone')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone must be a valid 10-digit number'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    validate,
];

// ========================
// Sale Validations
// ========================
const saleValidation = [
    body('customerId')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isMongoId()
        .withMessage('Invalid customer ID'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.productId')
        .isMongoId()
        .withMessage('Invalid product ID in items'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('discount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount cannot be negative'),
    body('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'partial', 'refunded'])
        .withMessage('Invalid payment status'),
    validate,
];

// ========================
// Order Validations
// ========================
const orderValidation = [
    body('customerId')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isMongoId()
        .withMessage('Invalid customer ID'),
    body('designDetails')
        .trim()
        .notEmpty()
        .withMessage('Design details are required'),
    body('material')
        .notEmpty()
        .withMessage('Material is required')
        .isIn(['gold', 'silver', 'platinum'])
        .withMessage('Invalid material'),
    body('estimatedPrice')
        .isFloat({ min: 0 })
        .withMessage('Estimated price must be 0 or more'),
    body('deliveryDate')
        .notEmpty()
        .withMessage('Delivery date is required')
        .isISO8601()
        .withMessage('Invalid date format'),
    validate,
];

// ========================
// Inventory Validations
// ========================
const inventoryValidation = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be 0 or more'),
    validate,
];

// ========================
// Rate Validations
// ========================
const metalRateValidation = [
    body('metal')
        .notEmpty()
        .withMessage('Metal type is required')
        .isIn(['gold', 'silver', 'platinum'])
        .withMessage('Invalid metal type'),
    body('ratePerGram')
        .isFloat({ min: 0 })
        .withMessage('Rate must be 0 or more'),
    validate,
];

const stoneRateValidation = [
    body('stoneType')
        .notEmpty()
        .withMessage('Stone type is required')
        .isIn(['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'])
        .withMessage('Invalid stone type'),
    body('ratePerCarat')
        .isFloat({ min: 0 })
        .withMessage('Rate must be 0 or more'),
    validate,
];

// ========================
// Param Validations
// ========================
const mongoIdValidation = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    validate,
];

module.exports = {
    validate,
    loginValidation,
    registerValidation,
    productValidation,
    customerValidation,
    saleValidation,
    orderValidation,
    inventoryValidation,
    metalRateValidation,
    stoneRateValidation,
    mongoIdValidation,
};
