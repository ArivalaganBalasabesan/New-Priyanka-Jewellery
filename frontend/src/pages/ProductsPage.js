import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { productService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ category: '', material: '' });
    const { loading, execute } = useApi();

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        loadProducts();
    }, [search, filters]);

    const loadProducts = async (page = 1) => {
        try {
            const params = { page, limit: 20, search };
            if (filters.category) params.category = filters.category;
            if (filters.material) params.material = filters.material;

            const data = await execute(() => productService.getAll(params));
            setProducts(data.data);
            setPagination(data.pagination);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (formData) => {
        try {
            if (editingProduct) {
                await execute(() => productService.update(editingProduct._id, formData));
                toast.success('Product updated successfully! ✨');
            } else {
                await execute(() => productService.create(formData));
                toast.success('Product created successfully! 🎉');
            }
            setShowModal(false);
            reset();
            setEditingProduct(null);
            loadProducts();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        const fields = ['name', 'category', 'material', 'weight', 'purity', 'makingCharge', 'stoneType', 'stoneWeight', 'description'];
        fields.forEach(field => setValue(field, product[field]));
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await execute(() => productService.delete(id));
                toast.success('Product deleted');
                loadProducts();
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        reset({
            name: '', category: '', material: '', weight: '',
            purity: '', makingCharge: '', stoneType: 'none', stoneWeight: 0,
        });
        setShowModal(true);
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount || 0);

    return (
        <MainLayout title="Products">
            <div className="page-header">
                <div>
                    <h1>Product Management</h1>
                    <p>Manage your jewelry products with dynamic pricing</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="search-bar">
                        <FiSearch />
                        <input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="form-control" style={{ width: 'auto', minWidth: 140 }}
                        value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                        <option value="">All Categories</option>
                        {['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Bangle', 'Chain', 'Anklet', 'Mangalsutra'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select className="form-control" style={{ width: 'auto', minWidth: 130 }}
                        value={filters.material} onChange={(e) => setFilters({ ...filters, material: e.target.value })}>
                        <option value="">All Materials</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={() => loadProducts()}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Products Table */}
            {loading ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Material</th>
                                <th>Weight</th>
                                <th>Purity</th>
                                <th>Dynamic Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="9" className="empty-state"><p>No products found</p></td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td style={{ fontWeight: 600 }}>{product.name}</td>
                                        <td><span className="badge badge-gold">{product.sku}</span></td>
                                        <td>{product.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{product.material}</td>
                                        <td>{product.weight}g</td>
                                        <td>{product.purity}%</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                            {product.pricing ? formatCurrency(product.pricing.finalPrice) : 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-icon" onClick={() => handleEdit(product)} title="Edit">
                                                    <FiEdit size={14} />
                                                </button>
                                                <button className="btn-icon" onClick={() => handleDelete(product._id)} title="Delete"
                                                    style={{ color: 'var(--danger)' }}>
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button disabled={pagination.page <= 1} onClick={() => loadProducts(pagination.page - 1)}>Prev</button>
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button key={i} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => loadProducts(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={pagination.page >= pagination.pages} onClick={() => loadProducts(pagination.page + 1)}>Next</button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingProduct(null); reset(); }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input className="form-control" {...register('name', { required: 'Name is required' })} placeholder="Gold Ring 22K" />
                            {errors.name && <span className="form-error">{errors.name.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select className="form-control" {...register('category', { required: 'Category is required' })}>
                                <option value="">Select category</option>
                                {['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Bangle', 'Chain', 'Anklet', 'Mangalsutra', 'Other'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            {errors.category && <span className="form-error">{errors.category.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Material *</label>
                            <select className="form-control" {...register('material', { required: 'Material is required' })}>
                                <option value="">Select material</option>
                                <option value="gold">Gold</option>
                                <option value="silver">Silver</option>
                                <option value="platinum">Platinum</option>
                            </select>
                            {errors.material && <span className="form-error">{errors.material.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Weight (grams) *</label>
                            <input type="number" step="0.01" className="form-control"
                                {...register('weight', { required: 'Weight is required', min: { value: 0.01, message: 'Must be > 0' } })}
                                placeholder="e.g. 10.5" />
                            {errors.weight && <span className="form-error">{errors.weight.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Purity (%) *</label>
                            <input type="number" step="0.01" className="form-control"
                                {...register('purity', { required: 'Purity is required', min: 0, max: 100 })}
                                placeholder="e.g. 91.6 for 22K" />
                            {errors.purity && <span className="form-error">{errors.purity.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Making Charge (₹) *</label>
                            <input type="number" step="0.01" className="form-control"
                                {...register('makingCharge', { required: 'Making charge is required', min: 0 })}
                                placeholder="e.g. 2500" />
                            {errors.makingCharge && <span className="form-error">{errors.makingCharge.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stone Type</label>
                            <select className="form-control" {...register('stoneType')}>
                                <option value="none">None</option>
                                <option value="diamond">Diamond</option>
                                <option value="ruby">Ruby</option>
                                <option value="emerald">Emerald</option>
                                <option value="sapphire">Sapphire</option>
                                <option value="pearl">Pearl</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Stone Weight (carat)</label>
                            <input type="number" step="0.01" className="form-control"
                                {...register('stoneWeight')} placeholder="e.g. 0.5" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control" rows="3" {...register('description')} placeholder="Product description..." />
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default ProductsPage;
