import React, { useState } from 'react';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Checkbox from '../../components/Checkbox/Checkbox';
import './Login.css';

const Login = ({ onNavigate, onForgotPassword }) => {
    const [email, setEmail] = useState('your.email@example.com');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password, rememberMe });
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1 className="login-title">Importer</h1>
                <p className="login-subtitle">Welcome back! Please login to your account.</p>
            </div>

            <Card className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="form-actions ">
                        <Checkbox
                            label="Remember me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>Forgot password?</a>
                    </div>
                    <Button type="submit" fullWidth>Login</Button>
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
