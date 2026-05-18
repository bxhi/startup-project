import React, { useState, useEffect } from 'react';
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
    FiBriefcase,
    FiMail,
    FiPhone,
    FiMapPin,
    FiExternalLink,
    FiUploadCloud
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../api/api';
import { toast } from 'react-hot-toast';

const Settings = ({ onNavigate }) => {
    const { t, language, setLanguage } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const profile = userData.importatorProfile || userData.clientProfile || userData.profile || {};
    const vStatus = localStorage.getItem('verificationStatus') || userData.status || profile.verificationStatus || 'pending';
    const isPending = vStatus.toLowerCase() === 'pending';

    const [formData, setFormData] = useState({
        businessName: profile.businessName || userData.fullName || '',
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: profile.phoneNumber || userData.phoneNumber || '',
        address: profile.address || '',
        taxId: profile.registerCommerceNumber || profile.licenseId || profile.taxId || '',
        website: profile.website || ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await authApi.get('/auth/profile');
                const freshUser = response.data?.user || response.data || {};
                localStorage.setItem('user', JSON.stringify(freshUser));
                setUserData(freshUser);
                
                let freshStatus = freshUser.status || freshUser.verificationStatus || freshUser.profileVerificationStatus || freshUser.importatorProfile?.verificationStatus || freshUser.clientProfile?.verificationStatus || freshUser.user?.status || 'PENDING';
                localStorage.setItem('verificationStatus', freshStatus);

                const freshProfile = freshUser.importatorProfile || freshUser.clientProfile || freshUser.profile || {};
                setFormData({
                    businessName: freshProfile.businessName || freshUser.fullName || '',
                    fullName: freshUser.fullName || '',
                    email: freshUser.email || '',
                    phone: freshProfile.phoneNumber || freshUser.phoneNumber || '',
                    address: freshProfile.address || '',
                    taxId: freshProfile.registerCommerceNumber || freshProfile.licenseId || freshProfile.taxId || '',
                    website: freshProfile.website || ''
                });
            } catch (err) {
                console.error("Failed to fetch fresh user profile in Settings:", err);
            }
        };
        fetchUserProfile();
    }, []);

    const getDocumentUrl = (docKey) => {
        if (profile?.[docKey]) return profile[docKey];
        if (profile?.[`${docKey}Url`]) return profile[`${docKey}Url`];
        if (userData?.[docKey]) return userData[docKey];
        if (userData?.[`${docKey}Url`]) return userData[`${docKey}Url`];
        if (userData?.imageUrls?.[docKey]) return userData.imageUrls[docKey];
        if (userData?.imageUrls?.[`${docKey}Url`]) return userData.imageUrls[`${docKey}Url`];
        if (profile?.imageUrls?.[docKey]) return profile.imageUrls[docKey];
        if (profile?.imageUrls?.[`${docKey}Url`]) return profile.imageUrls[`${docKey}Url`];
        
        const alternateKey = docKey.endsWith('Image') ? `${docKey}Url` : docKey;
        if (profile?.[alternateKey]) return profile[alternateKey];
        if (userData?.[alternateKey]) return userData[alternateKey];

        const suffixUrlKey = docKey.replace('Image', 'ImageUrl');
        if (profile?.[suffixUrlKey]) return profile[suffixUrlKey];
        if (userData?.[suffixUrlKey]) return userData[suffixUrlKey];
        if (userData?.imageUrls?.[suffixUrlKey]) return userData.imageUrls[suffixUrlKey];

        return null;
    };

    const [notifications, setNotifications] = useState({
        email: { orders: true, negotiations: true, promotions: false },
        push: { orders: true, negotiations: true, promotions: false }
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleToggle = (type, category) => {
        setNotifications(prev => ({
            ...prev,
            [type]: { ...prev[type], [category]: !prev[type][category] }
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const submitPasswordChange = () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error(t.passwordsMismatch);
            return;
        }
        toast.loading(t.updatingPassword);
        setTimeout(() => {
            toast.dismiss();
            toast.success(t.passwordUpdated);
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        }, 1500);
    };

    const handleSaveProfile = async () => {
        try {
            toast.loading(t.saving || 'Saving changes...');
            // Simulating API call for now as requested minimal backend changes
            setTimeout(() => {
                toast.dismiss();
                toast.success(t.profileUpdated || 'Profile updated successfully');
            }, 1000);
        } catch (error) {
            toast.dismiss();
            toast.error(t.errorSaving || 'Failed to save changes');
        }
    };

    const documents = [
        { id: 'importLicense', name: t.importLicense || 'Import License', key: 'licenseImage', status: vStatus },
        { id: 'commercialRegister', name: t.commercialRegister || 'Commercial Register', key: 'registerCommerceImage', status: vStatus },
        { id: 'idFront', name: t.idFront || 'ID Front', key: 'idFrontCardImage', status: vStatus },
        { id: 'idBack', name: t.idBack || 'ID Back', key: 'idBackCardImage', status: vStatus }
    ];

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="settings">
            <div className="settings-container animate-fade-in">
                {/* Password Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="modal-content glass-premium animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="icon-badge gradient-purple"><FiShield /></div>
                                <h2>{t.changePassword}</h2>
                                <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t.currentPassword}</label>
                                    <input 
                                        type="password" 
                                        name="current"
                                        value={passwordData.current}
                                        onChange={handlePasswordChange}
                                        className="settings-input" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t.newPassword}</label>
                                    <input 
                                        type="password" 
                                        name="new"
                                        value={passwordData.new}
                                        onChange={handlePasswordChange}
                                        className="settings-input" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t.confirmNewPassword}</label>
                                    <input 
                                        type="password" 
                                        name="confirm"
                                        value={passwordData.confirm}
                                        onChange={handlePasswordChange}
                                        className="settings-input" 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="settings-btn-primary full-width" onClick={submitPasswordChange}>
                                    {t.updatePassword}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="settings-header header-wallet-style">
                    <div className="header-text">
                        <h1>{t.settingsTitle}</h1>
                        <p>{t.settingsSubtitle}</p>
                    </div>
                </div>

                <div className="settings-grid">
                    <div className="settings-main">
                        {/* Business Profile */}
                        <div className="settings-card glass-premium">
                            <div className="card-header no-border">
                                <div className="icon-badge gradient-blue">
                                    <FiBriefcase />
                                </div>
                                <div className="header-info-wrapper">
                                    <h3>{t.businessProfile}</h3>
                                    <p className="card-subtitle">{t.manageBusinessDesc}</p>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><FiBriefcase className="label-icon" /> {t.businessName}</label>
                                        <input 
                                            name="businessName"
                                            type="text" 
                                            value={formData.businessName} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiUser className="label-icon" /> {t.ownerFullName}</label>
                                        <input 
                                            name="fullName"
                                            type="text" 
                                            value={formData.fullName} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiMail className="label-icon" /> {t.email}</label>
                                        <input 
                                            name="email"
                                            type="email" 
                                            value={formData.email} 
                                            readOnly
                                            className="settings-input readonly" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiPhone className="label-icon" /> {t.phone}</label>
                                        <input 
                                            name="phone"
                                            type="text" 
                                            value={formData.phone} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label><FiMapPin className="label-icon" /> {t.businessAddress}</label>
                                        <input 
                                            name="address"
                                            type="text" 
                                            value={formData.address} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiShield className="label-icon" /> {t.taxId}</label>
                                        <input 
                                            name="taxId"
                                            type="text" 
                                            value={formData.taxId} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><FiGlobe className="label-icon" /> {t.website}</label>
                                        <input 
                                            name="website"
                                            type="text" 
                                            value={formData.website} 
                                            onChange={handleInputChange}
                                            className="settings-input" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="settings-btn-primary" onClick={handleSaveProfile}>{t.saveChanges}</button>
                            </div>
                        </div>

                        {/* Verification Documents */}
                        <div className="settings-card glass-premium">
                            <div className="card-header no-border">
                                <div className="icon-badge gradient-purple">
                                    <FiShield />
                                </div>
                                <div className="header-info-wrapper">
                                    <h3>{t.verificationDocs}</h3>
                                    <p className="card-subtitle">{t.verifyIdentityDesc}</p>
                                </div>
                                {isPending && (
                                    <span className="pending-badge-pulse">{t.pendingVerification || 'Pending Verification'}</span>
                                )}
                            </div>
                            <div className="card-content">
                                <div className="documents-grid-premium">
                                    {documents.map((doc) => {
                                        const docUrl = getDocumentUrl(doc.key);
                                        return (
                                            <div key={doc.id} className="document-card-premium">
                                                <div className="doc-preview-area">
                                                    {docUrl ? (
                                                        <a href={docUrl} target="_blank" rel="noreferrer" className="doc-image-link-wrapper">
                                                            <img src={docUrl} alt={doc.name} className="doc-image-small" />
                                                            <div className="doc-view-zoom-hint">
                                                                <FiExternalLink /> <span>{t.viewOriginal || 'View'}</span>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="doc-placeholder">
                                                            <FiFileText />
                                                        </div>
                                                    )}
                                                    <div className="doc-overlay">
                                                        <label className="overlay-upload-btn">
                                                            <input 
                                                                type="file" 
                                                                hidden 
                                                                onChange={(e) => {
                                                                    toast.success(`Uploading ${doc.name}...`);
                                                                    // In a real app, handle file upload here
                                                                }} 
                                                            />
                                                            <FiUploadCloud /> {t.update || 'Update'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="doc-meta">
                                                    <h4>{doc.name}</h4>
                                                    <div className="doc-status-row">
                                                        <span className={`status-dot ${vStatus.toLowerCase()}`}></span>
                                                        <span className="status-label">{t[vStatus.toLowerCase()] || vStatus}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="settings-card glass-premium">
                            <div className="card-header">
                                <div className="icon-badge gradient-pink">
                                    <FiBell />
                                </div>
                                <div className="header-info">
                                    <h3>{t.notificationPrefs}</h3>
                                    <p className="card-subtitle">{t.stayUpdated}</p>
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

                    <div className="settings-sidebar">
                        {/* Profile Card Premium */}
                        <div className="settings-card glass-premium profile-card-modern">
                            <div className="profile-banner"></div>
                            <div className="card-content">
                                <div className="profile-avatar-container">
                                    <div className="profile-avatar-large">
                                        <FiUser />
                                    </div>
                                    <button className="avatar-edit-badge">
                                        <FiCamera />
                                    </button>
                                </div>
                                <div className="profile-info-centered">
                                    <h3>{formData.fullName}</h3>
                                    <div className="role-badge-container">
                                        <span className="profile-role-badge">{t.roleImporter}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Language Selection */}
                        <div className="settings-card glass-premium">
                            <div className="card-header">
                                <div className="icon-badge gradient-blue">
                                    <FiGlobe />
                                </div>
                                <h3>{t.language}</h3>
                            </div>
                            <div className="card-content">
                                <div className="language-options">
                                    {[
                                        { id: 'en', label: 'English', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/gb.svg' },
                                        { id: 'fr', label: 'Français', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/fr.svg' },
                                        { id: 'ar', label: 'العربية', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/sa.svg' }
                                    ].map(lang => (
                                        <button 
                                            key={lang.id} 
                                            className={`lang-option ${language === lang.id ? 'active' : ''}`}
                                            onClick={() => setLanguage(lang.id)}
                                        >
                                            <div className="lang-info-left">
                                                <img src={lang.flagUrl} alt={`${lang.id} flag`} className="lang-flag-img" />
                                                <span className="lang-name">{lang.label}</span>
                                            </div>
                                            <div className="active-dot"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="settings-card glass-premium">
                            <div className="card-header">
                                <div className="icon-badge gradient-purple">
                                    <FiShield />
                                </div>
                                <h3>{t.security}</h3>
                            </div>
                            <div className="card-content">
                                <div className="security-buttons">
                                    <button className="security-btn-premium" onClick={() => setShowPasswordModal(true)}>
                                        <FiShield className="btn-icon" /> {t.changePassword}
                                    </button>
                                    <button className="security-btn-premium">
                                        <FiShield className="btn-icon" /> {t.twoFactorAuth}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Logout */}
                        <button className="logout-btn-creative" onClick={() => {
                            localStorage.clear();
                            onNavigate('onboarding');
                        }}>
                            <FiLogOut />
                            <span>{t.logout}</span>
                            <div className="btn-shine"></div>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
