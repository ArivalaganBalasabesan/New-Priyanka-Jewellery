import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../services/endpoints';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const password = watch("password");

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');
            await authService.register(data);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card slide-up">
                <div className="brand">
                    <div className="logo-icon">💎</div>
                    <h1>New Priyanka Jewellery</h1>
                    <p>Create your account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 16px',
                        marginBottom: 20,
                        color: 'var(--danger)',
                        fontSize: '0.85rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)'
                            }} />
                            <input
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="Enter your name"
                                {...register('name', { required: 'Name is required' })}
                            />
                        </div>
                        {errors.name && <span className="form-error">{errors.name.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)'
                            }} />
                            <input
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="Enter your email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: 'Invalid email format',
                                    },
                                })}
                            />
                        </div>
                        {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)'
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                style={{ paddingLeft: 40, paddingRight: 40 }}
                                placeholder="Create a password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Min 6 characters',
                                    },
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                }}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && <span className="form-error">{errors.password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)'
                            }} />
                            <input
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="Confirm password"
                                {...register('confirmPassword', {
                                    validate: value => value === password || "Passwords do not match"
                                })}
                            />
                        </div>
                        {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Phone (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <FiPhone style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)'
                            }} />
                            <input
                                type="tel"
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="Phone number"
                                {...register('phone', {
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: 'Must be 10 digits',
                                    }
                                })}
                            />
                        </div>
                        {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ height: 1, flex: 1, backgroundColor: 'var(--border)' }}></div>
                        <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ height: 1, flex: 1, backgroundColor: 'var(--border)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            theme="filled_blue"
                            shape="pill"
                            text="signup_with"
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    const user = await loginWithGoogle(credentialResponse.credential);
                                    toast.success(`Welcome, ${user.name}!`);
                                    navigate('/user-dashboard');
                                } catch (err) {
                                    console.error(err);
                                    setError('Google sign-up failed');
                                    toast.error('Google sign-up failed');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                setError('Google sign-up failed');
                                toast.error('Google sign-up failed');
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
