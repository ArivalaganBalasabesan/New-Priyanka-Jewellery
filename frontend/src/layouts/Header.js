import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiMenu } from 'react-icons/fi';

const Header = ({ title }) => {
    const { user } = useAuth();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1>{title || 'Dashboard'}</h1>
            </div>
            <div className="header-right">
                {user ? (
                    <>
                        <button className="btn-icon" title="Notifications">
                            <FiBell />
                        </button>
                        <div className="user-info">
                            <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    getInitials(user?.name)
                                )}
                            </div>
                            <div className="user-details" onClick={() => window.location.href = '/profile'} style={{ cursor: 'pointer' }}>
                                <span>{user?.name || 'User'}</span>
                                <small style={{ textTransform: 'capitalize' }}>{user?.role || 'staff'}</small>
                            </div>
                        </div>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
