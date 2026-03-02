import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { customerService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit, FiUserX, FiUserCheck, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => { loadCustomers(); }, [search]);

    const loadCustomers = async (page = 1) => {
        try {
            const data = await execute(() => customerService.getAll({ page, limit: 20, search }));
            setCustomers(data.data);
            setPagination(data.pagination);
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (formData) => {
        try {
            if (editing) {
                await execute(() => customerService.update(editing._id, formData));
                toast.success('Customer updated! ✨');
            } else {
                await execute(() => customerService.create(formData));
                toast.success('Customer added! 🎉');
            }
            setShowModal(false); reset(); setEditing(null);
            loadCustomers();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save customer'); }
    };

    const handleEdit = (c) => {
        setEditing(c);
        ['name', 'phone', 'email', 'notes'].forEach(f => setValue(f, c[f]));
        if (c.address) {
            ['street', 'city', 'state', 'pincode'].forEach(f => setValue(`address.${f}`, c.address[f]));
        }
        setShowModal(true);
    };

    const toggleStatus = async (c) => {
        try {
            if (c.isActive) {
                await execute(() => customerService.deactivate(c._id));
                toast.info('Customer deactivated');
            } else {
                await execute(() => customerService.activate(c._id));
                toast.success('Customer activated');
            }
            loadCustomers();
        } catch (err) { toast.error('Failed to update status'); }
    };

    return (
        <MainLayout title="Customers">
            <div className="page-header">
                <div><h1>Customer Management</h1><p>Manage customers and loyalty points</p></div>
                <button className="btn btn-primary" onClick={() => { reset(); setEditing(null); setShowModal(true); }}><FiPlus /> Add Customer</button>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="search-bar">
                    <FiSearch />
                    <input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Loyalty Points</th><th>Purchases</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {customers.length === 0 ? <tr><td colSpan="8" className="empty-state"><p>No customers found</p></td></tr> :
                                customers.map((c) => (
                                    <tr key={c._id}>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td>{c.phone}</td>
                                        <td>{c.email || '-'}</td>
                                        <td>{c.address?.city || '-'}</td>
                                        <td><span className="badge badge-gold">⭐ {c.loyaltyPoints}</span></td>
                                        <td>{c.purchaseHistory?.length || 0}</td>
                                        <td><span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-icon" onClick={() => handleEdit(c)}><FiEdit size={14} /></button>
                                                <button className="btn-icon" onClick={() => toggleStatus(c)} style={{ color: c.isActive ? 'var(--danger)' : 'var(--success)' }}>
                                                    {c.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); reset(); }} title={editing ? 'Edit Customer' : 'Add Customer'} size="md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-row">
                        <div className="form-group"><label>Name *</label><input className="form-control" {...register('name', { required: 'Required' })} />{errors.name && <span className="form-error">{errors.name.message}</span>}</div>
                        <div className="form-group"><label>Phone *</label><input className="form-control" {...register('phone', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: '10 digits' } })} />{errors.phone && <span className="form-error">{errors.phone.message}</span>}</div>
                    </div>
                    <div className="form-group"><label>Email</label><input className="form-control" {...register('email')} /></div>
                    <div className="form-row">
                        <div className="form-group"><label>Street</label><input className="form-control" {...register('address.street')} /></div>
                        <div className="form-group"><label>City</label><input className="form-control" {...register('address.city')} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>State</label><input className="form-control" {...register('address.state')} /></div>
                        <div className="form-group"><label>Pincode</label><input className="form-control" {...register('address.pincode')} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default CustomersPage;
