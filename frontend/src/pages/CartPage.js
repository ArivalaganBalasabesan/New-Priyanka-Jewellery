import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    if (cart.length === 0) {
        return (
            <MainLayout title="Your Cart">
                <div className="cart-empty-state card">
                    <div className="empty-icon-circle">
                        <FiShoppingBag />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any jewelry to your cart yet.</p>
                    <Link to="/catalog" className="btn btn-primary">
                        Browse Collection
                    </Link>
                </div>
                <style>{`
                    .cart-empty-state {
                        text-align: center;
                        padding: 60px 20px;
                        max-width: 500px;
                        margin: 40px auto;
                    }
                    .empty-icon-circle {
                        width: 80px;
                        height: 80px;
                        background: var(--bg-tertiary);
                        color: var(--primary);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2.5rem;
                        margin: 0 auto 24px;
                    }
                `}</style>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Shopping Cart">
            <div className="cart-container">
                <div className="cart-items-section">
                    <div className="card cart-list">
                        <div className="cart-header-row">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Subtotal</span>
                        </div>
                        {cart.map((item) => (
                            <div key={item._id} className="cart-item-row">
                                <div className="product-info-cell">
                                    <div className="product-img">
                                        <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=200'} alt={item.name} />
                                    </div>
                                    <div className="product-details">
                                        <h4>{item.name}</h4>
                                        <p>{item.material} • {item.weight}g</p>
                                        <button onClick={() => removeFromCart(item._id)} className="remove-btn">
                                            <FiTrash2 /> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="price-cell">
                                    {formatCurrency(item.pricing?.finalPrice)}
                                </div>
                                <div className="qty-cell">
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}><FiMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}><FiPlus /></button>
                                    </div>
                                </div>
                                <div className="subtotal-cell">
                                    {formatCurrency((item.pricing?.finalPrice || 0) * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cart-summary-section">
                    <div className="card summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(getCartTotal())}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-tag">FREE</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatCurrency(getCartTotal())}</span>
                        </div>
                        <button
                            className="btn btn-primary checkout-btn"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout <FiArrowRight />
                        </button>
                        <div className="secure-checkout-hint">
                            <FiShoppingBag /> Secure Checkout by Stripe
                        </div>
                    </div>
                    <button onClick={clearCart} className="clear-cart-link">Clear Entire Cart</button>
                </div>
            </div>

            <style>{`
                .cart-container {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 30px;
                }
                .cart-header-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    padding: 15px 20px;
                    background: var(--bg-tertiary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
                }
                .cart-item-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    padding: 20px;
                    align-items: center;
                    border-bottom: 1px solid var(--border-light);
                }
                .product-info-cell {
                    display: flex;
                    gap: 15px;
                }
                .product-img img {
                    width: 70px;
                    height: 70px;
                    object-fit: cover;
                    border-radius: var(--radius-sm);
                }
                .product-details h4 {
                    margin: 0 0 5px 0;
                    font-size: 1rem;
                }
                .product-details p {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin: 0 0 10px 0;
                    text-transform: capitalize;
                }
                .remove-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    padding: 0;
                }
                .qty-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    padding: 5px 10px;
                    border-radius: 20px;
                    width: fit-content;
                }
                .qty-controls button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    color: var(--text-secondary);
                }
                .qty-controls span {
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                }
                .subtotal-cell {
                    font-weight: 700;
                    color: var(--primary);
                }
                .summary-card h3 {
                    margin-top: 0;
                    margin-bottom: 24px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .summary-row.total {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-top: 15px;
                }
                .free-tag {
                    color: var(--success);
                    font-weight: 700;
                }
                .summary-divider {
                    height: 1px;
                    background: var(--border-light);
                    margin: 20px 0;
                }
                .checkout-btn {
                    width: 100%;
                    margin-top: 20px;
                    padding: 14px;
                }
                .secure-checkout-hint {
                    margin-top: 20px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .clear-cart-link {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    text-decoration: underline;
                    font-size: 0.8rem;
                    margin-top: 15px;
                    cursor: pointer;
                    width: 100%;
                    text-align: center;
                }
                @media (max-width: 1000px) {
                    .cart-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
};

export default CartPage;
