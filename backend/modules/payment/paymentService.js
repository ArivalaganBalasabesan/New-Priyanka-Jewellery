const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');
const Sale = require('../../models/Sale');
const Customer = require('../../models/Customer');
const User = require('../../models/User');
const Product = require('../../models/Product');
const ApiError = require('../../utils/ApiError');

class PaymentService {
    /**
     * Create a Stripe Checkout Session for an order
     */
    async createCheckoutSession({ orderId, userId, successUrl, cancelUrl, isCart, cartData }) {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
            throw ApiError.badRequest('Stripe is not configured. Contact the admin.');
        }

        let line_items = [];
        let metadata = { userId: userId.toString() };
        let customer_email = undefined;

        if (isCart && cartData) {
            // Handle Cart Checkout
            const user = await User.findById(userId);
            let customerProfile = await Customer.findOne({ userId });
            if (!customerProfile && user) {
                customerProfile = await Customer.create({
                    name: user.name,
                    email: user.email,
                    userId: user._id
                });
            }
            customer_email = user?.email;

            line_items = cartData.items.map(item => {
                const lineItem = {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: item.name || 'Jewelry Item',
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                };

                // Stripe only accepts public absolute HTTPS URLs for images
                if (item.image && item.image.startsWith('http') && !item.image.includes('localhost')) {
                    lineItem.price_data.product_data.images = [item.image];
                }

                return lineItem;
            });

            metadata.isCart = 'true';
            metadata.itemCount = cartData.items.length.toString();

            // Helper to check if string is valid ObjectId
            const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

            const sale = await Sale.create({
                customerId: customerProfile._id,
                items: cartData.items.map(item => ({
                    productId: isValidId(item.productId) ? item.productId : undefined,
                    productName: item.name || 'Product',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    metalRate: 0,
                    itemTotal: item.price * item.quantity
                })),
                subtotal: cartData.total,
                totalAmount: cartData.total,
                finalAmount: cartData.total,
                paymentStatus: 'pending',
                paymentMethod: 'card',
                soldBy: userId // Assuming the user is known
            });
            metadata.saleId = sale._id.toString();

        } else {
            // Handle Single Order Checkout
            const order = await Order.findById(orderId).populate('customerId', 'name email');
            if (!order) {
                throw ApiError.notFound('Order not found');
            }

            if (order.createdBy.toString() !== userId.toString()) {
                throw ApiError.forbidden('You can only pay for your own orders');
            }

            if (order.estimatedPrice <= 0) {
                throw ApiError.badRequest('This order has not been priced yet. Please wait for admin review.');
            }

            line_items = [
                {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: `Custom Order: ${order.orderNumber}`,
                            description: order.designDetails.substring(0, 200),
                        },
                        unit_amount: Math.round(order.estimatedPrice * 100),
                    },
                    quantity: 1,
                },
            ];

            metadata.orderId = orderId.toString();
            metadata.orderNumber = order.orderNumber;
            customer_email = order.customerId?.email;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}' + (orderId ? `&order_id=${orderId}` : ''),
            cancel_url: cancelUrl + (orderId ? `?order_id=${orderId}` : ''),
            metadata,
            customer_email,
        });

        return { sessionId: session.id, url: session.url };
    }

    async verifyPayment(sessionId) {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
            throw ApiError.badRequest('Stripe is not configured');
        }

        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === 'paid') {
                const { orderId, saleId, isCart } = session.metadata;

                if (isCart === 'true' && saleId) {
                    const sale = await Sale.findById(saleId).populate('customerId');
                    if (sale && sale.paymentStatus !== 'paid') {
                        sale.paymentStatus = 'paid';
                        sale.paymentMethod = 'card';
                        await sale.save();
                    }
                    return {
                        success: true,
                        type: 'cart',
                        sale: sale,
                        saleId,
                        amountPaid: session.amount_total / 100,
                        paymentStatus: session.payment_status,
                    };
                } else if (orderId) {
                    const order = await Order.findById(orderId).populate('customerId');
                    if (order && order.status === 'Pending') {
                        order.status = 'In Progress';
                        order.advancePayment = session.amount_total / 100;
                        await order.save();
                    }

                    return {
                        success: true,
                        type: 'order',
                        order: order,
                        orderId,
                        orderNumber: session.metadata.orderNumber,
                        amountPaid: session.amount_total / 100,
                        paymentStatus: session.payment_status,
                    };
                }
            }

            return {
                success: false,
                paymentStatus: session.payment_status,
                message: 'Payment was not successful yet.'
            };
        } catch (error) {
            console.error('Stripe Verification Error:', error);
            throw ApiError.badRequest('Failed to verify payment session: ' + error.message);
        }
    }

    /**
     * Get payment history for a user's orders
     */
    async getPaymentHistory(userId) {
        const orders = await Order.find({
            createdBy: userId,
            advancePayment: { $gt: 0 },
        })
            .populate('customerId', 'name')
            .sort({ updatedAt: -1 });

        return orders.map(order => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: order.advancePayment,
            designDetails: order.designDetails,
            status: order.status,
            paidAt: order.updatedAt,
        }));
    }
}

module.exports = new PaymentService();
