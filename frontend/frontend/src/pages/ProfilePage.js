import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import useApi from '../hooks/useApi';
import { authService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiShield, FiCamera, FiTrash2 } from 'react-icons/fi';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const { loading, execute } = useApi();
    const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

    const [profile, setProfile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const data = await execute(() => authService.getProfile());
            setProfile(data.data);
            resetProfile(data.data);
        } catch (err) {
            toast.error('Failed to load profile');
        }
    };

    const onUpdateProfile = async (formData) => {
        try {
            const updateData = { ...formData };
            if (previewImage) {
                updateData.profilePicture = previewImage;
            }
            const data = await execute(() => authService.updateProfile(updateData));
            setProfile(data.data);
            if (setUser) setUser(data.data);
            toast.success('Profile updated successfully! ✨');
            setPreviewImage(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                toast.error('Image is too large. Max 1MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfilePicture = async () => {
        if (window.confirm('Delete profile picture?')) {
            try {
                const data = await execute(() => authService.updateProfile({ profilePicture: '' }));
                setProfile(data.data);
                if (setUser) setUser(data.data);
                setPreviewImage(null);
                toast.success('Profile picture removed');
            } catch (err) {
                toast.error('Failed to remove image');
            }
        }
    };

    const onChangePassword = async (formData) => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await execute(() => authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            }));
            toast.success('Password changed successfully! 🔐');
            resetPassword();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading && !profile) return <MainLayout title="Profile"><LoadingSpinner /></MainLayout>;

    return (
        <MainLayout title="My Profile">
            <div className="page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account settings</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
                {/* Profile Info Card */}
                <div className="card">
                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 30px' }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: '50%',
                            overflow: 'hidden', border: '3px solid var(--primary-light)',
                            background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', fontWeight: 800, color: 'var(--primary)'
                        }}>
                            {previewImage || profile?.profilePicture ? (
                                <img src={previewImage || profile?.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                profile?.name?.charAt(0)?.toUpperCase()
                            )}
                        </div>
                        <label className="image-upload-btn" style={{
                            position: 'absolute', bottom: 5, right: 5,
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                            <FiCamera size={18} />
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </label>
                        {(profile?.profilePicture || previewImage) && (
                            <button onClick={removeProfilePicture} className="image-delete-btn" style={{
                                position: 'absolute', top: 5, right: 5,
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'var(--danger)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', cursor: 'pointer'
                            }}>
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{profile?.name}</h3>
                        <span className={`badge ${profile?.role === 'admin' ? 'badge-gold' : 'badge-in-progress'}`}>
                            <FiShield size={10} style={{ marginRight: 4 }} /> {profile?.role}
                        </span>
                    </div>

                    <form onSubmit={handleProfile(onUpdateProfile)}>
                        <div className="form-group">
                            <label><FiUser size={12} style={{ marginRight: 4 }} /> Full Name</label>
                            <input className="form-control"
                                {...regProfile('name', { required: 'Name is required' })} />
                            {profileErrors.name && <span className="form-error">{profileErrors.name.message}</span>}
                        </div>
                        <div className="form-group">
                            <label><FiMail size={12} style={{ marginRight: 4 }} /> Email</label>
                            <input className="form-control" disabled
                                {...regProfile('email')}
                                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email cannot be changed</span>
                        </div>
                        <div className="form-group">
                            <label><FiPhone size={12} style={{ marginRight: 4 }} /> Phone</label>
                            <input className="form-control"
                                {...regProfile('phone')} placeholder="e.g. +91 9876543210" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiSave /> {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>
                        <FiLock size={16} style={{ marginRight: 8 }} /> Change Password
                    </h3>
                    <form onSubmit={handlePassword(onChangePassword)}>
                        <div className="form-group">
                            <label>Current Password *</label>
                            <input type="password" className="form-control"
                                {...regPassword('currentPassword', { required: 'Current password is required' })} />
                            {passwordErrors.currentPassword && <span className="form-error">{passwordErrors.currentPassword.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>New Password *</label>
                            <input type="password" className="form-control"
                                {...regPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                            {passwordErrors.newPassword && <span className="form-error">{passwordErrors.newPassword.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password *</label>
                            <input type="password" className="form-control"
                                {...regPassword('confirmPassword', { required: 'Please confirm password' })} />
                            {passwordErrors.confirmPassword && <span className="form-error">{passwordErrors.confirmPassword.message}</span>}
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FiLock /> {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Account Details Card */}
                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 20 }}>📋 Account Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Account ID</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{profile?._id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Role</span>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{profile?.role}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
                            <span className={`badge ${profile?.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                {profile?.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Member Since</span>
                            <span style={{ fontSize: '0.85rem' }}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last Login</span>
                            <span style={{ fontSize: '0.85rem' }}>{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-IN') : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
