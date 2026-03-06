import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, onNavigate, activePage, contentClassName }) => {
    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-main-content">
                <Sidebar onNavigate={onNavigate} activePage={activePage} />
                <div className={`dashboard-content ${contentClassName || ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
