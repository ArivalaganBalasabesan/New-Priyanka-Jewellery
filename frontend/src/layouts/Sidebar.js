import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/endpoints';
import {
    FiGrid, FiBox, FiPackage, FiShoppingCart, FiUsers,
    FiClipboard, FiDollarSign, FiBarChart2, FiSettings,
    FiLogOut, FiTrendingUp, FiShoppingBag, FiImage, FiHeart
} from 'react-icons/fi';

const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();
    const [pendingDesignCount, setPendingDesignCount] = useState(0);

    useEffect(() => {
        if (user?.role !== 'customer') {
            loadPendingCounts();
        }
    }, [user, location.pathname]);

    const loadPendingCounts = async () => {
        try {
            // Fetch orders that have a design image and are NOT yet seen by admin
            const res = await orderService.getAll({ limit: 100, hasDesignImage: 'true' });
            const ordersArray = res.data.data || [];
            // Count only items that are NOT seen by admin
            const unseen = ordersArray.filter(o => o.isAdminSeen === false);
            setPendingDesignCount(unseen.length);
        } catch (err) { console.error('Error fetching sidebar counts', err); }
    };

    const staffItems = [
        { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
        { path: '/products', icon: <FiBox />, label: 'Products' },
        { path: '/inventory', icon: <FiPackage />, label: 'Inventory' },
        { path: '/sales', icon: <FiShoppingCart />, label: 'Sales & Billing' },
        { path: '/customers', icon: <FiUsers />, label: 'Customers' },
        {
            path: '/design-requests',
            icon: (
                <div style={{ position: 'relative' }}>
                    <FiImage />
                    {pendingDesignCount > 0 && (
                        <span className="cart-badge" style={{
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '2px 5px',
                            minWidth: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid white',
                            top: '-6px',
                            right: '-8px'
                        }}>
                            {pendingDesignCount}
                        </span>
                    )}
                </div>
            ),
            label: 'Design Requests'
        },
        { path: '/orders', icon: <FiClipboard />, label: 'All Orders' },
        { path: '/rates', icon: <FiDollarSign />, label: 'Price Rates' },
    ];

    const customerItems = [
        { path: '/user-dashboard', icon: <FiGrid />, label: 'My Dashboard' },
        { path: '/catalog', icon: <FiShoppingBag />, label: 'Shop Collection' },
        {
            path: '/cart',
            icon: (
                <div style={{ position: 'relative' }}>
                    <FiShoppingCart />
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </div>
            ),
            label: 'Shopping Cart'
        },
        { path: '/ai-design', icon: <FiImage />, label: 'AI Designer' },
    ];

    const adminItems = [
        { path: '/reports', icon: <FiBarChart2 />, label: 'Reports' },
        { path: '/users', icon: <FiSettings />, label: 'User Management' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div style={{
                    width: 44, height: 44, margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                }}>
                    💎
                </div>
                <h2>New Priyanka</h2>
                <p>Jewellery</p>
            </div>

            <nav className="sidebar-nav">
                {!user ? (
                    <>
                        <div className="nav-section-title">Discover</div>
                        <NavLink to="/catalog" className={`nav-item ${location.pathname === '/catalog' ? 'active' : ''}`}>
                            <FiShoppingBag />
                            <span>Shop Collection</span>
                        </NavLink>
                        <NavLink to="/login" className="nav-item">
                            <FiLogOut />
                            <span>Login to Order</span>
                        </NavLink>
                    </>
                ) : user?.role === 'customer' ? (
                    <>
                        <div className="nav-section-title">Store</div>
                        {customerItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="nav-section-title">Main Menu</div>
                        {staffItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </>
                )}

                {isAdmin() && (
                    <>
                        <div className="nav-section-title" style={{ marginTop: 16 }}>Administration</div>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            <div style={{
                padding: '16px 12px',
                borderTop: '1px solid var(--border)',
                marginTop: 'auto'
            }}>
                <NavLink
                    to="/profile"
                    className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                    style={{ marginBottom: 8 }}
                >
                    <div style={{
                        width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', marginRight: 10,
                        background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700
                    }}>
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase()
                        )}
                    </div>
                    <span>Settings</span>
                </NavLink>
                <button
                    onClick={logout}
                    className="nav-item"
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--danger)',
                    }}
                >
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
