import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { userService } from '../services/endpoints';
import { useForm } from 'react-hook-form';
import { FiPlus, FiUserX, FiUserCheck, FiKey, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { loading, execute } = useApi();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await execute(() => userService.getAll({ limit: 50 }));
            setUsers(data.data);
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (formData) => {
        try {
            await execute(() => userService.create(formData));
            toast.success('Staff account created! 👤');
            setShowModal(false); reset(); loadUsers();
        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create account'); }
    };

    const toggleStatus = async (u) => {
        try {
            if (u.isActive) { await execute(() => userService.deactivate(u._id)); toast.info('User deactivated'); }
            else { await execute(() => userService.activate(u._id)); toast.success('User activated'); }
            loadUsers();
        } catch (err) { toast.error('Failed to update status'); }
    };

    const resetPassword = async (id) => {
        const pwd = prompt('Enter new password (min 6 chars):');
        if (!pwd || pwd.length < 6) return toast.warning('Password must be at least 6 characters');
        try {
            await execute(() => userService.resetPassword(id, pwd));
            toast.success('Password reset successfully! 🔐');
        } catch (err) { toast.error('Failed to reset password'); }
    };

    const changeRole = async (id, role) => {
        try {
            await execute(() => userService.updateRole(id, role));
            toast.success('Role updated');
            loadUsers();
        } catch (err) { toast.error('Failed to update role'); }
    };

    return (
        <MainLayout title="User Management">
            <div className="page-header">
                <div><h1>User Management</h1><p>Manage staff accounts and roles</p></div>
                <button className="btn btn-primary" onClick={() => { reset(); setShowModal(true); }}><FiPlus /> Add Staff</button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select className="form-control" style={{ width: 'auto', padding: '4px 24px 4px 8px', fontSize: '0.8rem' }}
                                            value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                        </select>
                                    </td>
                                    <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td style={{ fontSize: '0.8rem' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn-icon" title="Reset Password" onClick={() => resetPassword(u._id)}><FiKey size={14} /></button>
                                            <button className="btn-icon" title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(u)}
                                                style={{ color: u.isActive ? 'var(--danger)' : 'var(--success)' }}>
                                                {u.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Staff Account" size="md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group"><label>Name *</label><input className="form-control" {...register('name', { required: 'Required' })} />{errors.name && <span className="form-error">{errors.name.message}</span>}</div>
                    <div className="form-group"><label>Email *</label><input className="form-control" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid' } })} />{errors.email && <span className="form-error">{errors.email.message}</span>}</div>
                    <div className="form-group"><label>Password *</label><input type="password" className="form-control" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />{errors.password && <span className="form-error">{errors.password.message}</span>}</div>
                    <div className="form-group"><label>Role</label><select className="form-control" {...register('role')}><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
};

export default UsersPage;
