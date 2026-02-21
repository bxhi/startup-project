import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import './ForgotPassword.css';

const ForgotPassword = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSendCode = () => {
        if (formData.email) {
            setStep(2);
        }
    };

    const handleVerifyCode = () => {
        if (formData.verificationCode) {
            setStep(3);
        }
    };

    const handleResetPassword = () => {
        if (formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword) {
            console.log('Password reset:', formData);
            alert('Password reset successfully!');
            onNavigate();
        } else {
            alert('Passwords do not match or are empty.');
        }
    };

    const handleBack = () => {
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
                        <h2 className="forgot-title">Reset Your Password</h2>
                        <p className="forgot-subtitle">Enter your email address and we'll send you a verification code.</p>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="forgot-content">
                        <h2 className="forgot-title">Verify Your Code</h2>
                        <p className="forgot-subtitle">We've sent a verification code to {formData.email}. Enter it below.</p>
                        <Input
                            label="Verification Code"
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={formData.verificationCode}
                            onChange={(e) => handleChange('verificationCode', e.target.value)}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="forgot-content">
                        <h2 className="forgot-title">Create New Password</h2>
                        <p className="forgot-subtitle">Enter your new password below.</p>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-header">
                <h1 className="forgot-main-title">Importators</h1>
                <p className="forgot-main-subtitle">Forgot your password?</p>
            </div>

            <Card className="forgot-card">
                {renderStep()}

                <div className="forgot-actions">
                    <Button variant="outline" onClick={handleBack}>
                        {step === 1 ? 'Login' : 'Back'}
                    </Button>
                    {step === 1 && (
                        <Button onClick={handleSendCode}>Send Code</Button>
                    )}
                    {step === 2 && (
                        <Button onClick={handleVerifyCode}>Verify Code</Button>
                    )}
                    {step === 3 && (
                        <Button onClick={handleResetPassword}>Reset Password</Button>
                    )}
                </div>
            </Card>

            <div className="forgot-footer">
                © 2026 Importers. All rights reserved.
            </div>
        </div>
    );
};

export default ForgotPassword;
