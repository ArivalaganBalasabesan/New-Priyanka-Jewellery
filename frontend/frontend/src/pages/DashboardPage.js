import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { reportService, rateService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import {
    FiDollarSign, FiTrendingUp, FiShoppingCart, FiBox,
    FiUsers, FiAlertTriangle, FiClipboard, FiBarChart2
} from 'react-icons/fi';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [rates, setRates] = useState([]);
    const { loading, execute } = useApi();

    useEffect(() => {
        if (user?.role === 'customer') {
            navigate('/user-dashboard', { replace: true });
        } else {
            loadDashboard();
        }
    }, [user, navigate]);

    const loadDashboard = async () => {
        try {
            const [dashData, rateData] = await Promise.all([
                execute(() => reportService.getDashboard()),
                execute(() => rateService.getMetalRates()),
            ]);
            setDashboard(dashData.data);
            setRates(rateData.data);
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading && !dashboard) return <MainLayout title="Dashboard"><LoadingSpinner /></MainLayout>;

    const stats = [
        {
            icon: <FiDollarSign />,
            iconClass: 'gold',
            label: "Today's Revenue",
            value: formatCurrency(dashboard?.dailyRevenue),
        },
        {
            icon: <FiTrendingUp />,
            iconClass: 'green',
            label: 'Monthly Revenue',
            value: formatCurrency(dashboard?.monthlyRevenue),
        },
        {
            icon: <FiBarChart2 />,
            iconClass: 'blue',
            label: 'Total Revenue',
            value: formatCurrency(dashboard?.totalRevenue),
        },
        {
            icon: <FiShoppingCart />,
            iconClass: 'gold',
            label: "Today's Sales",
            value: dashboard?.dailyTransactions || 0,
        },
        {
            icon: <FiBox />,
            iconClass: 'blue',
            label: 'Total Products',
            value: dashboard?.totalProducts || 0,
        },
        {
            icon: <FiUsers />,
            iconClass: 'green',
            label: 'Active Customers',
            value: dashboard?.totalCustomers || 0,
        },
        {
            icon: <FiClipboard />,
            iconClass: 'orange',
            label: 'Pending Orders',
            value: dashboard?.pendingOrders || 0,
        },
        {
            icon: <FiAlertTriangle />,
            iconClass: 'red',
            label: 'Low Stock Items',
            value: dashboard?.lowStockCount || 0,
        },
    ];

    return (
        <MainLayout title="Dashboard">
            <div className="page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back! Here's your business summary.</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className={`stat-icon ${stat.iconClass}`}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Metal Rates Section */}
            <div className="card" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: '1.1rem' }}>💰 Live Metal Rates</h2>
                    <span className="badge badge-gold">Auto Updated</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {rates.map((rate) => (
                        <div key={rate._id || rate.metal} style={{
                            padding: 20,
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                {rate.metal}
                            </p>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'Inter, sans-serif', color: 'var(--primary)' }}>
                                {formatCurrency(rate.ratePerGram)}
                            </h3>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>per gram</p>
                            <span className={`badge ${rate.source === 'api' ? 'badge-active' : 'badge-pending'}`} style={{ marginTop: 8 }}>
                                {rate.source || 'manual'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 24 }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📊 Sales Summary</h3>
                    <div style={{ space: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Daily Transactions</span>
                            <strong>{dashboard?.dailyTransactions || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monthly Transactions</span>
                            <strong>{dashboard?.monthlyTransactions || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total All Time</span>
                            <strong>{dashboard?.totalTransactions || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📋 Order Status</h3>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Orders</span>
                            <span className="badge badge-pending">{dashboard?.pendingOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>In Progress</span>
                            <span className="badge badge-in-progress">{dashboard?.inProgressOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Low Stock Alerts</span>
                            <span className="badge badge-cancelled">{dashboard?.lowStockCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default DashboardPage;
