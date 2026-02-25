import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
            padding: 24,
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '8rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                marginBottom: 8,
            }}>
                404
            </div>
            <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                color: '#1e293b',
                marginBottom: 12,
            }}>
                Page Not Found
            </h1>
            <p style={{
                color: '#64748b',
                fontSize: '1rem',
                maxWidth: 440,
                marginBottom: 32,
            }}>
                The page you're looking for doesn't exist or has been moved to a different location.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/dashboard" className="btn btn-primary" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', textDecoration: 'none',
                }}>
                    <FiHome /> Go to Dashboard
                </Link>
                <button className="btn btn-secondary" onClick={() => window.history.back()} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px',
                }}>
                    <FiArrowLeft /> Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
