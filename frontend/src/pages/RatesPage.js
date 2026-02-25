import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { rateService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { FiSave, FiTrendingUp, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RatesPage = () => {
    const [metalRates, setMetalRates] = useState([]);
    const [stoneRates, setStoneRates] = useState([]);
    const [history, setHistory] = useState([]);
    const [editMetal, setEditMetal] = useState({});
    const [editStone, setEditStone] = useState({});
    const { loading, execute } = useApi();
    const { isAdmin } = useAuth();

    useEffect(() => { loadRates(); loadHistory(); }, []);

    const loadRates = async () => {
        try {
            const [m, s] = await Promise.all([
                execute(() => rateService.getMetalRates()),
                execute(() => rateService.getStoneRates()),
            ]);
            setMetalRates(m.data); setStoneRates(s.data);
        } catch (err) { console.error(err); }
    };

    const loadHistory = async () => {
        try {
            const data = await execute(() => rateService.getPriceHistory({ limit: 20 }));
            setHistory(data.data);
        } catch (err) { console.error(err); }
    };

    const updateMetal = async (metal) => {
        if (!editMetal[metal]) return;
        try {
            await execute(() => rateService.updateMetalRate({ metal, ratePerGram: parseFloat(editMetal[metal]) }));
            toast.success(`${metal} rate updated! 🥇`);
            setEditMetal({}); loadRates(); loadHistory();
        } catch (err) { toast.error('Failed to update rate'); }
    };

    const updateStone = async (stoneType) => {
        if (!editStone[stoneType]) return;
        try {
            await execute(() => rateService.updateStoneRate({ stoneType, ratePerCarat: parseFloat(editStone[stoneType]) }));
            toast.success(`${stoneType} rate updated! 💎`);
            setEditStone({}); loadRates(); loadHistory();
        } catch (err) { toast.error('Failed to update rate'); }
    };

    const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a || 0);

    if (loading && !metalRates.length) return <MainLayout title="Rates"><LoadingSpinner /></MainLayout>;

    return (
        <MainLayout title="Price Rates">
            <div className="page-header"><div><h1>Dynamic Price Rates</h1><p>Manage metal and stone rates for dynamic pricing</p></div></div>

            {/* Metal Rates */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>🥇 Metal Rates (per gram)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                    {metalRates.map((r) => (
                        <div key={r._id || r.metal} style={{ padding: 20, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 8 }}>{r.metal}</p>
                            <h3 style={{ fontSize: '1.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--primary)', marginBottom: 8 }}>{fmt(r.ratePerGram)}</h3>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                <span className={`badge ${r.source === 'api' ? 'badge-active' : 'badge-pending'}`}>{r.source}</span>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated: {r.lastUpdated ? new Date(r.lastUpdated).toLocaleString('en-IN') : 'N/A'}</p>
                            {isAdmin() && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <input type="number" className="form-control" placeholder="New rate" value={editMetal[r.metal] || ''}
                                        onChange={(e) => setEditMetal({ ...editMetal, [r.metal]: e.target.value })} style={{ flex: 1 }} />
                                    <button className="btn btn-primary btn-sm" onClick={() => updateMetal(r.metal)} disabled={!editMetal[r.metal]}><FiSave /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stone Rates */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>💎 Stone Rates (per carat)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {stoneRates.filter(r => r.stoneType !== 'none').map((r) => (
                        <div key={r._id || r.stoneType} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <p style={{ textTransform: 'capitalize', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{r.stoneType}</p>
                            <h4 style={{ fontSize: '1.2rem', fontFamily: 'Inter, sans-serif', color: 'var(--primary)' }}>{fmt(r.ratePerCarat)}</h4>
                            {isAdmin() && (
                                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                                    <input type="number" className="form-control" placeholder="Rate" value={editStone[r.stoneType] || ''}
                                        onChange={(e) => setEditStone({ ...editStone, [r.stoneType]: e.target.value })} style={{ flex: 1, fontSize: '0.8rem', padding: 8 }} />
                                    <button className="btn btn-primary btn-sm" onClick={() => updateStone(r.stoneType)} disabled={!editStone[r.stoneType]}><FiSave size={12} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price History */}
            <div className="table-container">
                <div className="table-header"><h2>📈 Rate Update History</h2></div>
                <table className="data-table">
                    <thead><tr><th>Type</th><th>Name</th><th>Rate</th><th>Source</th><th>Date</th></tr></thead>
                    <tbody>
                        {history.length === 0 ? <tr><td colSpan="5" className="empty-state"><p>No history</p></td></tr> :
                            history.map((h) => (
                                <tr key={h._id}>
                                    <td><span className={`badge ${h.type === 'metal' ? 'badge-gold' : 'badge-in-progress'}`}>{h.type}</span></td>
                                    <td style={{ textTransform: 'capitalize' }}>{h.name}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(h.rate)}</td>
                                    <td><span className={`badge ${h.source === 'api' ? 'badge-active' : 'badge-pending'}`}>{h.source}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(h.recordedAt).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default RatesPage;
