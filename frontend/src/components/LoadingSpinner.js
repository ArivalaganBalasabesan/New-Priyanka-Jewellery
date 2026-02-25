import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div className="loading-spinner">
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
