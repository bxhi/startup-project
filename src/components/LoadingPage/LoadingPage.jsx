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
            
            <div className="cargo-loader-hub">
                <div className="cargo-box-wrapper">
                    <div className="cargo-box-face cargo-box-front"></div>
                    <div className="cargo-box-face cargo-box-back"></div>
                    <div className="cargo-box-face cargo-box-left"></div>
                    <div className="cargo-box-face cargo-box-right"></div>
                    <div className="cargo-box-face cargo-box-top"></div>
                    <div className="cargo-box-face cargo-box-bottom"></div>
                </div>
                <div className="cargo-box-shadow"></div>
            </div>
            
            <div className="loading-text">{message}</div>
        </div>
    );
};

export default LoadingPage;
