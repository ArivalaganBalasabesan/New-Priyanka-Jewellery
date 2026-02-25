const mongoose = require('mongoose');
const User = require('../models/User');
const MetalRate = require('../models/MetalRate');
const StoneRate = require('../models/StoneRate');
const Product = require('../models/Product');
const { DEFAULT_METAL_RATES, DEFAULT_STONE_RATES } = require('../config/constants');

/**
 * Seed admin user and default rates into database
 */
const seedDatabase = async () => {
    try {
        // Seed Admin User
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@priyankajewellery.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL || 'admin@priyankajewellery.com',
                password: process.env.ADMIN_PASSWORD || 'Admin@123456',
                role: 'admin',
                isActive: true,
            });
            console.log('✅ Admin user seeded');
        }

        // Seed Premium Products if empty
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const premiumProducts = [
                {
                    name: "Imperial Diamond Halo Earrings",
                    description: "Exquisite 18k white gold earrings featuring a brilliant round-cut center diamond surrounded by a delicate halo of micro-pave diamonds.",
                    category: "Earring",
                    material: "gold",
                    purity: 18,
                    weight: 4.5,
                    makingCharge: 2500,
                    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"],
                    stockStatus: "in-stock",
                    status: "active",
                    stoneType: "diamond",
                    stoneWeight: 1.2,
                    pricing: { goldRate: 6500, metalPrice: 29250, stonePrice: 45000, finalPrice: 76750 }
                },
                {
                    name: "Emerald Cascade Drop Earrings",
                    description: "Stunning Zambian emerald drops suspended from a cluster of diamonds. These earrings offer a timeless silhouette.",
                    category: "Earring",
                    material: "gold",
                    purity: 22,
                    weight: 6.2,
                    makingCharge: 3500,
                    images: ["https://images.unsplash.com/photo-1635767798638-3e25273a8256?auto=format&fit=crop&q=80&w=800"],
                    stockStatus: "in-stock",
                    status: "active",
                    stoneType: "emerald",
                    stoneWeight: 3.5,
                    pricing: { goldRate: 6500, metalPrice: 40300, stonePrice: 60000, finalPrice: 103800 }
                },
                {
                    name: "Midnight Sapphire Studs",
                    description: "Deep blue Ceylon sapphires set in classic 4-prong platinum mounts. Simple and exceptionally clear.",
                    category: "Earring",
                    material: "platinum",
                    purity: 95,
                    weight: 3.0,
                    makingCharge: 1800,
                    images: ["https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800"],
                    stockStatus: "in-stock",
                    status: "active",
                    stoneType: "sapphire",
                    stoneWeight: 2.0,
                    pricing: { goldRate: 3500, metalPrice: 10500, stonePrice: 35000, finalPrice: 47300 }
                },
                {
                    name: "Royal Golden Chandelier",
                    description: "Traditional Indian 22k gold chandelier earrings with intricate filigree work.",
                    category: "Earring",
                    material: "gold",
                    purity: 22,
                    weight: 12.5,
                    makingCharge: 8500,
                    images: ["https://images.unsplash.com/photo-1629224316170-f6666a7fb5a0?auto=format&fit=crop&q=80&w=800"],
                    stockStatus: "in-stock",
                    status: "active",
                    stoneType: "none",
                    stoneWeight: 0,
                    pricing: { goldRate: 6500, metalPrice: 81250, stonePrice: 0, finalPrice: 89750 }
                }
            ];
            await Product.insertMany(premiumProducts);
            console.log('✅ Premium products seeded');
        }

        // Seed Default Metal Rates
        for (const [metal, rate] of Object.entries(DEFAULT_METAL_RATES)) {
            const exists = await MetalRate.findOne({ metal });
            if (!exists) {
                await MetalRate.create({
                    metal,
                    ratePerGram: rate,
                    source: 'manual',
                    lastUpdated: new Date(),
                });
            }
        }
        console.log('✅ Metal rates seeded');

        // Seed Default Stone Rates
        for (const [stone, rate] of Object.entries(DEFAULT_STONE_RATES)) {
            const exists = await StoneRate.findOne({ stoneType: stone });
            if (!exists) {
                await StoneRate.create({
                    stoneType: stone,
                    ratePerCarat: rate,
                    source: 'manual',
                    lastUpdated: new Date(),
                });
            }
        }
        console.log('✅ Stone rates seeded');

        // Seed Sample Customers
        const customerCount = await mongoose.model('Customer').countDocuments();
        if (customerCount === 0) {
            const sampleCustomers = [
                { name: 'John Doe', email: 'john@example.com', phone: '9876543210', address: { street: 'Main St', city: 'Mumbai', state: 'MH', pincode: '400001' }, isActive: true, loyaltyPoints: 50 },
                { name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', address: { street: 'Park Rd', city: 'Chennai', state: 'TN', pincode: '600001' }, isActive: true, loyaltyPoints: 120 }
            ];
            await mongoose.model('Customer').insertMany(sampleCustomers);
            console.log('✅ Sample customers seeded');
        }

        // Seed Sample Sales for Analytics
        const saleCount = await mongoose.model('Sale').countDocuments();
        if (saleCount === 0) {
            const customers = await mongoose.model('Customer').find();
            const products = await mongoose.model('Product').find();
            const admin = await User.findOne({ role: 'admin' });

            if (customers.length > 0 && products.length > 0 && admin) {
                const sampleSales = [
                    {
                        customerId: customers[0]._id,
                        items: [{
                            productId: products[0]._id,
                            productName: products[0].name,
                            quantity: 1,
                            unitPrice: products[0].pricing.finalPrice,
                            metalRate: 6500,
                            itemTotal: products[0].pricing.finalPrice
                        }],
                        subtotal: products[0].pricing.finalPrice,
                        totalAmount: products[0].pricing.finalPrice,
                        finalAmount: products[0].pricing.finalPrice,
                        paymentStatus: 'completed',
                        paymentMethod: 'card',
                        soldBy: admin._id,
                        saleDate: new Date(new Date().setDate(new Date().getDate() - 2)) // 2 days ago
                    },
                    {
                        customerId: customers[1]._id,
                        items: [{
                            productId: products[1]._id,
                            productName: products[1].name,
                            quantity: 1,
                            unitPrice: products[1].pricing.finalPrice,
                            metalRate: 6500,
                            itemTotal: products[1].pricing.finalPrice
                        }],
                        subtotal: products[1].pricing.finalPrice,
                        totalAmount: products[1].pricing.finalPrice,
                        finalAmount: products[1].pricing.finalPrice,
                        paymentStatus: 'completed',
                        paymentMethod: 'upi',
                        soldBy: admin._id,
                        saleDate: new Date() // Today
                    }
                ];
                await mongoose.model('Sale').insertMany(sampleSales);
                console.log('✅ Sample sales seeded');
            }
        }

        // Generate initial analytics snapshots
        const analyticsService = require('../modules/analytics/analyticsService');
        await analyticsService.generateDailySnapshot(new Date(new Date().setDate(new Date().getDate() - 2)));
        await analyticsService.generateDailySnapshot(new Date(new Date().setDate(new Date().getDate() - 1)));
        await analyticsService.generateDailySnapshot(new Date());
        console.log('✅ Initial analytics snapshots generated');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    }
};

module.exports = seedDatabase;
