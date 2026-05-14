import React, { useState, useEffect } from 'react';
import './Wallet.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import PackCard from '../../components/PackCard/PackCard';
import { FiShield, FiZap, FiAward, FiCpu } from 'react-icons/fi';
import { MdOutlineCallMade, MdOutlineCallReceived } from 'react-icons/md';
import { LuPackage, LuBox, LuShoppingBag, LuTrendingUp, LuStore, LuDollarSign, LuGift, LuCreditCard, LuShoppingCart } from 'react-icons/lu';
import { useLanguage } from '../../context/LanguageContext';
import { walletApi } from '../../api/api';
import { toast } from 'react-hot-toast';

const Wallet = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);
    const [balance, setBalance] = useState(0);
    const [packs, setPacks] = useState([]);
    const [purchaseType, setPurchaseType] = useState('custom'); // 'pack' or 'custom'
    const [customPoints, setCustomPoints] = useState('');
    const [selectedPack, setSelectedPack] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('chargily');

    useEffect(() => {
        fetchBalance();
        fetchPacks();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await walletApi.get('/wallet/balance');
            setBalance(response.data.pointBalance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(0);
        }
    };

    const fetchPacks = async () => {
        try {
            // Priority: provided pack data
            const providedPacks = [
                {
                    "id": 5,
                    "type": "basic",
                    "name": language === 'ar' ? 'الباقة الأساسية' : "BASIC",
                    "priceDzd": 1000,
                    "points": 150,
                    "highlightedOffers": 5,
                    "activeOrdersLimit": 10,
                    "clientCommandLimit": 20,
                    "unlimitedClientCommands": false,
                    "basicStats": true,
                    "isActive": true,
                    "otherBenefits": language === 'ar' 
                        ? ["تلقي طلبات عملاء جديدة", "أولوية ظهور العروض", "لوحة تحكم إحصائية أساسية"]
                        : ["Receive new client requests", "Priority offer visibility", "Basic analytics dashboard"]
                },
                {
                    "id": 6,
                    "type": "pro",
                    "name": language === 'ar' ? 'الباقة الاحترافية' : "PRO",
                    "priceDzd": 2500,
                    "points": 400,
                    "highlightedOffers": 20,
                    "activeOrdersLimit": 20,
                    "clientCommandLimit": 50,
                    "unlimitedClientCommands": false,
                    "basicStats": true,
                    "isActive": true,
                    "isBestOffer": true,
                    "otherBenefits": language === 'ar'
                        ? ["رؤية متقدمة داخل المنصة", "وصول أكبر لنظام إدارة الطلبات"]
                        : ["Advanced visibility inside the platform", "More access to order management system"]
                },
                {
                    "id": 7,
                    "type": "business",
                    "name": language === 'ar' ? 'باقة الأعمال' : "BUSINESS",
                    "priceDzd": 4000,
                    "points": 700,
                    "highlightedOffers": 30,
                    "activeOrdersLimit": 50,
                    "clientCommandLimit": 999,
                    "unlimitedClientCommands": true,
                    "basicStats": true,
                    "isActive": true,
                    "otherBenefits": language === 'ar'
                        ? ["أولوية الظهور والاستخدام المهني", "وصول كامل لنظام إدارة الطلبات"]
                        : ["Priority visibility and professional usage", "Full access to order management system"]
                }
            ];
            
            // Sort by price ascending (biggest on the right)
            const sorted = providedPacks.sort((a, b) => a.priceDzd - b.priceDzd);
            setPacks(sorted);
            setSelectedPack(sorted[1]); // PRO by default
            setTimeout(() => setPurchaseType('pack'), 600);

            // Attempt to fetch from API, but use provided as base
            try {
                const response = await walletApi.get('/wallet/packs');
                if (response.data && response.data.length > 0) {
                    const apiSorted = response.data.sort((a, b) => a.priceDzd - b.priceDzd);
                    setPacks(apiSorted);
                }
            } catch (e) {
                console.warn('Using fallback packs as API fetch failed');
            }
        } catch (error) {
            console.error('Error in fetchPacks:', error);
        }
    };

    const handlePurchase = async () => {
        if (purchaseType === 'pack' && !selectedPack) {
            toast.error(language === 'ar' ? 'يرجى اختيار باقة أولاً' : 'Please select a pack first');
            return;
        }
        if (purchaseType === 'custom' && (!customPoints || customPoints <= 0)) {
            toast.error(language === 'ar' ? 'يرجى إدخال عدد نقاط صحيح' : 'Please enter a valid amount of points');
            return;
        }

        if (isPending) {
            toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
            return;
        }

        try {
            toast.loading(language === 'ar' ? 'جاري تحويلك للدفع...' : 'Redirecting to payment...');

            let response;
            const currentOrigin = window.location.origin;
            const redirectUrls = {
                success_url: `${currentOrigin}/?page=wallet&status=success`,
                failure_url: `${currentOrigin}/?page=wallet&status=failure`
            };

            if (purchaseType === 'pack') {
                response = await walletApi.post('/wallet/purchase/pack', {
                    packId: selectedPack.id,
                    ...redirectUrls
                });
            } else {
                response = await walletApi.post('/wallet/purchase/custom', {
                    points: parseInt(customPoints),
                    paymentMethod: paymentMethod === 'chargily' ? 'CHARGILY_APP' : paymentMethod.toUpperCase(),
                    ...redirectUrls
                });
            }

            const checkoutUrl = response.data?.checkoutUrl || response.data?.paymentUrl;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                toast.dismiss();
                toast.success(language === 'ar' ? 'تمت عملية الشراء بنجاح' : 'Purchase successful');
                fetchBalance();
            }
        } catch (error) {
            toast.dismiss();
            console.error('Purchase error:', error);
            toast.error(language === 'ar' ? 'فشلت عملية الشراء' : 'Purchase failed');
        }
    };

    const transactions = [
        { id: 'TXN-101', date: '2026-02-14', type: language === 'ar' ? 'إيداع' : 'Credit', description: language === 'ar' ? 'الإفراج عن دفعة الطلب - ORD-2026-002' : 'Order Payment Released - ORD-2026-002', amount: '+4 500', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: true },
        { id: 'TXN-102', date: '2026-02-12', type: language === 'ar' ? 'خصم' : 'Debit', description: language === 'ar' ? 'تجديد الاشتراك - الباقة الممتازة' : 'Subscription Renewal - Premium Plan', amount: '-99', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: false },
        { id: 'TXN-103', date: '2026-02-10', type: language === 'ar' ? 'إيداع' : 'Credit', description: language === 'ar' ? 'شراء نقاط' : 'Points Purchase', amount: '+1 000', status: language === 'ar' ? 'مكتمل' : 'completed', isPositive: true },

    ];

    const labels = {
        walletTitle: language === 'ar' ? 'المحفظة' : 'Wallet',
        walletSubtitle: language === 'ar' ? 'إدارة رصيدك وشراء النقاط' : 'Manage your balance and buy points',
        availableBalance: language === 'ar' ? 'رصيد النقاط' : 'Points Balance',
        lastUpdated: language === 'ar' ? 'آخر تحديث: الآن' : 'Last updated: Just now',
        buyPoints: language === 'ar' ? 'شراء نقاط مخصصة' : 'Buy Custom Points',
        txHistory: language === 'ar' ? 'سجل المعاملات' : 'Transaction History',
        date: language === 'ar' ? 'التاريخ' : 'Date',
        type: language === 'ar' ? 'النوع' : 'Type',
        description: language === 'ar' ? 'الوصف' : 'Description',
        amount: language === 'ar' ? 'النقاط' : 'Points',
        mostPopular: language === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular',
        customPurchase: language === 'ar' ? 'شراء مخصص' : 'Custom Purchase',
        packsPurchase: language === 'ar' ? 'باقات النقاط' : 'Points Packs',
        customPointsTitle: language === 'ar' ? 'نقاط مخصصة' : 'Custom Points',
        customPointsSubtitle: language === 'ar' ? 'أدخل أي مبلغ تريده' : 'Enter any amount you want',
        enterAmount: language === 'ar' ? 'مثال: 1000' : 'e.g. 1000',
        pts: language === 'ar' ? 'نقاط' : 'pts',
        acceptedMethods: language === 'ar' ? 'طرق الدفع المقبولة' : 'Accepted Payment Methods',
        dzd: language === 'ar' ? 'دج' : 'DZD',
        bestOffer: language === 'ar' ? 'أحسن عرض' : 'Best Offer',
        purchasePack: language === 'ar' ? 'شراء الباقة' : 'Purchase Pack',
        featured: language === 'ar' ? 'عروض مميزة' : 'Featured',
        selected: language === 'ar' ? 'مختارة' : 'Selected'
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

                <div className="balance-showcase mini-card">
                    <div className="balance-background-mesh">
                        <div className="blob-rainbow"></div>
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                    </div>

                    {/* Floating Market Icons Layer */}
                    <div className="balance-market-layer">
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
                    </div>

                    <div className="balance-content">
                        <div className="main-balance">
                            <span>{labels.availableBalance}</span>
                            <h2>{balance.toLocaleString()} {labels.pts}</h2>
                            <p className="last-updated">{labels.lastUpdated}</p>
                        </div>
                    </div>
                </div>

                <div className="purchase-section">
                    <div className="purchase-switch-container">
                        <div className={`purchase-switch-slider ${purchaseType === 'pack' ? 'right' : 'left'}`}></div>
                        <button
                            className={`switch-btn ${purchaseType === 'custom' ? 'active' : ''}`}
                            onClick={() => setPurchaseType('custom')}
                        >
                            <LuShoppingCart className="switch-icon" />
                            <span>{labels.customPurchase}</span>
                        </button>
                        <button
                            className={`switch-btn ${purchaseType === 'pack' ? 'active' : ''}`}
                            onClick={() => setPurchaseType('pack')}
                        >
                            <LuPackage className="switch-icon" />
                            <span>{labels.packsPurchase}</span>
                        </button>
                    </div>

                    {purchaseType === 'custom' ? (
                        <div className="custom-purchase-card">
                            <div className="card-left">
                                <div className="custom-header">
                                    <div className="custom-icon-wrapper">
                                        <LuGift />
                                    </div>
                                    <div>
                                        <h3>{labels.customPointsTitle}</h3>
                                        <p>{labels.customPointsSubtitle}</p>
                                    </div>
                                </div>

                                <div className="input-row-wrapper">
                                    <div className="wallet-input-field-container">
                                        <LuCreditCard className="input-icon" />
                                        <input
                                            type="number"
                                            placeholder={labels.enterAmount}
                                            value={customPoints}
                                            onChange={(e) => setCustomPoints(e.target.value)}
                                            dir="ltr"
                                        />
                                    </div>
                                    <span className="unit-badge">{labels.pts}</span>
                                </div>

                                <button
                                    className={`btn-buy-primary ${isPending ? 'pending-disabled' : ''}`}
                                    onClick={() => {
                                        if (isPending) {
                                            toast.error(t.pendingActionError, { id: 'pending-action-error' });
                                            return;
                                        }
                                        handlePurchase();
                                    }}
                                    disabled={!customPoints}
                                >
                                    {labels.buyPoints}
                                </button>
                            </div>

                            <div className="card-right">
                                <div className="turning-cards-container">
                                    <div className="turning-cards-inner">

                                        {/* FRONT: Edahabia Card */}
                                        <div className="turning-card-front">
                                            <div className="floating-edahabia-card">
                                                <div className="edahabia-bg">
                                                    <div className="edahabia-wireframe"></div>
                                                </div>
                                                <div className="edahabia-content">
                                                    <div className="edahabia-top">
                                                        <span className="edahabia-ar-gold">الذهبية</span>
                                                        <img src="/edahabia-logo.png" className="edahabia-post-logo-gold" alt="Algerie Poste" />
                                                    </div>
                                                    <div className="edahabia-center-text">
                                                        <span>بريد الجزائر</span>
                                                    </div>
                                                    <div className="edahabia-chip-hologram-row">
                                                        <FiCpu className="edahabia-chip" />
                                                        <div className="edahabia-hologram"></div>
                                                    </div>
                                                    <div className="edahabia-middle">
                                                        <div className="edahabia-number">
                                                            <span>6752</span>
                                                            <span>5682</span>
                                                            <span>8726</span>
                                                            <span className="edahabia-dynamic-pts">{customPoints ? customPoints.padStart(4, '0').slice(-4) : '9034'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="edahabia-bottom">
                                                        <div className="edahabia-arrow"></div>
                                                        <div className="edahabia-user-info">
                                                            <div className="edahabia-exp">
                                                                <span className="exp-val">06/29</span>
                                                                <span className="exp-label-ar">تنتهي بتاريخ</span>
                                                            </div>
                                                            <div className="edahabia-user">NOM ET PRÉNOM</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK: Premium Black Glass Card */}
                                        <div className="turning-card-back">
                                            <div className="premium-black-card">
                                                <div className="card-glass-layer">
                                                    <div className="card-top">
                                                        <FiCpu className="card-chip-icon" />
                                                        <span className="card-type">CUSTOM PACK</span>
                                                    </div>
                                                    <div className="card-middle">
                                                        <div className="card-amount">
                                                            {customPoints ? customPoints : '0'} <span className="card-pts">PTS</span>
                                                        </div>
                                                    </div>
                                                    <div className="card-bottom">
                                                        <div className="card-user">IMPORTERS USER</div>
                                                        <div className="card-network">
                                                            <div className="circle-solid"></div>
                                                            <div className="circle-glass"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="card-shadow"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="pack-cards-container">
                            {packs.map((pack) => (
                                <PackCard 
                                    key={pack.id}
                                    pack={pack}
                                    isSelected={selectedPack?.id === pack.id}
                                    onSelect={(id) => setSelectedPack(packs.find(p => p.id === id))}
                                    onPurchase={handlePurchase}
                                    t={labels}
                                />
                            ))}
                        </div>
                    )}

                    <div className="payment-methods">
                        <div className="methods-title">
                            <LuCreditCard /> <span>{labels.acceptedMethods}</span>
                        </div>
                        <div className="methods-grid">
                            <button
                                className={`method-badge method-cib ${paymentMethod === 'cib' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('cib')}
                            >
                                <div className="radio-circle"></div>
                                <img src="/cib-logo.png" alt="CIB" className="method-logo" />
                                <span>{language === 'ar' ? 'الدفع بـ CIB' : 'Pay with CIB'}</span>
                            </button>
                            <button
                                className={`method-badge method-edahabia ${paymentMethod === 'edahabia' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('edahabia')}
                            >
                                <div className="radio-circle"></div>
                                <img src="/edahabia-logo.png" alt="Edahabia" className="method-logo" />
                                <span>{language === 'ar' ? 'الدفع بـ Edahabia' : 'Pay with Edahabia'}</span>
                            </button>
                            <button
                                className={`method-badge method-chargily ${paymentMethod === 'chargily' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('chargily')}
                            >
                                <div className="radio-circle"></div>
                                <img src="/chargily-logo.png" alt="Chargily" className="method-logo" />
                                <span>{language === 'ar' ? 'الدفع بـ Chargily' : 'Pay with Chargily'}</span>
                            </button>
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
            </div>
        </DashboardLayout>
    );
};

export default Wallet;
