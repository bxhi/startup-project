import React from 'react';
import './Wallet.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Button from '../../components/Button/Button';
import { FiPlus, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { MdOutlineCallMade, MdOutlineCallReceived } from 'react-icons/md';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';

const Wallet = ({ onNavigate }) => {
    const transactions = [
        {
            id: 'TXN-101',
            date: '2026-02-14',
            type: 'Credit',
            description: 'Order Payment Released - ORD-2026-002',
            amount: '+€4 500',
            status: 'completed',
            isPositive: true
        },
        {
            id: 'TXN-102',
            date: '2026-02-12',
            type: 'Debit',
            description: 'Subscription Renewal - Premium Plan',
            amount: '-€99',
            status: 'completed',
            isPositive: false
        },
        {
            id: 'TXN-103',
            date: '2026-02-10',
            type: 'Credit',
            description: 'Points Purchase',
            amount: '+€1 000',
            status: 'completed',
            isPositive: true
        },
        {
            id: 'TXN-104',
            date: '2026-02-08',
            type: 'Credit',
            description: 'Order Payment Released - ORD-2026-001',
            amount: '+€7 500',
            status: 'completed',
            isPositive: true
        },
        {
            id: 'TXN-105',
            date: '2026-02-05',
            type: 'Debit',
            description: 'Withdrawal to Bank Account',
            amount: '-€5 000',
            status: 'pending',
            isPositive: false
        }
    ];

    const plans = [
        {
            name: 'Basic',
            price: '€0',
            features: [
                '10 active offers',
                '50 proposals per month',
                'Basic analytics',
                'Email support',
                '5% transaction fee'
            ],
            isPopular: false,
            isCurrent: false
        },
        {
            name: 'Premium',
            price: '€99',
            features: [
                'Unlimited active offers',
                'Unlimited proposals',
                'Advanced analytics',
                'Priority support',
                '3% transaction fee',
                'Featured listings'
            ],
            isPopular: true,
            isCurrent: true
        },
        {
            name: 'Enterprise',
            price: '€299',
            features: [
                'Everything in Premium',
                'Dedicated account manager',
                'Custom integrations',
                'API access',
                '2% transaction fee',
                'White-label options'
            ],
            isPopular: false,
            isCurrent: false
        }
    ];

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="wallet" contentClassName="wallet-layout">
            <div className="wallet-container animate-fade-in">

                {/* Header */}
                <div className="wallet-header">
                    <div className="header-text">
                        <h1>Wallet & Subscription</h1>
                        <p>Manage your balance and subscription</p>
                    </div>
                </div>

                {/* Balance Card Section */}
                <div className="balance-showcase">

                    {/* Market-Vibe Animated Layer (Icons) */}
                    <div className="wallet-market-layer">
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

                    <div className="balance-background-mesh">
                        {/* Animated blobs for mesh gradient effect */}
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                        <div className="blob blob-3"></div>
                        <div className="blob blob-4"></div>
                        <div className="blob blob-5"></div>
                        <div className="blob-rainbow"></div>
                    </div>

                    <div className="balance-content">
                        <div className="balance-top-row">
                            <div className="main-balance">
                                <span>Available Balance</span>
                                <h2>€24 580</h2>
                                <p className="last-updated">Last updated: Today, 10:30 AM</p>
                            </div>
                            <div className="balance-actions">
                                <Button className="btn-buy-points" variant="outline">
                                    <FiPlus /> Buy Points
                                </Button>
                                <Button className="btn-withdraw" variant="primary">
                                    <FiDownload /> Withdraw
                                </Button>
                            </div>
                        </div>

                        <div className="balance-stats-row">
                            <div className="glass-stat-box">
                                <span>This Month Earnings</span>
                                <h3>€31,240</h3>
                            </div>
                            <div className="glass-stat-box">
                                <span>Pending Escrow</span>
                                <h3>€7,500</h3>
                            </div>
                            <div className="glass-stat-box">
                                <span>Total Withdrawn</span>
                                <h3>€45,000</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History Section */}
                <div className="transactions-section">
                    <div className="section-header">
                        <h2>Transaction History</h2>
                    </div>

                    <div className="transactions-table-card">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(txn => (
                                    <tr key={txn.id}>
                                        <td className="date-cell">{txn.date}</td>
                                        <td>
                                            <div className={`txn-type ${txn.isPositive ? 'credit' : 'debit'}`}>
                                                {txn.isPositive ? <MdOutlineCallReceived /> : <MdOutlineCallMade />}
                                                <span>{txn.type}</span>
                                            </div>
                                        </td>
                                        <td className="desc-cell">{txn.description}</td>
                                        <td className={`amount-cell ${txn.isPositive ? 'positive' : 'negative'}`}>
                                            {txn.amount}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${txn.status}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Subscriptions Section */}
                <div className="subscriptions-section">
                    <div className="section-header">
                        <h2>Subscription Plans</h2>
                    </div>

                    <div className="plans-grid">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`plan-card ${plan.isPopular ? 'popular-plan' : ''}`}>
                                {plan.isPopular && (
                                    <div className="popular-badge">Most Popular</div>
                                )}
                                {plan.isCurrent && (
                                    <div className="current-badge">Current Plan</div>
                                )}

                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-price">
                                        <span className="amount">{plan.price}</span>
                                        <span className="period">/month</span>
                                    </div>
                                </div>

                                <div className="plan-features">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="feature-item">
                                            <FiCheckCircle className="check-icon" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="btn-subscribe"
                                    variant={plan.isCurrent ? 'outline' : 'primary'}
                                    disabled={plan.isCurrent}
                                >
                                    {plan.isCurrent ? 'Current Plan' : 'Upgrade'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Wallet;
