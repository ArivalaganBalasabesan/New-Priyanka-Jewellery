import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { reportService } from '../services/endpoints';
import { FiDollarSign, FiTrendingUp, FiBarChart2, FiBox } from 'react-icons/fi';

const ReportsPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [salesReport, setSalesReport] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { loading, execute } = useApi();

    useEffect(() => { loadReports(); }, []);

    const loadReports = async () => {
        try {
            const [d, tp] = await Promise.all([
                execute(() => reportService.getDashboard()),
                execute(() => reportService.getTopProducts(10)),
            ]);
            setDashboard(d.data); setTopProducts(tp.data);
        } catch (err) { console.error(err); }
    };

    const loadSalesReport = async () => {
        if (!startDate || !endDate) return;
        try {
            const data = await execute(() => reportService.getSalesReport({ startDate, endDate }));
            setSalesReport(data.data);
        } catch (err) { console.error(err); }
    };

    const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a || 0);

    if (loading && !dashboard) return <MainLayout title="Reports"><LoadingSpinner /></MainLayout>;

    return (
        <MainLayout title="Reports">
            <div className="page-header"><div><h1>Reports & Analytics</h1><p>Business insights and performance metrics</p></div></div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon gold"><FiDollarSign /></div><div className="stat-info"><h3>{fmt(dashboard?.totalRevenue)}</h3><p>Total Revenue</p></div></div>
                <div className="stat-card"><div className="stat-icon green"><FiTrendingUp /></div><div className="stat-info"><h3>{fmt(dashboard?.monthlyRevenue)}</h3><p>Monthly Revenue</p></div></div>
                <div className="stat-card"><div className="stat-icon blue"><FiBarChart2 /></div><div className="stat-info"><h3>{dashboard?.totalTransactions || 0}</h3><p>Total Transactions</p></div></div>
                <div className="stat-card"><div className="stat-icon orange"><FiBox /></div><div className="stat-info"><h3>{dashboard?.totalProducts || 0}</h3><p>Active Products</p></div></div>
            </div>

            {/* Sales Report by Date */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>📊 Sales Report by Date Range</h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
                    <div className="form-group" style={{ margin: 0 }}><label>Start Date</label><input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                    <div className="form-group" style={{ margin: 0 }}><label>End Date</label><input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                    <button className="btn btn-primary" onClick={loadSalesReport}>Generate</button>
                </div>
                {salesReport && (
                    <div>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
                            <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Revenue</span><h4 style={{ color: 'var(--primary)' }}>{fmt(salesReport.summary?.totalRevenue)}</h4></div>
                            <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions</span><h4>{salesReport.summary?.totalTransactions}</h4></div>
                            <div><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Transaction</span><h4>{fmt(salesReport.summary?.averageTransaction)}</h4></div>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Date</th><th>Revenue</th><th>Transactions</th></tr></thead>
                            <tbody>
                                {salesReport.dailyBreakdown?.map((d) => (
                                    <tr key={d._id}><td>{d._id}</td><td style={{ fontWeight: 600 }}>{fmt(d.totalRevenue)}</td><td>{d.count}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Top Products */}
            <div className="table-container">
                <div className="table-header"><h2>🏆 Most Sold Products</h2></div>
                <table className="data-table">
                    <thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                    <tbody>
                        {topProducts.length === 0 ? <tr><td colSpan="4" className="empty-state"><p>No data</p></td></tr> :
                            topProducts.map((p, i) => (
                                <tr key={p._id}>
                                    <td><span className="badge badge-gold">{i + 1}</span></td>
                                    <td style={{ fontWeight: 600 }}>{p.productName}</td>
                                    <td>{p.totalQuantity}</td>
                                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{fmt(p.totalRevenue)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default ReportsPage;
