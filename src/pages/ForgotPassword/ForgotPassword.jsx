import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './ForgotPassword.css';
import authService from '../../api/authService';
import { useLanguage } from '../../context/LanguageContext';

const ForgotPassword = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccessMessage('');
    };

    const handleSendCode = async () => {
        const trimmedEmail = formData.email.trim();
        if (!trimmedEmail) {
            setError('Please enter your email.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await authService.forgotPassword(trimmedEmail);
            setSuccessMessage(t.otpSentSuccess || 'Verification code sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const trimmedCode = formData.verificationCode.trim();
        const trimmedEmail = formData.email.trim();
        
        if (!trimmedCode) {
            setError('Please enter the verification code.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await authService.verifyResetOtp(trimmedEmail, trimmedCode);
            setSuccessMessage(t.otpVerifySuccess || 'Code verified successfully.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || t.otpVerifyError || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const trimmedEmail = formData.email.trim();
        const trimmedCode = formData.verificationCode.trim();

        if (!formData.newPassword || !formData.confirmPassword) {
            setError('Please fill in all password fields.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await authService.resetPassword(trimmedEmail, trimmedCode, formData.newPassword);
            setSuccessMessage(t.passResetSuccess || 'Password reset successfully!');
            setTimeout(() => {
                onNavigate();
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setError('');
        setSuccessMessage('');
        if (step > 1) {
            setStep(step - 1);
        } else {
            onNavigate();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="forgot-content">
                        <h2 className="forgot-title">{t.resetPassTitle || 'Reset Password'}</h2>
                        <p className="forgot-subtitle">{t.resetPassSubtitle || 'Enter your email to receive a verification code.'}</p>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            autoFocus
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="forgot-content">
                        <h2 className="forgot-title">{t.verifyCodeTitle || 'Verify Code'}</h2>
                        <p className="forgot-subtitle">
                            {t.verifyCodeSubtitle?.replace('{email}', formData.email) || `We've sent a 6-digit code to ${formData.email}`}
                        </p>
                        <Input
                            label="Verification Code"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={formData.verificationCode}
                            onChange={(e) => handleChange('verificationCode', e.target.value)}
                            autoFocus
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="forgot-content step-3">
                        <h2 className="forgot-title">{t.createNewPassTitle || 'New Password'}</h2>
                        <p className="forgot-subtitle">{t.createNewPassSubtitle || 'Create a strong password for your account.'}</p>
                        <div className="password-inputs">
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                autoFocus
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        document.body.style.backgroundColor = '#f8fafc';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="forgot-container">
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="forgot-header">
                <h1 className="forgot-main-title">importers</h1>
                <p className="forgot-main-subtitle">Secure access to your account</p>
            </div>

            <Card className="forgot-card">
                <div className="message-container">
                    {error && (
                        <div className="status-message error">
                            <i className="ri-error-warning-line"></i> {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="status-message success">
                            <i className="ri-checkbox-circle-line"></i> {successMessage}
                        </div>
                    )}
                </div>
                
                {renderStep()}

                <div className="forgot-actions">
                    <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        disabled={loading}
                        className="btn-back"
                    >
                        {step === 1 ? 'Back to Login' : 'Previous'}
                    </Button>
                    
                    {step === 1 && (
                        <Button onClick={handleSendCode} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </Button>
                    )}
                    {step === 2 && (
                        <Button onClick={handleVerifyCode} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                    )}
                    {step === 3 && (
                        <Button onClick={handleResetPassword} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    )}
                </div>
            </Card>

            <div className="forgot-footer">
                © 2026 IMPORTERS WORLD • SECURE
            </div>
        </div>
    );
};

export default ForgotPassword;
