module.exports = {
    // User Roles
    ROLES: {
        ADMIN: 'admin',
        STAFF: 'staff',
        CUSTOMER: 'customer',
    },

    // Product Status
    PRODUCT_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
    },

    // Material Types
    MATERIALS: {
        GOLD: 'gold',
        SILVER: 'silver',
        PLATINUM: 'platinum',
    },

    // Stone Types
    STONE_TYPES: {
        DIAMOND: 'diamond',
        RUBY: 'ruby',
        EMERALD: 'emerald',
        SAPPHIRE: 'sapphire',
        PEARL: 'pearl',
        NONE: 'none',
    },

    // Order Status
    ORDER_STATUS: {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
    },

    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        PARTIAL: 'partial',
        REFUNDED: 'refunded',
    },

    // Inventory
    LOW_STOCK_THRESHOLD: 5,

    // Pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,

    // Tax Rate (in percentage)
    DEFAULT_TAX_RATE: 3, // GST 3% for jewelry in India

    // Cron Schedule - Every 24 hours at midnight
    RATE_UPDATE_CRON: '0 0 * * *',

    // Default Metal Rates (fallback if API fails, in INR per gram)
    DEFAULT_METAL_RATES: {
        gold: 6500,
        silver: 85,
        platinum: 3200,
    },

    // Default Stone Rates (fallback, in INR per carat)
    DEFAULT_STONE_RATES: {
        diamond: 35000,
        ruby: 15000,
        emerald: 12000,
        sapphire: 18000,
        pearl: 5000,
        none: 0,
    },
};
