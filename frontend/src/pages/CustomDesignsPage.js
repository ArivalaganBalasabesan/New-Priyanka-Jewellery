import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { orderService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiCheck, FiDollarSign, FiEye, FiImage, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CustomDesignsPage = () => {
    const [orders, setOrders] = useState([]);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => { loadCustomDesigns(); }, []);

    const loadCustomDesigns = async () => {
        try {
            const data = await execute(() => orderService.getAll({ limit: 100, hasDesignImage: 'true' }));
            setOrders(data.data || []);
        } catch (err) { console.error(err); }
    };

    const onSetPrice = async (formData) => {
        try {
            await execute(() => orderService.update(selectedOrder._id, {
                estimatedPrice: formData.price,
                specialInstructions: formData.notes,
                isAdminSeen: true // Mark as seen when price is set as well
            }));
            toast.success(`Price updated and sent to ${selectedOrder.customerId?.name || 'customer'}! ✨`);
            setShowPriceModal(false);
            setSelectedOrder(null);
            reset();
            loadCustomDesigns();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to update price'); }
    };

    const handleMarkAsSeen = async (order) => {
        if (!order.isAdminSeen) {
            try {
                await orderService.markAsSeen(order._id);
                setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isAdminSeen: true } : o));
            } catch (err) { console.error('Error marking as seen', err); }
        }
    };

    const openPricingModal = (order) => {
        handleMarkAsSeen(order);
        setSelectedOrder(order);
        setValue('price', order.estimatedPrice || '');
        setValue('notes', order.specialInstructions || '');
        setShowPriceModal(true);
    };

    const statusBadge = (s) => {
        const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-in-progress', 'Completed': 'badge-completed', 'Cancelled': 'badge-cancelled' };
        return map[s] || 'badge-pending';
    };

    const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a || 0);

    return (
        <MainLayout title="Custom Design Requests">
            <div className="page-header">
                <div>
                    <h1>AI & Custom Designs</h1>
                    <p>Review and price unique customer design requests</p>
                </div>
            </div>

            {loading && orders.length === 0 ? <LoadingSpinner /> : (
                <div className="custom-designs-grid">
                    {orders.length === 0 ? (
                        <div className="card empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                            <FiImage size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                            <h3>No custom designs yet</h3>
                            <p>Customer AI requests and image uploads will appear here.</p>
                        </div>
                    ) : (
                        orders.map((o) => (
                            <div key={o._id} className="card design-card" onClick={() => handleMarkAsSeen(o)}>
                                <div className="design-image-track">
                                    <img src={o.designImageUrl} alt="Design" onClick={() => window.open(o.designImageUrl, '_blank')} />
                                    <div className="design-status-overlay">
                                        {!o.isAdminSeen && <span className="badge badge-new pulse-new">NEW</span>}
                                        <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
                                    </div>
                                </div>
                                <div className="design-card-body">
                                    <div className="design-card-header">
                                        <h4>{o.orderNumber}</h4>
                                        <div className="price-tag">{fmt(o.estimatedPrice)}</div>
                                    </div>
                                    <div className="design-customer">
                                        <strong>{o.customerId?.name || 'Guest'}</strong>
                                        <span>Ordered: {new Date(o.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="design-details-text">
                                        {o.designDetails}
                                    </div>
                                    <div className="design-footer">
                                        <div className="material-tag">
                                            <FiInfo size={12} /> {o.material}
                                        </div>
                                        <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); openPricingModal(o); }}>
                                            <FiDollarSign /> Set Price
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Modal isOpen={showPriceModal} onClose={() => setShowPriceModal(false)} title="Set Order Price" size="md">
                {selectedOrder && (
                    <div className="pricing-modal-content">
                        <div className="mini-design-info">
                            <img src={selectedOrder.designImageUrl} alt="Preview" />
                            <div>
                                <strong>Request from {selectedOrder.customerId?.name}</strong>
                                <p>{selectedOrder.designDetails}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(onSetPrice)} style={{ marginTop: 20 }}>
                            <div className="form-group">
                                <label>Final Estimated Price (₹) *</label>
                                <input type="number" className="form-control" {...register('price', { required: 'Price is required', min: 0 })} placeholder="0.00" />
                                <small className="text-muted">Setting this will enable the "Pay Now" button for the customer.</small>
                            </div>
                            <div className="form-group">
                                <label>Notes for Customer</label>
                                <textarea className="form-control" rows="3" {...register('notes')} placeholder="Explain the pricing (e.g. based on 4g 22k gold)..." />
                            </div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPriceModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <LoadingSpinner size="sm" /> : <FiCheck />} Confirm & Send Quote
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            <style>{`
                .custom-designs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 20px;
                }
                .design-card {
                    padding: 0 !important;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s;
                }
                .design-card:hover {
                    transform: translateY(-5px);
                }
                .design-image-track {
                    height: 200px;
                    position: relative;
                    background: #f8f9fa;
                    cursor: zoom-in;
                }
                .design-image-track img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .design-status-overlay {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                }
                .design-card-body {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .design-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .design-card-header h4 {
                    font-size: 0.9rem;
                    color: var(--primary);
                    font-weight: 700;
                }
                .price-tag {
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .design-customer {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 12px;
                }
                .design-customer strong {
                    font-size: 0.95rem;
                }
                .design-customer span {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .design-details-text {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    min-height: 3.6em;
                }
                .design-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 12px;
                    border-top: 1px solid var(--border-light);
                }
                .material-tag {
                    font-size: 0.75rem;
                    text-transform: capitalize;
                    background: var(--bg-tertiary);
                    padding: 4px 8px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .mini-design-info {
                    display: flex;
                    gap: 15px;
                    padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }
                .mini-design-info img {
                    width: 60px;
                    height: 60px;
                    border-radius: 6px;
                    object-fit: cover;
                }
                .mini-design-info div {
                    flex: 1;
                }
                .mini-design-info strong {
                    font-size: 0.9rem;
                    display: block;
                    margin-bottom: 4px;
                }
                .mini-design-info p {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin: 0;
                }
                .badge-new {
                    background: #ef4444;
                    color: white;
                    font-weight: 800;
                    font-size: 0.65rem;
                }
                .pulse-new {
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    animation: pulse-red 2s infinite;
                }
                @keyframes pulse-red {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .design-status-overlay {
                    display: flex;
                    gap: 6px;
                }
            `}</style>
        </MainLayout>
    );
};

export default CustomDesignsPage;
