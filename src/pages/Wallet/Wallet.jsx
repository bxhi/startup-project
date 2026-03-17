import React from 'react';
import './Wallet.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Button from '../../components/Button/Button';
import { FiPlus, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { MdOutlineCallMade, MdOutlineCallReceived } from 'react-icons/md';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';
import { useLanguage } from '../../context/LanguageContext';

const Wallet = ({ onNavigate }) => {
    const { t, language } = useLanguage();

    const transactions = [
        { id: 'TXN-101', date: '2026-02-14', type: language === 'ar' ? 'إيداع' : 'Credit', description: language === 'ar' ? 'الإفراج عن دفعة الطلب - ORD-2026-002' : 'Order Payment Released - ORD-2026-002', amount: '+€4 500', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: true },
        { id: 'TXN-102', date: '2026-02-12', type: language === 'ar' ? 'خصم' : 'Debit', description: language === 'ar' ? 'تجديد الاشتراك - الباقة الممتازة' : 'Subscription Renewal - Premium Plan', amount: '-€99', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: false },
        { id: 'TXN-103', date: '2026-02-10', type: language === 'ar' ? 'إيداع' : 'Credit', description: language === 'ar' ? 'شراء نقاط' : 'Points Purchase', amount: '+€1 000', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: true },
        { id: 'TXN-104', date: '2026-02-08', type: language === 'ar' ? 'إيداع' : 'Credit', description: language === 'ar' ? 'الإفراج عن دفعة الطلب - ORD-2026-001' : 'Order Payment Released - ORD-2026-001', amount: '+€7 500', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: true },
        { id: 'TXN-105', date: '2026-02-05', type: language === 'ar' ? 'خصم' : 'Debit', description: language === 'ar' ? 'سحب إلى الحساب البنكي' : 'Withdrawal to Bank Account', amount: '-€5 000', status: language === 'ar' ? 'معلق' : 'pending', isPositive: false }
    ];

    const plans = language === 'ar' ? [
        { name: 'أساسي', price: '€0', features: ['10 عروض نشطة', '50 مقترحاً شهرياً', 'تحليلات أساسية', 'دعم بالبريد', 'رسوم معاملة 5%'], isPopular: false, isCurrent: false },
        { name: 'ممتاز', price: '€99', features: ['عروض نشطة غير محدودة', 'مقترحات غير محدودة', 'تحليلات متقدمة', 'دعم ذو أولوية', 'رسوم معاملة 3%', 'قوائم مميزة'], isPopular: true, isCurrent: true },
        { name: 'مؤسسي', price: '€299', features: ['كل مزايا الممتاز', 'مدير حساب مخصص', 'تكاملات مخصصة', 'وصول API', 'رسوم معاملة 2%', 'خيارات علامة بيضاء'], isPopular: false, isCurrent: false }
    ] : [
        { name: 'Basic', price: '€0', features: ['10 active offers', '50 proposals per month', 'Basic analytics', 'Email support', '5% transaction fee'], isPopular: false, isCurrent: false },
        { name: 'Premium', price: '€99', features: ['Unlimited active offers', 'Unlimited proposals', 'Advanced analytics', 'Priority support', '3% transaction fee', 'Featured listings'], isPopular: true, isCurrent: true },
        { name: 'Enterprise', price: '€299', features: ['Everything in Premium', 'Dedicated account manager', 'Custom integrations', 'API access', '2% transaction fee', 'White-label options'], isPopular: false, isCurrent: false }
    ];

    const labels = {
        walletTitle: language === 'ar' ? 'المحفظة والاشتراك' : 'Wallet & Subscription',
        walletSubtitle: language === 'ar' ? 'إدارة رصيدك واشتراكك' : 'Manage your balance and subscription',
        availableBalance: language === 'ar' ? 'الرصيد المتاح' : 'Available Balance',
        lastUpdated: language === 'ar' ? 'آخر تحديث: اليوم، 10:30 ص' : 'Last updated: Today, 10:30 AM',
        buyPoints: language === 'ar' ? 'شراء نقاط' : 'Buy Points',
        withdraw: language === 'ar' ? 'سحب' : 'Withdraw',
        thisMonthEarnings: language === 'ar' ? 'أرباح هذا الشهر' : 'This Month Earnings',
        pendingEscrow: language === 'ar' ? 'ضمان معلق' : 'Pending Escrow',
        totalWithdrawn: language === 'ar' ? 'إجمالي المسحوب' : 'Total Withdrawn',
        txHistory: language === 'ar' ? 'سجل المعاملات' : 'Transaction History',
        date: language === 'ar' ? 'التاريخ' : 'Date',
        type: language === 'ar' ? 'النوع' : 'Type',
        description: language === 'ar' ? 'الوصف' : 'Description',
        amount: language === 'ar' ? 'المبلغ' : 'Amount',
        subPlans: language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans',
        mostPopular: language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular',
        currentPlan: language === 'ar' ? 'الخطة الحالية' : 'Current Plan',
        perMonth: language === 'ar' ? '/شهر' : '/month',
        upgrade: language === 'ar' ? 'ترقية' : 'Upgrade',
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="wallet" contentClassName="wallet-layout">
            <div className="wallet-container animate-fade-in">
                <div className="wallet-header">
                    <div className="header-text">
                        <h1>{labels.walletTitle}</h1>
                        <p>{labels.walletSubtitle}</p>
                    </div>
                </div>

                <div className="balance-showcase">
                    <div className="wallet-market-layer">
                        {[LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox, LuShoppingBag, LuTrendingUp, LuStore, LuPackage, LuBox, LuDollarSign, LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuBox, LuDollarSign].map((Icon, i) => (
                            <div key={i} className={`market-icon icon-${i + 1}`}><Icon /></div>
                        ))}
                    </div>
                    <div className="balance-background-mesh">
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
                                <span>{labels.availableBalance}</span>
                                <h2>€24 580</h2>
                                <p className="last-updated">{labels.lastUpdated}</p>
                            </div>
                            <div className="balance-actions">
                                <Button className="btn-buy-points" variant="outline"><FiPlus /> {labels.buyPoints}</Button>
                                <Button className="btn-withdraw" variant="primary"><FiDownload /> {labels.withdraw}</Button>
                            </div>
                        </div>
                        <div className="balance-stats-row">
                            <div className="glass-stat-box"><span>{labels.thisMonthEarnings}</span><h3>€31,240</h3></div>
                            <div className="glass-stat-box"><span>{labels.pendingEscrow}</span><h3>€7,500</h3></div>
                            <div className="glass-stat-box"><span>{labels.totalWithdrawn}</span><h3>€45,000</h3></div>
                        </div>
                    </div>
                </div>

                <div className="transactions-section">
                    <div className="section-header"><h2>{labels.txHistory}</h2></div>
                    <div className="transactions-table-card">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>{labels.date}</th>
                                    <th>{labels.type}</th>
                                    <th>{labels.description}</th>
                                    <th>{labels.amount}</th>
                                    <th>{t.status}</th>
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
                                        <td className={`amount-cell ${txn.isPositive ? 'positive' : 'negative'}`}>{txn.amount}</td>
                                        <td><span className={`status-badge ${txn.isPositive ? 'completed' : 'pending'}`}>{txn.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="subscriptions-section">
                    <div className="section-header"><h2>{labels.subPlans}</h2></div>
                    <div className="plans-grid">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`plan-card ${plan.isPopular ? 'popular-plan' : ''}`}>
                                {plan.isPopular && <div className="popular-badge">{labels.mostPopular}</div>}
                                {plan.isCurrent && <div className="current-badge">{labels.currentPlan}</div>}
                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-price">
                                        <span className="amount">{plan.price}</span>
                                        <span className="period">{labels.perMonth}</span>
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
                                <Button className="btn-subscribe" variant={plan.isCurrent ? 'outline' : 'primary'} disabled={plan.isCurrent}>
                                    {plan.isCurrent ? labels.currentPlan : labels.upgrade}
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
