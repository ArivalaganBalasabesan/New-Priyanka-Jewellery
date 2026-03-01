import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { orderService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiXCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [editingOrder, setEditingOrder] = useState(null);

    useEffect(() => { loadOrders(); }, [filter]);

    const loadOrders = async () => {
        try {
            const params = { limit: 50 };
            if (filter) params.status = filter;
            const data = await execute(() => orderService.getAll(params));
            setOrders(data.data);
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (formData) => {
        try {
            if (editingOrder) {
                await execute(() => orderService.update(editingOrder._id, formData));
                toast.success('Order updated successfully! ✨');
            } else {
                await execute(() => orderService.create(formData));
                toast.success('Order created successfully! 📋');
            }
            setShowModal(false);
            setEditingOrder(null);
            reset();
            loadOrders();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save order'); }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setShowModal(true);
        // Map data to form fields
        setValue('customerId', order.customerId?._id || order.customerId);
        setValue('designDetails', order.designDetails);
        setValue('material', order.material);
        setValue('estimatedPrice', order.estimatedPrice);
        setValue('advancePayment', order.advancePayment);
        setValue('deliveryDate', new Date(order.deliveryDate).toISOString().split('T')[0]);
        setValue('specialInstructions', order.specialInstructions);
    };

    const updateStatus = async (id, status) => {
        try {
            await execute(() => orderService.updateStatus(id, status));
            toast.success(`Order status updated to ${status}`);
            loadOrders();
        } catch (err) { toast.error('Failed to update status'); }
    };

    const cancelOrder = async (id) => {
        if (!window.confirm('Cancel this order?')) return;
        try {
            await execute(() => orderService.cancel(id, 'Cancelled'));
            toast.success('Order cancelled');
            loadOrders();
        } catch (err) { toast.error('Failed to cancel order'); }
    };

    const statusBadge = (s) => {
        const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-in-progress', 'Completed': 'badge-completed', 'Cancelled': 'badge-cancelled' };
        return map[s] || 'badge-pending';
    };

    const fmt = (a) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(a || 0);

    return (
        <MainLayout title="Custom Orders">
            <div className="page-header">
                <div><h1>Custom Order Management</h1><p>Manage custom jewelry orders</p></div>
                <button className="btn btn-primary" onClick={() => { reset(); setShowModal(true); }}><FiPlus /> New Order</button>
            </div>

            <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                {['', 'Pending', 'In Progress', 'Completed'].map(s => (
                    <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Order #</th><th>Customer</th><th>Design</th><th>Material</th><th>Price</th><th>Status</th><th>Delivery</th><th>Actions</th></tr></thead>
                        <tbody>
                            {orders.length === 0 ? <tr><td colSpan="8" className="empty-state"><p>No orders found</p></td></tr> :
                                orders.map((o) => (
                                    <tr key={o._id}>
                                        <td><span className="badge badge-gold">{o.orderNumber}</span></td>
                                        <td>{o.customerId?.name || 'N/A'}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.designDetails}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{o.material}</td>
                                        <td style={{ fontWeight: 600 }}>{fmt(o.estimatedPrice)}</td>
                                        <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                                        <td style={{ fontSize: '0.8rem' }}>{new Date(o.deliveryDate).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn-icon" title="Edit" onClick={() => handleEdit(o)} style={{ color: 'var(--primary)' }}><FiEdit size={14} /></button>
                                                {o.status === 'Pending' && <button className="btn-icon" title="Start" onClick={() => updateStatus(o._id, 'In Progress')} style={{ color: 'var(--info)' }}><FiClock size={14} /></button>}
                                                {o.status === 'In Progress' && <button className="btn-icon" title="Complete" onClick={() => updateStatus(o._id, 'Completed')} style={{ color: 'var(--success)' }}><FiCheckCircle size={14} /></button>}
                                                {o.status !== 'Completed' && o.status !== 'Cancelled' && <button className="btn-icon" title="Cancel" onClick={() => cancelOrder(o._id)} style={{ color: 'var(--danger)' }}><FiXCircle size={14} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingOrder(null); }} title={editingOrder ? "Edit Order" : "Create Custom Order"} size="lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group"><label>Customer ID *</label><input className="form-control" {...register('customerId', { required: 'Required' })} /></div>
                    <div className="form-group"><label>Design Details *</label><textarea className="form-control" rows="3" {...register('designDetails', { required: 'Required' })} placeholder="Describe the custom design..." /></div>
                    <div className="form-row">
                        <div className="form-group"><label>Material *</label><select className="form-control" {...register('material', { required: 'Required' })}><option value="">Select</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="platinum">Platinum</option></select></div>
                        <div className="form-group"><label>Est. Price (₹) *</label><input type="number" className="form-control" {...register('estimatedPrice', { required: 'Required', min: 0 })} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>Advance Payment (₹)</label><input type="number" className="form-control" {...register('advancePayment')} placeholder="0" /></div>
                        <div className="form-group"><label>Delivery Date *</label><input type="date" className="form-control" {...register('deliveryDate', { required: 'Required' })} /></div>
                    </div>
                    <div className="form-group"><label>Special Instructions</label><textarea className="form-control" rows="2" {...register('specialInstructions')} /></div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Order'}</button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default OrdersPage;
