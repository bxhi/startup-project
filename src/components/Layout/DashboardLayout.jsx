import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import PendingBanner from '../PendingBanner/PendingBanner';
import './DashboardLayout.css';

const DashboardLayout = ({ children, onNavigate, activePage, contentClassName }) => {
    return (
        <div className="dashboard-layout">
            <Navbar onNavigate={onNavigate} />
            <div className="dashboard-main-content">
                <Sidebar onNavigate={onNavigate} activePage={activePage} />
                <div className={`dashboard-content ${contentClassName || ''}`}>
                    <PendingBanner />
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
