const Analytics = require('./models/Analytics');
const Sale = require('../../models/Sale');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Customer = require('../../models/Customer');
const MetalRate = require('../../models/MetalRate');

class AnalyticsService {
    /**
     * Generate analytics snapshot for a specific date
     */
    async generateDailySnapshot(date = new Date()) {
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));

        // Aggregate Sales
        const salesData = await Sale.aggregate([
            { $match: { saleDate: { $gte: start, $lte: end }, isCancelled: false } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Top Products for the day
        const topProductsData = await Sale.aggregate([
            { $match: { saleDate: { $gte: start, $lte: end }, isCancelled: false } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.productName' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.itemTotal' }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 }
        ]);

        // Orders Count
        const orderCount = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });

        // Customer Growth
        const newCustomers = await Customer.countDocuments({ createdAt: { $gte: start, $lte: end } });

        // Metal Rates
        const rates = await MetalRate.find();
        const metalPriceTrends = {
            gold: rates.find(r => r.metal === 'gold')?.ratePerGram || 0,
            silver: rates.find(r => r.metal === 'silver')?.ratePerGram || 0,
            platinum: rates.find(r => r.metal === 'platinum')?.ratePerGram || 0
        };

        // Create or Update Snapshot
        const snapshot = await Analytics.findOneAndUpdate(
            { date: start, type: 'daily' },
            {
                totalRevenue: salesData[0]?.totalRevenue || 0,
                totalSales: salesData[0]?.count || 0,
                totalOrders: orderCount,
                topProducts: topProductsData.map(p => ({
                    productId: p._id,
                    name: p.name,
                    quantity: p.quantity,
                    revenue: p.revenue
                })),
                customerGrowth: newCustomers,
                metalPriceTrends
            },
            { upsert: true, new: true }
        );

        return snapshot;
    }

    /**
     * Get historical analytics
     */
    async getAnalyticsHistory(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        return await Analytics.find({
            type: 'daily',
            date: { $gte: since }
        }).sort({ date: 1 });
    }

    /**
     * Perform deep aggregation (real-time fallback)
     */
    async getRealTimeSummary() {
        const totalRevenue = await Sale.aggregate([
            { $match: { isCancelled: false } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);

        const totalSales = await Sale.countDocuments({ isCancelled: false });
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalCustomers = await Customer.countDocuments({ isActive: true });

        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalSales,
            totalProducts,
            totalCustomers
        };
    }
}

module.exports = new AnalyticsService();
