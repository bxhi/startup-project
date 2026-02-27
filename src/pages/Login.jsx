import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import './Login.css';

const Login = () => {
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
                <h1 className="login-title">Importator</h1>
                <p className="login-subtitle">Welcome back! Please login to your account.</p>
            </div>

            <Card className="login-card">
                <form className="login-form" onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
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

                    <div className="form-actions">
                        <Checkbox
                            label="Remember me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <Button type="submit" fullWidth>Login right here </Button>
                    <h1>hello everyone </h1>
                    <div className="register-link">
                        Don't have an account? <a href="#">Register as Business</a>
                    </div>
                    asdfasf
                </form>
            </Card>

            <div className="login-footer">
                © 2026 Importator. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
