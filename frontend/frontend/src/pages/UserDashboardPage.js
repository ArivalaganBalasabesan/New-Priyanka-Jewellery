import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService, aiService, paymentService } from '../services/endpoints';
import {
    FiGrid, FiShoppingBag, FiImage, FiSettings, FiLogOut,
    FiAward, FiCalendar, FiChevronRight, FiPlus, FiDownload,
    FiClock, FiCheckCircle, FiAlertCircle, FiPackage, FiStar,
    FiCreditCard, FiLoader
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';

const UserDashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [payingOrderId, setPayingOrderId] = useState(null);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${process.env.REACT_APP_API_URL}${url}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, designsRes, paymentsRes] = await Promise.all([
                    orderService.getMyOrders().catch(() => ({ data: { data: [] } })),
                    aiService.getMyDesigns().catch(() => ({ data: { data: [] } })),
                    paymentService.getHistory().catch(() => ({ data: { data: [] } }))
                ]);
                setOrders(ordersRes.data.data || ordersRes.data || []);
                setDesigns(designsRes.data.data || designsRes.data || []);
                setPaymentHistory(paymentsRes.data.data || paymentsRes.data || []);
            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <FiCheckCircle style={{ color: 'var(--success)' }} />;
            case 'pending': return <FiClock style={{ color: 'var(--warning)' }} />;
            case 'cancelled': return <FiAlertCircle style={{ color: 'var(--danger)' }} />;
            default: return <FiPackage style={{ color: 'var(--info)' }} />;
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'ud-status-completed';
            case 'pending': return 'ud-status-pending';
            case 'in progress': return 'ud-status-progress';
            case 'cancelled': return 'ud-status-cancelled';
            default: return 'ud-status-pending';
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiGrid /> },
        { id: 'orders', label: 'My Orders', icon: <FiShoppingBag /> },
        { id: 'designs', label: 'My Designs', icon: <FiImage /> },
        { id: 'payments', label: 'Payments', icon: <FiCreditCard /> },
    ];

    const renderOverview = () => (
        <div className="ud-overview">
            {/* Stats Cards */}
            <div className="ud-stats-row">
                <div className="ud-stat-card ud-stat-orders">
                    <div className="ud-stat-icon-wrap">
                        <FiShoppingBag />
                    </div>
                    <div className="ud-stat-info">
                        <span className="ud-stat-number">{orders.length}</span>
                        <span className="ud-stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="ud-stat-card ud-stat-designs">
                    <div className="ud-stat-icon-wrap">
                        <FiImage />
                    </div>
                    <div className="ud-stat-info">
                        <span className="ud-stat-number">{designs.length}</span>
                        <span className="ud-stat-label">Custom Designs</span>
                    </div>
                </div>
                <div className="ud-stat-card ud-stat-points">
                    <div className="ud-stat-icon-wrap">
                        <FiAward />
                    </div>
                    <div className="ud-stat-info">
                        <span className="ud-stat-number">{user?.loyaltyPoints || 0}</span>
                        <span className="ud-stat-label">Loyalty Points</span>
                    </div>
                </div>
                <div className="ud-stat-card ud-stat-member">
                    <div className="ud-stat-icon-wrap">
                        <FiStar />
                    </div>
                    <div className="ud-stat-info">
                        <span className="ud-stat-number" style={{ fontSize: '1.2rem' }}>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New'}
                        </span>
                        <span className="ud-stat-label">Member Since</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="ud-section">
                <h3 className="ud-section-title">Quick Actions</h3>
                <div className="ud-quick-actions">
                    <Link to="/ai-design" className="ud-action-card">
                        <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                            <FiImage />
                        </div>
                        <div className="ud-action-text">
                            <h4>Design Jewelry</h4>
                            <p>Create AI-powered custom designs</p>
                        </div>
                        <FiChevronRight className="ud-action-arrow" />
                    </Link>
                    <button onClick={() => setActiveTab('orders')} className="ud-action-card">
                        <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
                            <FiShoppingBag />
                        </div>
                        <div className="ud-action-text">
                            <h4>View Orders</h4>
                            <p>Track your order status</p>
                        </div>
                        <FiChevronRight className="ud-action-arrow" />
                    </button>
                    <Link to="/profile" className="ud-action-card">
                        <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                            <FiSettings />
                        </div>
                        <div className="ud-action-text">
                            <h4>Account Settings</h4>
                            <p>Update your profile details</p>
                        </div>
                        <FiChevronRight className="ud-action-arrow" />
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
                <div className="ud-section">
                    <div className="ud-section-header">
                        <h3 className="ud-section-title">Recent Orders</h3>
                        <button className="ud-link-btn" onClick={() => setActiveTab('orders')}>
                            View All <FiChevronRight />
                        </button>
                    </div>
                    <div className="ud-recent-orders">
                        {orders.slice(0, 3).map(order => (
                            <div key={order._id} className="ud-order-card">
                                <div className="ud-order-left">
                                    {getStatusIcon(order.status)}
                                    <div>
                                        <p className="ud-order-number">{order.orderNumber}</p>
                                        <p className="ud-order-date">
                                            <FiCalendar /> {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="ud-order-right">
                                    <span className={`ud-status-badge ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderOrders = () => (
        <div className="ud-section">
            <div className="ud-section-header">
                <h3 className="ud-section-title">My Orders</h3>
                <span className="ud-count-badge">{orders.length} orders</span>
            </div>
            {orders.length === 0 ? (
                <div className="ud-empty-state">
                    <div className="ud-empty-icon"><FiShoppingBag /></div>
                    <h4>No Orders Yet</h4>
                    <p>Your orders will appear here once you make a purchase.</p>
                </div>
            ) : (
                <div className="ud-orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="ud-order-item">
                            <div className="ud-order-item-left">
                                <div className="ud-order-icon-wrap">
                                    {getStatusIcon(order.status)}
                                </div>
                                {order.designImageUrl && (
                                    <div className="ud-order-image-preview" onClick={() => window.open(order.designImageUrl, '_blank')}>
                                        <img src={order.designImageUrl} alt="Design" />
                                    </div>
                                )}
                                <div className="ud-order-details">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <h4 className="ud-order-id">{order.orderNumber}</h4>
                                        {order.status === 'Pending' && order.estimatedPrice > 0 && (
                                            <span className="badge badge-gold pulse" style={{ fontSize: '0.65rem' }}>✨ PRICE QUOTE READY</span>
                                        )}
                                    </div>
                                    <div className="ud-order-meta">
                                        <span><FiCalendar /> {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        {order.material && <span><FiPackage /> {order.material}</span>}
                                    </div>
                                    {order.designDetails && (
                                        <p className="ud-order-description">{order.designDetails.substring(0, 80)}...</p>
                                    )}
                                </div>
                            </div>
                            <div className="ud-order-item-right">
                                {order.estimatedPrice > 0 && (
                                    <p className="ud-order-price">₹{order.estimatedPrice?.toLocaleString('en-IN')}</p>
                                )}
                                <span className={`ud-status-badge ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                                {order.status === 'Pending' && order.estimatedPrice > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        <button
                                            className="ud-pay-btn btn btn-sm btn-primary"
                                            disabled={payingOrderId === order._id}
                                            onClick={async () => {
                                                try {
                                                    setPayingOrderId(order._id);
                                                    const res = await paymentService.createCheckout({ orderId: order._id });
                                                    if (res.data?.data?.url) {
                                                        window.location.href = res.data.data.url;
                                                    }
                                                } catch (err) {
                                                    toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
                                                    setPayingOrderId(null);
                                                }
                                            }}
                                        >
                                            {payingOrderId === order._id ? (
                                                <><FiLoader className="ai-spin" /> Processing...</>
                                            ) : (
                                                <><FiCreditCard /> Pay Now</>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {order.status === 'Pending' && (!order.estimatedPrice || order.estimatedPrice === 0) && (
                                    <span className="ud-awaiting-price">⏳ Awaiting pricing</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDesigns = () => (
        <div className="ud-section">
            <div className="ud-section-header">
                <h3 className="ud-section-title">My Designs</h3>
                <Link to="/ai-design" className="ud-create-btn">
                    <FiPlus /> Create New
                </Link>
            </div>
            {designs.length === 0 ? (
                <div className="ud-empty-state">
                    <div className="ud-empty-icon"><FiImage /></div>
                    <h4>No Designs Yet</h4>
                    <p>Create your first custom jewelry design using our AI tool.</p>
                    <Link to="/ai-design" className="ud-cta-btn">
                        <FiPlus /> Design Your Jewelry
                    </Link>
                </div>
            ) : (
                <div className="ud-designs-grid">
                    {designs.map(design => (
                        <div key={design._id} className="ud-design-card">
                            <div className="ud-design-image">
                                <img src={getImageUrl(design.generatedImageURL)} alt={design.prompt} />
                                <div className="ud-design-overlay">
                                    <a href={getImageUrl(design.generatedImageURL)} download className="ud-design-dl-btn">
                                        <FiDownload />
                                    </a>
                                </div>
                            </div>
                            <div className="ud-design-info">
                                <h4>{design.jewelryType || 'Custom Design'}</h4>
                                <p>{design.metalType || 'Gold'} • {design.stoneType || 'Diamond'}</p>
                                <span className="ud-design-date">
                                    {new Date(design.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderPayments = () => (
        <div className="ud-section">
            <div className="ud-section-header">
                <h3 className="ud-section-title">Payment History</h3>
                <span className="ud-count-badge">{paymentHistory.length} transactions</span>
            </div>

            {paymentHistory.length === 0 ? (
                <div className="ud-empty-state">
                    <div className="ud-empty-icon"><FiCreditCard /></div>
                    <h4>No Payments Yet</h4>
                    <p>When you make a payment for an order, it will appear here.</p>
                </div>
            ) : (
                <div className="ud-table-container card">
                    <table className="ud-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Amount Paid</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map(payment => (
                                <tr key={payment._id}>
                                    <td className="ud-order-num">{payment.orderNumber}</td>
                                    <td className="ud-amount" style={{ color: 'var(--success)', fontWeight: 700 }}>
                                        ₹{payment.advancePayment?.toLocaleString('en-IN')}
                                    </td>
                                    <td>Online (Stripe)</td>
                                    <td><span className="badge badge-active">Paid</span></td>
                                    <td className="ud-date">
                                        {new Date(payment.updatedAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .ud-table-container {
                    overflow-x: auto;
                    padding: 0;
                    border: 1px solid var(--border);
                }
                .ud-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .ud-table th {
                    background: var(--bg-tertiary);
                    padding: 15px 20px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    border-bottom: 1px solid var(--border);
                }
                .ud-table td {
                    padding: 15px 20px;
                    font-size: 0.9rem;
                    border-bottom: 1px solid var(--border-light);
                }
                .ud-order-num {
                    font-weight: 600;
                    color: var(--primary);
                    font-family: monospace;
                }
                .ud-empty-table {
                    text-align: center;
                    padding: 40px !important;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );

    if (loading) {
        return (
            <div className="ud-loading">
                <div className="ud-loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <MainLayout title="My Dashboard">
            <div className="ud-dashboard-new">
                <header className="ud-custom-header">
                    <div className="ud-welcome-box">
                        <h1 className="ud-greeting">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="ud-subtitle">Here's what's happening with your jewelry</p>
                    </div>
                    <div className="ud-header-actions" style={{ display: 'flex', gap: 12 }}>
                        <Link to="/catalog" className="btn btn-secondary">
                            Browse Store
                        </Link>
                        <Link to="/ai-design" className="btn btn-primary">
                            <FiPlus /> New Design
                        </Link>
                    </div>
                </header>

                <div className="ud-tabs-nav card">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`ud-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="ud-tab-content fade-in">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'designs' && renderDesigns()}
                    {activeTab === 'payments' && renderPayments()}
                </div>
            </div>

            <style>{`
                .ud-dashboard-new {
                    padding: 0;
                }
                .ud-custom-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .ud-welcome-box h1 {
                    font-size: 1.8rem;
                    margin-bottom: 4px;
                }
                .ud-subtitle {
                    color: var(--text-muted);
                }
                .ud-tabs-nav {
                    display: flex;
                    gap: 10px;
                    padding: 8px;
                    margin-bottom: 25px;
                    background: var(--bg-secondary);
                }
                .ud-tab-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }
                .ud-tab-btn.active {
                    background: var(--primary-glow);
                    color: var(--primary);
                }
                .ud-tab-btn:hover:not(.active) {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }
                .ud-order-image-preview {
                    width: 50px;
                    height: 50px;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-right: 15px;
                    cursor: pointer;
                    border: 1px solid var(--border-light);
                }
                .ud-order-image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pulse {
                    animation: pulse-animation 2s infinite;
                }
                @keyframes pulse-animation {
                    0% { box-shadow: 0 0 0 0px rgba(212, 175, 55, 0.4); }
                    100% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
                }
                .ud-awaiting-price {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-style: italic;
                }
            `}</style>
        </MainLayout>
    );
};

export default UserDashboardPage;
