import React, { useEffect } from 'react';
import './Onboarding.css';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';

const Onboarding = ({ onNavigate }) => {
    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    const RainbowButton = ({ onClick, children, className = '', buttonClass = '' }) => (
        <div className={`rainbow-button-container ${className}`} onClick={onClick}>
            <button className={`big-black-btn ${buttonClass}`}>
                {children}
            </button>
        </div>
    );

    return (
        <div className="onboarding-page">
            {/* Market-Vibe Animated Layer */}
            <div className="onboarding-market-layer">
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
                <div className="market-icon icon-19"><LuShoppingBag /></div>
                <div className="market-icon icon-20"><LuPackage /></div>
                <div className="market-icon icon-21"><LuTrendingUp /></div>
                <div className="market-icon icon-22"><LuStore /></div>
                <div className="market-icon icon-23"><LuDollarSign /></div>
                <div className="market-icon icon-24"><LuBox /></div>
                <div className="market-icon icon-25"><LuShoppingBag /></div>
                <div className="market-icon icon-26"><LuPackage /></div>
                <div className="market-icon icon-27"><LuTrendingUp /></div>
                <div className="market-icon icon-28"><LuStore /></div>
                <div className="market-icon icon-29"><LuDollarSign /></div>
                <div className="market-icon icon-30"><LuBox /></div>
                <div className="market-icon icon-31"><LuShoppingBag /></div>
                <div className="market-icon icon-32"><LuPackage /></div>
                <div className="market-icon icon-33"><LuTrendingUp /></div>
                <div className="market-icon icon-34"><LuStore /></div>
                <div className="market-icon icon-35"><LuDollarSign /></div>
                <div className="market-icon icon-36"><LuBox /></div>
                <div className="market-icon icon-37"><LuShoppingBag /></div>
                <div className="market-icon icon-38"><LuTrendingUp /></div>
                <div className="market-icon icon-39"><LuStore /></div>
                <div className="market-icon icon-40"><LuPackage /></div>
                <div className="market-icon icon-41"><LuShoppingBag /></div>
                <div className="market-icon icon-42"><LuPackage /></div>
                <div className="market-icon icon-43"><LuTrendingUp /></div>
                <div className="market-icon icon-44"><LuStore /></div>
                <div className="market-icon icon-45"><LuDollarSign /></div>
                <div className="market-icon icon-46"><LuBox /></div>
                <div className="market-icon icon-47"><LuShoppingBag /></div>
                <div className="market-icon icon-48"><LuPackage /></div>
                <div className="market-icon icon-49"><LuTrendingUp /></div>
                <div className="market-icon icon-50"><LuStore /></div>
                <div className="market-icon icon-51"><LuDollarSign /></div>
                <div className="market-icon icon-52"><LuBox /></div>
                <div className="market-icon icon-53"><LuShoppingBag /></div>
                <div className="market-icon icon-54"><LuPackage /></div>
                <div className="market-icon icon-55"><LuTrendingUp /></div>
                <div className="market-icon icon-56"><LuStore /></div>
                <div className="market-icon icon-57"><LuDollarSign /></div>
                <div className="market-icon icon-58"><LuBox /></div>
                <div className="market-icon icon-59"><LuShoppingBag /></div>
                <div className="market-icon icon-60"><LuPackage /></div>
                <div className="market-icon icon-61"><LuTrendingUp /></div>
                <div className="market-icon icon-62"><LuStore /></div>
                <div className="market-icon icon-63"><LuDollarSign /></div>
                <div className="market-icon icon-64"><LuBox /></div>
                <div className="market-icon icon-65"><LuShoppingBag /></div>
                <div className="market-icon icon-66"><LuPackage /></div>
                <div className="market-icon icon-67"><LuTrendingUp /></div>
                <div className="market-icon icon-68"><LuStore /></div>
                <div className="market-icon icon-69"><LuDollarSign /></div>
                <div className="market-icon icon-70"><LuBox /></div>
                <div className="market-icon icon-71"><LuShoppingBag /></div>
                <div className="market-icon icon-72"><LuPackage /></div>
                <div className="market-icon icon-73"><LuTrendingUp /></div>
                <div className="market-icon icon-74"><LuStore /></div>
                <div className="market-icon icon-75"><LuDollarSign /></div>
                <div className="market-icon icon-76"><LuBox /></div>
                <div className="market-icon icon-77"><LuShoppingBag /></div>
                <div className="market-icon icon-78"><LuTrendingUp /></div>
                <div className="market-icon icon-79"><LuStore /></div>
                <div className="market-icon icon-80"><LuPackage /></div>
            </div>

            {/* Background Animations */}
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
                <div className="blob blob-5"></div>
                <div className="blob blob-6"></div>
                <div className="blob blob-7"></div>
                <div className="blob blob-8"></div>
                <div className="blob blob-9"></div>
                <div className="blob blob-10"></div>
                <div className="blob blob-11"></div>
                <div className="blob blob-12"></div>
                <div className="blob-rainbow"></div>

                {/* Meteor Asset */}
                <div className="meteor-container">
                    <div className="meteor-streak streak-1"></div>
                    <div className="meteor-streak streak-2"></div>
                    <div className="meteor-streak streak-3"></div>
                </div>
            </div>

            {/* Nav */}
            <header className="onboarding-nav">
                <div className="nav-logo" onClick={() => window.location.reload()}>
                    <span className="logo-text">importers</span>
                </div>
                <div className="nav-actions">
                    <button onClick={() => onNavigate('dashboard')} className="nav-link">Dashboard</button>
                    <button onClick={() => onNavigate('login')} className="nav-link">Login</button>
                    <RainbowButton
                        onClick={() => onNavigate('signup')}
                        className="nav-btn-wrap"
                        buttonClass="nav-btn-black"
                    >
                        Get Started
                    </RainbowButton>
                </div>
            </header>

            {/* Main Content */}
            <main className="hero-container">
                <h1 className="hero-title animate-entrance">
                    Global Trade <br />
                    Made <span className="rainbow-text">Simple.</span>
                </h1>

                <p className="hero-subtitle animate-entrance delay-100">
                    The most powerful platform for modern importers. <br />
                    Secure, high-speed, and designed for your growth.
                </p>

                <div className="animate-entrance delay-200" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <RainbowButton onClick={() => onNavigate('signup')}>
                        Create Your Free Account
                    </RainbowButton>
                </div>

                <div className="store-section animate-entrance delay-300">
                    <button className="premium-store-card">
                        <div className="store-card-glow"></div>
                        <FaApple size={28} className="store-icon-silver" />
                        <div className="store-card-content">
                            <span className="store-card-label">Download on the</span>
                            <span className="store-card-title">App Store</span>
                        </div>
                    </button>
                    <button className="premium-store-card">
                        <div className="store-card-glow"></div>
                        <FaGooglePlay size={24} className="store-icon-silver" />
                        <div className="store-card-content">
                            <span className="store-card-label">Get it on</span>
                            <span className="store-card-title">Google Play</span>
                        </div>
                    </button>
                </div>
            </main>

            {/* Simple Footer Meta */}
            <footer className="onboarding-footer">
                © 2026 IMPORTERS APPLICATION. ALL RIGHTS RESERVED.
            </footer>
        </div>
    );
};

export default Onboarding;
