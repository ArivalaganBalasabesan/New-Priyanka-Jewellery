const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

class ReportService {
    /**
     * Get dashboard summary
     */
    async getDashboardSummary() {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Today's revenue
        const dailySales = await Sale.aggregate([
            {
                $match: {
                    saleDate: { $gte: startOfDay, $lte: endOfDay },
                    isCancelled: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Monthly revenue
        const monthlySales = await Sale.aggregate([
            {
                $match: {
                    saleDate: { $gte: startOfMonth, $lte: endOfMonth },
                    isCancelled: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Total revenue (all time)
        const totalSales = await Sale.aggregate([
            {
                $match: { isCancelled: false },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$finalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Counts
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalCustomers = await Customer.countDocuments({ isActive: true });
        const pendingOrders = await Order.countDocuments({ status: 'Pending', isCancelled: false });
        const inProgressOrders = await Order.countDocuments({ status: 'In Progress', isCancelled: false });

        // Low stock count
        const allInventory = await Inventory.find().populate('productId');
        const lowStockCount = allInventory.filter((item) => item.isLowStock && item.productId).length;

        return {
            dailyRevenue: dailySales[0]?.totalRevenue || 0,
            dailyTransactions: dailySales[0]?.count || 0,
            monthlyRevenue: monthlySales[0]?.totalRevenue || 0,
            monthlyTransactions: monthlySales[0]?.count || 0,
            totalRevenue: totalSales[0]?.totalRevenue || 0,
            totalTransactions: totalSales[0]?.count || 0,
            totalProducts,
            totalCustomers,
            pendingOrders,
            inProgressOrders,
            lowStockCount,
        };
    }

    /**
     * Get sales report by date range
     */
    async getSalesReport(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const sales = await Sale.aggregate([
            {
                $match: {
                    saleDate: { $gte: start, $lte: end },
                    isCancelled: false,
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$saleDate' },
                    },
                    totalRevenue: { $sum: '$finalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalTax: { $sum: '$taxAmount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const totalRevenue = sales.reduce((sum, day) => sum + day.totalRevenue, 0);
        const totalTransactions = sales.reduce((sum, day) => sum + day.count, 0);

        return {
            period: { startDate: start, endDate: end },
            dailyBreakdown: sales,
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalTransactions,
                averageTransaction: totalTransactions > 0
                    ? Math.round((totalRevenue / totalTransactions) * 100) / 100
                    : 0,
            },
        };
    }

    /**
     * Get most sold products
     */
    async getMostSoldProducts(limit = 10) {
        const products = await Sale.aggregate([
            { $match: { isCancelled: false } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    productName: { $first: '$items.productName' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.itemTotal' },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
        ]);

        return products;
    }

    /**
     * Get inventory report
     */
    async getInventoryReport() {
        const inventory = await Inventory.find()
            .populate('productId', 'name sku category material weight status')
            .sort({ quantity: 1 });

        const summary = {
            totalItems: inventory.length,
            lowStockItems: inventory.filter((item) => item.isLowStock).length,
            outOfStockItems: inventory.filter((item) => item.quantity === 0).length,
            byCategory: {},
        };

        inventory.forEach((item) => {
            if (item.productId) {
                const cat = item.productId.category;
                if (!summary.byCategory[cat]) {
                    summary.byCategory[cat] = { count: 0, totalStock: 0 };
                }
                summary.byCategory[cat].count++;
                summary.byCategory[cat].totalStock += item.quantity;
            }
        });

        return { inventory, summary };
    }

    /**
     * Get monthly revenue chart data
     */
    async getMonthlyRevenueChart(year) {
        const targetYear = year || new Date().getFullYear();

        const monthlyData = await Sale.aggregate([
            {
                $match: {
                    saleDate: {
                        $gte: new Date(`${targetYear}-01-01`),
                        $lte: new Date(`${targetYear}-12-31T23:59:59`),
                    },
                    isCancelled: false,
                },
            },
            {
                $group: {
                    _id: { $month: '$saleDate' },
                    totalRevenue: { $sum: '$finalAmount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing months with 0
        const months = [];
        for (let i = 1; i <= 12; i++) {
            const found = monthlyData.find((m) => m._id === i);
            months.push({
                month: i,
                totalRevenue: found ? found.totalRevenue : 0,
                count: found ? found.count : 0,
            });
        }

        return { year: targetYear, months };
    }
}

module.exports = new ReportService();
