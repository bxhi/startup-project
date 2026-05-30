import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Checkbox from '../../components/Checkbox/Checkbox';
import { FiCheckCircle, FiX, FiShield, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';
import { IoMdTime } from 'react-icons/io';
import './Login.css';
import authService from '../../api/authService';
import { useLanguage } from '../../context/LanguageContext';

const Login = ({ onNavigate, onForgotPassword, onLoginSuccess }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login(email, password);

            // Handle Remember Me logic
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPassword', password); // User requested saving login infos
                localStorage.setItem('rememberMeChecked', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPassword');
                localStorage.removeItem('rememberMeChecked');
            }

            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            console.error('Login error full object:', err);
            console.error('Error Response:', err.response);
            console.error('Error Request:', err.request);
            console.error('Error Message:', err.message);

            if (err.response) {
                // Choice: Prioritize the specific message from the backend
                const backendMsg = err.response.data?.message || err.response.data?.error;
                
                if (backendMsg) {
                    setError(backendMsg);
                } else if (err.response.status === 401) {
                    setError(t.errInvalidCreds || 'Please enter valid credentials.');
                } else if (err.response.status === 403) {
                    setError(t.errAccountBlocked || 'Access denied. Your account may be suspended.');
                } else if (err.response.status === 404) {
                    setError(t.errAccountNotFound || 'Account not found.');
                } else {
                    setError(t.errLoginFailed || 'Login failed. Please try again.');
                }
            } else if (err.request) {
                setError(t.errNetwork || 'Network error: Server is unreachable or CORS blocked.');
            } else {
                setError('Error: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) setError('');
    };

    React.useEffect(() => {
        // Load remembered credentials
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        const isChecked = localStorage.getItem('rememberMeChecked') === 'true';

        if (isChecked && savedEmail) {
            setEmail(savedEmail);
            setPassword(savedPassword || '');
            setRememberMe(true);
        }

        // Removed forced white background to allow blobs and aura to show
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="login-container">
            {/* Background Animations */}
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
                <div className="blob blob-5"></div>
                <div className="blob blob-6"></div>
                <div className="blob-rainbow"></div>
                
                {/* Floating premium logistics icons ecosystem */}
                <div className="floating-logistics-icon icon-drift-1"><LuPackage /></div>
                <div className="floating-logistics-icon icon-drift-2"><LuStore /></div>
                <div className="floating-logistics-icon icon-drift-3"><LuTrendingUp /></div>
                <div className="floating-logistics-icon icon-drift-4"><LuDollarSign /></div>
                <div className="floating-logistics-icon icon-drift-5"><LuBox /></div>
                <div className="floating-logistics-icon icon-drift-6"><LuShoppingBag /></div>
            </div>

            <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div className="brand-horizontal" style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center' }}>
                    <img src="/SILA-LOGO.png" className="login-logo-img" alt="SILA" style={{ height: '120px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))', objectFit: 'contain' }} />
                    <div style={{ width: '4px', height: '50px', background: 'linear-gradient(180deg, rgba(26,86,219,0), rgba(26,86,219,0.8), rgba(26,86,219,0))', borderRadius: '4px' }}></div>
                    <h1 className="login-title" style={{ color: '#1a56db', fontWeight: '800', margin: 0, fontSize: '1.5rem', lineHeight: '30px' }}>{t.loginTitle || 'Sign in'}</h1>
                </div>
                <p className="login-subtitle" style={{ color: '#475569', fontSize: '1rem', fontWeight: '500',  }}>{t.loginSubtitle || 'Welcome back to the platform.'}</p>
            </div>

            <Card className="login-card">
                {/* Choice 5: Mesh-Aura Internal Assets */}
                <div className="card-mesh-aura-layer">
                    <div className="aura-blob aura-blob-1"></div>
                    <div className="aura-blob aura-blob-2"></div>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="login-error-card">
                            <FiAlertCircle className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Input
                        label={t.emailLabel || "Email"}
                        type="email"
                        placeholder={t.emailPlaceholder || "your.email@example.com"}
                        value={email}
                        onChange={handleEmailChange}
                        disabled={loading}
                    />

                    <Input
                        label={t.passwordLabel || "Password"}
                        type="password"
                        placeholder={t.passwordPlaceholder || "Enter your password"}
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                    />

                    <div className="form-actions">
                        <Checkbox
                            label={t.rememberMe || "Remember me"}
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                        />
                        <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>{t.forgotPassword || 'Forgot password?'}</a>
                    </div>
                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Entering...' : 'Sign in'}
                    </Button>
                    <div className="register-link">
                        {t.noAccount || "New here?"} <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>{t.registerAsBusiness || "Join us"}</a>
                    </div>
                </form>
            </Card>

            <div className="login-footer">
                {t.loginFooter || '© 2026 Importers. All rights reserved.'}
            </div>
        </div>
    );
};

export default Login;
