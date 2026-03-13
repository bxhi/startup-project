import React from 'react';
import './LoadingPage.css';

const LoadingPage = ({ message = 'Processing...' }) => {
    return (
        <div className="loading-overlay">
            <div className="aura-container">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
            </div>
            <div className="loading-text">{message}</div>
        </div>
    );
};

export default LoadingPage;
