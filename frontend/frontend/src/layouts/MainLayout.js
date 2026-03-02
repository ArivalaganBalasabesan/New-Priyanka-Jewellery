import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <Header title={title} />
            <main className="main-content fade-in">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
