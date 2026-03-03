import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { inventoryService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiAlertTriangle, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showLowStock, setShowLowStock] = useState(false);
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        loadInventory();
        loadLowStock();
        loadProducts();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await execute(() => inventoryService.getAll({ limit: 100 }));
            setInventory(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await execute(() => import('../services/endpoints').then(m => m.productService.getAll({ limit: 1000 })));
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to load products', err);
        }
    };

    const loadLowStock = async () => {
        try {
            const data = await execute(() => inventoryService.getLowStock());
            setLowStockAlerts(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (formData) => {
        try {
            await execute(() => inventoryService.addStock({
                productId: formData.productId,
                quantity: parseInt(formData.quantity),
            }));
            toast.success('Stock added successfully! 📦');
            setShowModal(false);
            reset();
            loadInventory();
            loadLowStock();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to add stock');
        }
    };

    return (
        <MainLayout title="Inventory">
            <div className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p>Track stock levels and manage inventory</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowLowStock(!showLowStock)}>
                        <FiAlertTriangle /> Low Stock ({lowStockAlerts.length})
                    </button>
                    <button className="btn btn-primary" onClick={() => { reset(); setShowModal(true); }}>
                        <FiPlus /> Add Stock
                    </button>
                </div>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStockAlerts.length > 0 && (
                <div className="card" style={{
                    marginBottom: 20,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    background: 'var(--danger-bg)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FiAlertTriangle style={{ color: 'var(--danger)', fontSize: '1.2rem' }} />
                        <div>
                            <strong style={{ color: 'var(--danger)' }}>{lowStockAlerts.length} items are low on stock!</strong>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                                {lowStockAlerts.slice(0, 3).map(item => item.productId?.name).filter(Boolean).join(', ')}
                                {lowStockAlerts.length > 3 && ` and ${lowStockAlerts.length - 3} more...`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Material</th>
                                <th>Quantity</th>
                                <th>Threshold</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length === 0 ? (
                                <tr><td colSpan="8" className="empty-state"><p>No inventory records</p></td></tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item._id}>
                                        <td style={{ fontWeight: 600 }}>{item.productId?.name || 'N/A'}</td>
                                        <td><span className="badge badge-gold">{item.productId?.sku || '-'}</span></td>
                                        <td>{item.productId?.category || '-'}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{item.productId?.material || '-'}</td>
                                        <td style={{ fontWeight: 700, color: item.isLowStock ? 'var(--danger)' : 'var(--success)' }}>
                                            {item.quantity}
                                        </td>
                                        <td>{item.lowStockThreshold}</td>
                                        <td>
                                            {item.quantity === 0 ? (
                                                <span className="badge badge-cancelled">Out of Stock</span>
                                            ) : item.isLowStock ? (
                                                <span className="badge badge-pending">Low Stock</span>
                                            ) : (
                                                <span className="badge badge-active">In Stock</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Stock Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Stock" size="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Select Product (by SKU / Name)</label>
                        <select
                            className="form-control"
                            {...register('productId', { required: 'Please select a product' })}
                        >
                            <option value="">-- Choose Product to Restock --</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>
                                    [{p.sku}] {p.name}
                                </option>
                            ))}
                        </select>
                        {errors.productId && <span className="form-error">{errors.productId.message}</span>}
                    </div>
                    <div className="form-group">
                        <label>Quantity to Add</label>
                        <input type="number" className="form-control"
                            {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Must be >= 1' } })}
                            placeholder="e.g. 10" />
                        {errors.quantity && <span className="form-error">{errors.quantity.message}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default InventoryPage;
