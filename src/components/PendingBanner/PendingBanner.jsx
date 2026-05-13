import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiMail, FiInfo, FiLock } from 'react-icons/fi';
import './PendingBanner.css';

const PendingBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const checkStatus = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsPending(false);
                return;
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let vStatus = localStorage.getItem('verificationStatus') || user.status;
            if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
            
            const pending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);
            setIsPending(pending);
            setUserEmail(user?.email || '');

            if (pending) {
                // Slight delay to allow the banner to drop down smoothly
                setTimeout(() => setIsVisible(true), 100);
            }
        };

        checkStatus();
        // Listen to storage changes
        window.addEventListener('storage', checkStatus);
        return () => window.removeEventListener('storage', checkStatus);
    }, []);

    if (!isPending) return null;

    return (
        <div className={`pending-banner-container ${isVisible ? 'slide-down' : ''}`}>
            <div className="pending-banner-content">
                <div className="banner-icon-wrapper pulse-animation">
                    <FiLock className="banner-icon-main" />
                    <div className="banner-icon-bg"></div>
                </div>
                
                <div className="banner-text-content">
                    <div className="banner-title-row">
                        <FiAlertTriangle className="warning-icon" />
                        <h3>Account Verification in Progress</h3>
                    </div>
                    <p className="banner-message">
                        Welcome! Your account is currently in a <strong>read-only state</strong>. 
                        You can explore the platform, but operations are locked until your documents are verified.
                    </p>
                    <div className="banner-email-alert">
                        <FiMail className="email-icon" />
                        <span>You will be notified via email at <strong>{userEmail || 'your email'}</strong> once approved.</span>
                    </div>
                </div>

                <div className="banner-decorations">
                    <div className="decor-circle decor-1"></div>
                    <div className="decor-circle decor-2"></div>
                </div>
            </div>
        </div>
    );
};

export default PendingBanner;
