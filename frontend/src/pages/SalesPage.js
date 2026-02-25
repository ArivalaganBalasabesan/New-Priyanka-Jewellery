import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { saleService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEye, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [pagination, setPagination] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(null);
    const [saleItems, setSaleItems] = useState([{ productId: '', quantity: 1 }]);
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => { loadSales(); }, []);

    const loadSales = async (page = 1) => {
        try {
            const data = await execute(() => saleService.getAll({ page, limit: 20 }));
            setSales(data.data);
            setPagination(data.pagination);
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (formData) => {
        try {
            await execute(() => saleService.create({
                customerId: formData.customerId,
                items: saleItems.filter(i => i.productId),
                discount: parseFloat(formData.discount) || 0,
                discountType: formData.discountType || 'fixed',
                paymentStatus: formData.paymentStatus || 'pending',
                paymentMethod: formData.paymentMethod || 'cash',
            }));
            toast.success('Sale created successfully! 💰');
            setShowCreateModal(false); reset();
            setSaleItems([{ productId: '', quantity: 1 }]);
            loadSales();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create sale'); }
    };

    const viewInvoice = async (id) => {
        try {
            const data = await execute(() => saleService.getById(id));
            setShowInvoice(data.data);
        } catch (err) { console.error(err); }
    };

    const cancelSale = async (id) => {
        if (!window.confirm('Cancel this sale?')) return;
        try {
            await execute(() => saleService.cancel(id, 'Cancelled by admin'));
            toast.success('Sale cancelled');
            loadSales();
        } catch (err) { toast.error('Failed to cancel sale'); }
    };

    const addItem = () => setSaleItems([...saleItems, { productId: '', quantity: 1 }]);
    const removeItem = (i) => setSaleItems(saleItems.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => {
        const u = [...saleItems]; u[i][field] = field === 'quantity' ? parseInt(val) : val; setSaleItems(u);
    };

    const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a || 0);

    return (
        <MainLayout title="Sales & Billing">
            <div className="page-header">
                <div><h1>Sales & Billing</h1><p>Create sales and generate invoices</p></div>
                <button className="btn btn-primary" onClick={() => { reset(); setSaleItems([{ productId: '', quantity: 1 }]); setShowCreateModal(true); }}><FiPlus /> New Sale</button>
            </div>

            {loading && !sales.length ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Invoice</th><th>Customer</th><th>Items</th><th>Final Amount</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {sales.length === 0 ? <tr><td colSpan="7" className="empty-state"><p>No sales found</p></td></tr> :
                                sales.map((s) => (
                                    <tr key={s._id}>
                                        <td><span className="badge badge-gold">{s.invoiceNumber}</span></td>
                                        <td>{s.customerId?.name || 'N/A'}</td>
                                        <td>{s.items?.length || 0}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{fmt(s.finalAmount)}</td>
                                        <td><span className={`badge badge-${s.paymentStatus}`}>{s.paymentStatus}</span></td>
                                        <td style={{ fontSize: '0.8rem' }}>{new Date(s.saleDate).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-icon" onClick={() => viewInvoice(s._id)}><FiEye size={14} /></button>
                                                {!s.isCancelled && <button className="btn-icon" onClick={() => cancelSale(s._id)} style={{ color: 'var(--danger)' }}><FiXCircle size={14} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Sale" size="lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Customer ID *</label>
                        <input className="form-control" {...register('customerId', { required: 'Required' })} placeholder="Customer ID" />
                    </div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Items</label>
                    {saleItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input className="form-control" placeholder="Product ID" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} style={{ flex: 2 }} />
                            <input type="number" className="form-control" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} min="1" style={{ flex: 1 }} />
                            {saleItems.length > 1 && <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--danger)' }}><FiXCircle /></button>}
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom: 16 }}><FiPlus /> Add Item</button>
                    <div className="form-row">
                        <div className="form-group"><label>Discount</label><input type="number" className="form-control" {...register('discount')} placeholder="0" /></div>
                        <div className="form-group"><label>Payment</label><select className="form-control" {...register('paymentStatus')}><option value="pending">Pending</option><option value="paid">Paid</option></select></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Create Sale'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!showInvoice} onClose={() => setShowInvoice(null)} title="Invoice" size="lg">
                {showInvoice && (
                    <div className="invoice">
                        <div className="invoice-header">
                            <div><h1>New Priyanka Jewellery</h1><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tax Invoice</p></div>
                            <div className="invoice-meta"><span><strong>{showInvoice.invoiceNumber}</strong></span><span>{new Date(showInvoice.saleDate).toLocaleDateString('en-IN')}</span></div>
                        </div>
                        <p style={{ marginBottom: 16 }}><strong>Customer:</strong> {showInvoice.customerId?.name} | {showInvoice.customerId?.phone}</p>
                        <table className="data-table">
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                            <tbody>{showInvoice.items?.map((it, i) => (<tr key={i}><td>{it.productName}</td><td>{it.quantity}</td><td>{fmt(it.unitPrice)}</td><td>{fmt(it.itemTotal)}</td></tr>))}</tbody>
                        </table>
                        <div className="invoice-totals">
                            <div className="row"><span>Subtotal:</span><span>{fmt(showInvoice.subtotal)}</span></div>
                            <div className="row"><span>Discount:</span><span>-{fmt(showInvoice.discount)}</span></div>
                            <div className="row"><span>Tax ({showInvoice.taxRate}%):</span><span>+{fmt(showInvoice.taxAmount)}</span></div>
                            <div className="row total"><span>Final:</span><span>{fmt(showInvoice.finalAmount)}</span></div>
                        </div>
                    </div>
                )}
            </Modal>
        </MainLayout>
    );
};

export default SalesPage;
