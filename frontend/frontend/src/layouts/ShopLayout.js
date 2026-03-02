import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';

const ShopLayout = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            <header style={{
                background: '#ffffff',
                color: 'var(--text-primary)',
                padding: '16px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-sm)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => navigate('/catalog')}>
                        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>
                            💎
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>New Priyanka Jewellery</h2>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <NavLink to="/catalog" style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '8px 16px', transition: 'color 0.2s' }} className={({ isActive }) => isActive ? 'active-nav-link text-primary' : ''}>
                        Our Collections
                    </NavLink>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }}></div>

                    {isAuthenticated() ? (
                        <>
                            <button
                                onClick={() => navigate(user.role === 'customer' ? '/user-dashboard' : '/dashboard')}
                                style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary-dark)', border: '1px solid var(--primary)', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'; e.currentTarget.style.color = 'var(--primary-dark)' }}
                            >
                                <FiUser /> {user.role === 'customer' ? 'My Dashboard' : 'Admin Panel'}
                            </button>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }}></div>
                            <button onClick={() => navigate('/cart')} title="Shopping Cart" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                <FiShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <FiLogOut size={22} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '30px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}>
                            <FiUser /> Sign In
                        </button>
                    )}
                </div>
            </header>

            <main style={{ flex: 1 }}>
                {children}
            </main>

            <footer style={{ background: '#ffffff', color: 'var(--text-secondary)', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 20 }}>💎</div>
                <h3 style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', marginBottom: 10 }}>New Priyanka Jewellery</h3>
                <p>Exquisite craftsmanship. Timeless elegance.</p>
                <div style={{ marginTop: 20, fontSize: '0.8rem' }}>
                    &copy; {new Date().getFullYear()} New Priyanka Jewellery. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default ShopLayout;
