import React from 'react';
import './Navbar.css';
import { FiSearch, FiBell, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';
import { useLanguage } from '../../context/LanguageContext';
const Navbar = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [vStatus, setVStatus] = React.useState(() => {
        let status = localStorage.getItem('verificationStatus') || JSON.parse(localStorage.getItem('user') || '{}').status;
        if (status === 'undefined' || status === 'null') return null;
        return status;
    });

    React.useEffect(() => {
        const handleStorage = () => {
            const freshUser = JSON.parse(localStorage.getItem('user') || '{}');
            const freshStatus = localStorage.getItem('verificationStatus') || freshUser.status;
            setUser(freshUser);
            if (freshStatus !== 'undefined' && freshStatus !== 'null') {
                setVStatus(freshStatus);
            }
        };

        window.addEventListener('storage', handleStorage);
        // Also check periodically or on mount in case storage event doesn't fire on same tab
        const interval = setInterval(handleStorage, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const verificationStatus = vStatus || (user.userId ? 'PENDING' : null);
    return (
        <header className="navbar rainbow-navbar">
            {/* Market-Vibe Animated Layer */}
            <div className="navbar-market-layer">
                <div className="market-icon icon-1"><LuShoppingBag /></div>
                <div className="market-icon icon-2"><LuPackage /></div>
                <div className="market-icon icon-3"><LuTrendingUp /></div>
                <div className="market-icon icon-4"><LuStore /></div>
                <div className="market-icon icon-5"><LuDollarSign /></div>
                <div className="market-icon icon-6"><LuBox /></div>
                <div className="market-icon icon-7"><LuShoppingBag /></div>
                <div className="market-icon icon-8"><LuTrendingUp /></div>
                <div className="market-icon icon-9"><LuStore /></div>
                <div className="market-icon icon-10"><LuPackage /></div>
                <div className="market-icon icon-11"><LuBox /></div>
                <div className="market-icon icon-12"><LuDollarSign /></div>
                <div className="market-icon icon-13"><LuShoppingBag /></div>
                <div className="market-icon icon-14"><LuPackage /></div>
                <div className="market-icon icon-15"><LuTrendingUp /></div>
                <div className="market-icon icon-16"><LuStore /></div>
                <div className="market-icon icon-17"><LuBox /></div>
                <div className="market-icon icon-18"><LuDollarSign /></div>
            </div>

            {/* Background Animations */}
            <div className="navbar-bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
                <div className="blob blob-5"></div>
                <div className="blob-rainbow"></div>
            </div>

            <div className="navbar-content">
                <div className="navbar-left">
                    <div className="brand-logo-container" onClick={() => onNavigate && onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
                        <img src="/SILA-LOGO.png" className="brand-logo-img" alt="SILA" />
                        <div className="shiny-glass-overlay"></div>
                    </div>
                    <div className="search-container">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder={t.searchPlaceholder} className="search-input" />
                    </div>
                </div>

                <div className="navbar-right">
                    <button className="notification-btn" onClick={() => onNavigate && onNavigate('notifications')}>
                        <FiBell />
                        <span className="notification-dot"></span>
                    </button>

                    <div className="user-profile" onClick={() => onNavigate && onNavigate('settings')} style={{ cursor: 'pointer' }}>
                        <div className="user-avatar">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
                            </svg>
                        </div>
                        <div className="user-info">
                            <div className="user-name-row">
                                <span className="user-name">{user.businessName || user.fullName || 'Business Account'}</span>
                                {verificationStatus && (
                                    <span className={`status-badge-nav ${verificationStatus.toLowerCase()}`}>
                                        {verificationStatus.toLowerCase() === 'pending' && <FiClock size={12} />}
                                        {verificationStatus.toLowerCase() === 'approved' && <FiCheckCircle size={12} />}
                                        {verificationStatus.toLowerCase() === 'rejected' && <FiAlertCircle size={12} />}
                                        {t[`status${verificationStatus.toUpperCase()}`] || verificationStatus}
                                    </span>
                                )}
                            </div>
                            <span className="user-role">{language === 'ar' ? 'مستورد' : language === 'fr' ? 'Importateur' : 'Importer'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
