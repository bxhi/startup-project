import React, { useState } from 'react';
import './Settings.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
    FiUser,
    FiShield,
    FiBell,
    FiGlobe,
    FiLogOut,
    FiCamera,
    FiCheck,
    FiFileText,
    FiBriefcase
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Settings = ({ onNavigate }) => {
    const { t, language, setLanguage } = useLanguage();

    const [notifications, setNotifications] = useState({
        email: { orders: true, negotiations: true, promotions: false },
        push: { orders: true, negotiations: true, promotions: false }
    });

    const handleToggle = (type, category) => {
        setNotifications(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [category]: !prev[type][category]
            }
        }));
    };

    const documents = [
        { name: 'Import License', date: '2026-01-15', status: 'approved' },
        { name: 'Commercial Register', date: '2026-01-15', status: 'approved' },
        { name: 'ID Front', date: '2026-01-15', status: 'approved' },
        { name: 'ID Back', date: '2026-01-15', status: 'approved' }
    ];

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="settings">
            <div className="settings-header header-wallet-style">
                <div className="header-text">
                    <h1>{t.settingsTitle}</h1>
                    <p>{t.settingsSubtitle}</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Left Column - Main Settings */}
                <div className="settings-main">
                    {/* Business Profile */}
                    <div className="settings-card">
                        <div className="card-header no-border">
                            <div className="icon-badge light-blue">
                                <FiBriefcase />
                            </div>
                            <h3>{t.businessProfile}</h3>
                        </div>
                        <div className="card-content">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t.businessName}</label>
                                    <input type="text" defaultValue="Premium Imports Co." className="settings-input" />
                                </div>
                                <div className="form-group">
                                    <label>{t.ownerFullName}</label>
                                    <input type="text" defaultValue="John Doe" className="settings-input" />
                                </div>
                                <div className="form-group">
                                    <label>{t.email}</label>
                                    <input type="email" defaultValue="john@premiumimports.com" className="settings-input" />
                                </div>
                                <div className="form-group">
                                    <label>{t.phone}</label>
                                    <input type="text" defaultValue="+213 555 123 456" className="settings-input" />
                                </div>
                                <div className="form-group full-width">
                                    <label>{t.businessAddress}</label>
                                    <input type="text" defaultValue="123 Business Street, Algiers" className="settings-input" />
                                </div>
                                <div className="form-group">
                                    <label>{t.taxId}</label>
                                    <input type="text" defaultValue="ALG-123456789" className="settings-input" />
                                </div>
                                <div className="form-group">
                                    <label>{t.website}</label>
                                    <input type="text" defaultValue="www.premiumimports.com" className="settings-input" />
                                </div>
                            </div>
                            <div className="card-actions-right">
                                <button className="settings-btn-primary rounded">{t.saveChanges}</button>
                            </div>
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="settings-card">
                        <div className="card-header no-border">
                            <div className="icon-badge light-blue">
                                <FiShield />
                            </div>
                            <h3>{t.verificationDocs}</h3>
                        </div>
                        <div className="card-content">
                            <div className="documents-list-modern">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="document-item-modern">
                                        <div className="doc-icon-badge green">
                                            <FiCheck />
                                        </div>
                                        <div className="doc-info">
                                            <h4>{doc.name}</h4>
                                            <p>{t.uploaded}: {doc.date}</p>
                                        </div>
                                        <div className="doc-actions-right">
                                            <span className="status-badge-green">{t.approved}</span>
                                            <button className="reupload-link">{t.reupload}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="settings-card highlight">
                        <div className="card-header">
                            <div className="icon-badge pink">
                                <FiBell />
                            </div>
                            <div className="header-info">
                                <h3>{t.notificationPrefs}</h3>
                                <p>{t.stayUpdated}</p>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="notifications-modern-grid">
                                {/* Email Channel */}
                                <div className="channel-box">
                                    <div className="channel-header">
                                        <div className="channel-title">
                                            <div className="mini-icon blue"><FiGlobe /></div>
                                            <span>{t.emailNotifications}</span>
                                        </div>
                                    </div>
                                    <div className="channel-items">
                                        {[
                                            { id: 'orders', label: t.orderUpdates, icon: <FiFileText /> },
                                            { id: 'negotiations', label: t.negotiationMessages, icon: <FiBell /> },
                                            { id: 'promotions', label: t.promotionsUpdates, icon: <FiBriefcase /> }
                                        ].map((item) => (
                                            <div key={item.id} className="notif-tile">
                                                <div className="tile-icon">{item.icon}</div>
                                                <div className="tile-label">{item.label}</div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications.email[item.id]}
                                                        onChange={() => handleToggle('email', item.id)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Push Channel */}
                                <div className="channel-box">
                                    <div className="channel-header">
                                        <div className="channel-title">
                                            <div className="mini-icon purple"><FiBell /></div>
                                            <span>{t.pushNotifications}</span>
                                        </div>
                                    </div>
                                    <div className="channel-items">
                                        {[
                                            { id: 'orders', label: t.orderUpdates, icon: <FiFileText /> },
                                            { id: 'negotiations', label: t.negotiationMessages, icon: <FiBell /> },
                                            { id: 'promotions', label: t.promotionsUpdates, icon: <FiBriefcase /> }
                                        ].map((item) => (
                                            <div key={item.id} className="notif-tile">
                                                <div className="tile-icon">{item.icon}</div>
                                                <div className="tile-label">{item.label}</div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications.push[item.id]}
                                                        onChange={() => handleToggle('push', item.id)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar Settings */}
                <div className="settings-sidebar">
                    {/* Profile Picture */}
                    <div className="settings-card centered">
                        <div className="card-header no-border">
                            <h3>{t.profilePicture}</h3>
                        </div>
                        <div className="card-content">
                            <div className="profile-avatar-large">
                                <FiUser />
                            </div>
                            <button className="settings-btn-upload">
                                <FiCamera /> {t.uploadNew}
                            </button>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="icon-badge light-blue">
                                <FiGlobe />
                            </div>
                            <h3>{t.language}</h3>
                        </div>
                        <div className="card-content">
                            <div className="language-list">
                                {[
                                    { id: 'en', label: 'English (EN)' },
                                    { id: 'fr', label: 'Français (FR)' },
                                    { id: 'ar', label: '(AR) العربية' }
                                ].map(lang => (
                                    <label key={lang.id} className="radio-container">
                                        <input
                                            type="radio"
                                            name="language"
                                            checked={language === lang.id}
                                            onChange={() => setLanguage(lang.id)}
                                        />
                                        <span className="radio-label">{lang.label}</span>
                                        <span className="radio-mark"></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="settings-card">
                        <div className="card-header">
                            <h3>{t.security}</h3>
                        </div>
                        <div className="card-content">
                            <div className="security-buttons">
                                <button className="security-btn">{t.changePassword}</button>
                                <button className="security-btn">{t.twoFactorAuth}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
