const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./utils/seeder');
const { initRateUpdateCron } = require('./cron/rateUpdateJob');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rateRoutes = require('./routes/rateRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ========================
// Security Middleware
// ========================
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes',
    },
});
app.use('/api/', limiter);

// ========================
// Body Parsing & Logging
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ========================
// API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/reports', reportRoutes);

// New Modules
app.use('/api/payment', require('./modules/payment/paymentRoutes'));
app.use('/api/ai', require('./modules/ai/aiRoutes'));
const pricingRoutes = require('./modules/pricing/pricingRoutes');
app.use('/api/pricing', pricingRoutes);
app.use('/api/analytics', require('./modules/analytics/analyticsRoutes'));

// Init Pricing Cron
const pricingService = require('./modules/pricing/pricingService');
pricingService.initCron();

// Static uploads
const path = require('path');
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Jewelry Shop API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ========================
// Global Error Handler
// ========================
app.use(errorHandler);

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Seed default data
        await seedDatabase();

        // Initialize cron jobs
        initRateUpdateCron();

        app.listen(PORT, () => {
            console.log('=========================================');
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
            console.log('=========================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
