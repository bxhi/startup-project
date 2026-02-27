import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Checkbox from '../../components/Checkbox/Checkbox';
import { FiAlertCircle } from 'react-icons/fi';
import './Login.css';
import authService from '../../api/authService';

const Login = ({ onNavigate, onForgotPassword }) => {
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
            alert('Login successful!');
        } catch (err) {
            console.error('Login error full object:', err);
            console.error('Error Response:', err.response);
            console.error('Error Request:', err.request);
            console.error('Error Message:', err.message);

            if (err.response) {
                if (err.response.status === 401) {
                    setError('Please enter valid credentials.');
                } else if (err.response.status === 403) {
                    setError(err.response.data?.message || 'Your account is still under review. Please wait 24-48 hours.');
                } else if (err.response.status === 404) {
                    setError('Account not found.');
                } else {
                    setError(err.response.data?.message || 'Login failed. Please try again.');
                }
            } else if (err.request) {
                setError('Network error: Server is unreachable or CORS blocked.');
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

    return (
        <div className="login-container">
            <div className="login-header">
                <h1 className="login-title">Importers</h1>
                <p className="login-subtitle">Welcome back! Please login to your account.</p>
            </div>

            <Card className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="login-error-card">
                            <FiAlertCircle className="error-icon" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={loading}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                    />

                    <div className="form-actions ">
                        <Checkbox
                            label="Remember me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                        />
                        <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>Forgot password?</a>
                    </div>
                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="register-link">
                        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Register as Business</a>
                    </div>
                </form>
            </Card>

            <div className="login-footer">
                © 2026 Importers. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
