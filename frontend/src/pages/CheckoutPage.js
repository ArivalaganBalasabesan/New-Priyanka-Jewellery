import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { paymentService } from '../services/endpoints';
import { FiCreditCard, FiLock, FiTruck, FiShoppingBag, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useApi from '../hooks/useApi';

const CheckoutPage = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { loading, execute } = useApi();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);
            // In our system, we convert Cart to Order first
            // For simplicity, we create one order entry or handle it via a multi-item checkout
            // Since our current backend paymentService creates checkout for dynamic orders, 
            // we'll simulate converting this cart to a special 'Bulk/Cart Order' or just handle standard item purchase.

            // For now, let's create a bulk order or handle multiple checkout
            // Actually, we should probably have a 'createCartOrder' endpoint in the backend.
            // I'll use the existing logic to create a checkout for the cart total.

            // Simulating a more robust backend logic:
            toast.info("Preparing your secure checkout...");

            // We pass the cart items to the backend to create a consolidated order
            const cartData = {
                items: cart.map(item => ({
                    productId: item._id,
                    name: item.name,
                    image: item.images?.[0],
                    quantity: item.quantity,
                    price: item.pricing?.finalPrice || 0
                })),
                total: getCartTotal()
            };

            // Assuming we have or will add this to paymentService
            // For now, I'll use the existing checkout flow but adapted for cart
            const res = await execute(() => paymentService.createCheckout({
                isCart: true,
                cartData: cartData
            }));

            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                toast.error("Could not create payment session. Please try again.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <MainLayout title="Secure Checkout">
            <div className="checkout-container">
                <div className="checkout-main">
                    <div className="card checkout-section">
                        <div className="section-title">
                            <FiTruck /> Shipping Information
                        </div>
                        <p className="checkout-hint">Your registered address will be used for delivery. You can update this in your profile.</p>
                        <div className="address-preview">
                            {/* Assuming address is in user context, for now placeholder */}
                            <strong>Standard Delivery</strong>
                            <p>Free Insured Shipping to your registered location.</p>
                        </div>
                    </div>

                    <div className="card checkout-section">
                        <div className="section-title">
                            <FiCreditCard /> Payment Method
                        </div>
                        <div className="payment-options">
                            <div className="payment-option-card active">
                                <div className="option-check"></div>
                                <div className="option-info">
                                    <strong>Online Payment (Stripe)</strong>
                                    <p>Credit/Debit Card, UPI, NetBanking</p>
                                </div>
                                <div className="stripe-logo">Stripe</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="card review-card">
                        <h3>Order Review</h3>
                        <div className="order-items-mini">
                            {cart.map(item => (
                                <div key={item._id} className="mini-item">
                                    <span className="mini-qty">{item.quantity}x</span>
                                    <span className="mini-name">{item.name}</span>
                                    <span className="mini-price">{formatCurrency((item.pricing?.finalPrice || 0) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(getCartTotal())}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-tag">FREE</span>
                        </div>
                        <div className="summary-row total">
                            <span>Payable Amount</span>
                            <span>{formatCurrency(getCartTotal())}</span>
                        </div>

                        <button
                            className="btn btn-primary place-order-btn"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <><FiLoader className="ai-spin" /> Redirecting...</>
                            ) : (
                                <><FiLock /> Pay {formatCurrency(getCartTotal())}</>
                            )}
                        </button>

                        <p className="security-note">
                            <FiLock /> Your payment information is encrypted and secure.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-container {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 30px;
                }
                .checkout-section {
                    margin-bottom: 24px;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }
                .checkout-hint {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: 15px;
                }
                .address-preview {
                    padding: 15px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--primary);
                }
                .address-preview p {
                    margin-top: 5px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                .payment-option-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    border: 2px solid var(--primary);
                    background: var(--primary-glow);
                    border-radius: var(--radius-md);
                    position: relative;
                }
                .option-check {
                    width: 20px;
                    height: 20px;
                    border: 6px solid var(--primary);
                    border-radius: 50%;
                    background: white;
                }
                .option-info strong {
                    display: block;
                    font-size: 0.95rem;
                }
                .option-info p {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }
                .stripe-logo {
                    margin-left: auto;
                    font-weight: 900;
                    letter-spacing: -1px;
                    color: #635bff;
                    font-style: italic;
                    font-size: 1.2rem;
                }
                .mini-item {
                    display: grid;
                    grid-template-columns: 30px 1fr auto;
                    gap: 10px;
                    margin-bottom: 12px;
                    font-size: 0.85rem;
                }
                .mini-qty {
                    color: var(--text-muted);
                }
                .mini-price {
                    font-weight: 600;
                }
                .place-order-btn {
                    width: 100%;
                    padding: 16px;
                    font-size: 1.05rem;
                    margin-top: 25px;
                    border-radius: var(--radius-md);
                }
                .security-note {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                @media (max-width: 1000px) {
                    .checkout-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
};

export default CheckoutPage;
