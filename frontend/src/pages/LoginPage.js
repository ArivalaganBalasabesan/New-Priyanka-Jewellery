import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';

const LoginPage = () => {
    const { login, verifyOtp, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requiresOtp, setRequiresOtp] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');
            const res = await login(data.email, data.password);

            if (res?.data?.requiresOtp) {
                setRequiresOtp(true);
                setEmailForOtp(res.data.email);
                toast.info(res.message || 'Please check your email for the OTP.');
            } else if (res?.data?.requiresOtp === false) {
                toast.success('Successfully logged in!');
                if (res.data.user?.role === 'admin' || res.data.user?.role === 'staff') {
                    navigate('/dashboard');
                } else {
                    navigate('/catalog'); // E-commerce professional flow: redirect to shop after login
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const user = await verifyOtp(emailForOtp, otpCode);
            toast.success('Successfully logged in!');
            if (user?.role === 'admin' || user?.role === 'staff') {
                navigate('/dashboard');
            } else {
                navigate('/catalog'); // E-commerce professional flow: redirect to shop after login
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
                    <p>Management System</p>
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

                {!requiresOtp ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                            {errors.email && (
                                <span className="form-error">{errors.email.message}</span>
                            )}
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
                                    placeholder="Enter your password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
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
                            {errors.password && (
                                <span className="form-error">{errors.password.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    Verifying...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>One-Time Password (OTP)</label>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                We've sent a 6-digit code to <strong>{emailForOtp}</strong>. Check your console.
                            </p>
                            <div style={{ position: 'relative' }}>
                                <FiKey style={{
                                    position: 'absolute', left: 12, top: '50%',
                                    transform: 'translateY(-50%)', color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: 40, letterSpacing: '2px', fontSize: '1.2rem', textAlign: 'center' }}
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || otpCode.length !== 6}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    Verifying OTP...
                                </span>
                            ) : (
                                'Verify & Login'
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ marginTop: '10px' }}
                            onClick={() => { setRequiresOtp(false); setOtpCode(''); }}
                        >
                            Back to Password
                        </button>
                    </form>
                )}

                <div className="google-login-section" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ height: 1, flex: 1, backgroundColor: 'var(--border)' }}></div>
                        <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ height: 1, flex: 1, backgroundColor: 'var(--border)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            theme="filled_blue"
                            shape="pill"
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    const user = await loginWithGoogle(credentialResponse.credential);
                                    toast.success(`Welcome back, ${user.name}!`);
                                    if (user.role === 'customer') {
                                        navigate('/user-dashboard');
                                    } else {
                                        navigate('/dashboard');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    setError('Google login failed');
                                    toast.error('Google login failed');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                setError('Google login failed');
                                toast.error('Google login failed');
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Create one
                    </Link>
                </div>

                {!requiresOtp && (
                    <div className="demo-credentials">
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <strong>Demo Credentials:</strong><br />
                            Email: admin@priyankajewellery.com<br />
                            Password: Admin@123456
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
