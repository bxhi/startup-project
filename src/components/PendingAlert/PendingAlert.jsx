import React from 'react';
import { FiClock, FiMail, FiInfo, FiChevronRight } from 'react-icons/fi';
import './PendingAlert.css';
import { useLanguage } from '../../context/LanguageContext';

const PendingAlert = ({ email }) => {
    const { t } = useLanguage();

    return (
        <div className="pending-top-banner">
            <div className="banner-glow-line"></div>
            <div className="pending-banner-content">
                <div className="banner-main-info">
                    <div className="status-orb-container">
                        <div className="status-orb pulse-orb"></div>
                    </div>
                    <span className="banner-title">{t.accountPendingTitle || 'Account Verification in Progress'}</span>
                    <span className="banner-separator">|</span>
                    <span className="banner-description">{t.accountPendingDesc}</span>
                </div>

                <div className="banner-meta-info">
                    <div className="email-info-strip">
                        <FiMail className="icon" />
                        <span className="email-text">{email}</span>
                    </div>
                    <div className="identity-tag">IDENTITY SECURED</div>
                </div>
            </div>
        </div>
    );
};

export default PendingAlert;
