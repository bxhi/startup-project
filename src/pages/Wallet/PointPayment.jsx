import React, { useState, useEffect } from 'react';
import './PointPayment.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import Button from '../../components/Button/Button';
import { walletApi } from '../../api/api';
import { useLanguage } from '../../context/LanguageContext';
import { FiShield, FiZap, FiAward, FiCpu, FiStar, FiChevronLeft, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const PointPayment = ({ onNavigate }) => {
    const { language } = useLanguage();
    const [balance, setBalance] = useState(0);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPack, setSelectedPack] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('EDAHABIA');

    const [customPoints, setCustomPoints] = useState('');
    const [purchaseType, setPurchaseType] = useState('pack'); // 'pack' or 'custom'

    useEffect(() => {
        fetchBalance();
        fetchPacks();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await walletApi.get('/wallet/balance');
            setBalance(response.data.points || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(0);
        }
    };

    const fetchPacks = async () => {
        try {
            const response = await walletApi.get('/wallet/packs');
            setPacks(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching packs:', error);
            setPacks([
                { id: 1, name: 'Starter Pack', points: 100, priceDzd: 500, icon: <FiZap /> },
                { id: 2, name: 'Pro Pack', points: 500, priceDzd: 2000, icon: <FiAward />, isPopular: true },
                { id: 3, name: 'Ultimate Pack', points: 2000, priceDzd: 7000, icon: <FiCpu /> }
            ]);
            setLoading(false);
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

        try {
            toast.loading(language === 'ar' ? 'جاري تحويلك للدفع...' : 'Redirecting to payment...');

            let response;
            if (purchaseType === 'pack') {
                response = await walletApi.post('/wallet/purchase/pack', {
                    packId: selectedPack.id
                });
            } else {
                // Custom purchase: ignore payment method as per instructions
                response = await walletApi.post('/wallet/purchase/custom', {
                    points: parseInt(customPoints)
                });
            }

            const checkoutUrl = response.data.checkoutUrl || response.data.paymentUrl;
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

    const labels = {
        title: language === 'ar' ? 'شحن الرصيد' : 'Reload Points',
        subtitle: language === 'ar' ? 'اختر الباقة المناسبة أو أدخل مبلغاً مخصصاً' : 'Choose a pack or enter a custom amount',
        currentBalance: language === 'ar' ? 'رصيد النقاط الحالي' : 'Current Points Balance',
        selectPack: language === 'ar' ? 'اختر باقة' : 'Select a Pack',
        customAmount: language === 'ar' ? 'مبلغ مخصص' : 'Custom Amount',
        pointsToBuy: language === 'ar' ? 'عدد النقاط المراد شراؤها' : 'Points to purchase',
        paymentMethod: language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
        payNow: language === 'ar' ? 'ادفع الآن' : 'Pay Now',
        securePayment: language === 'ar' ? 'دفع آمن ومحمي عبر Chargily' : 'Secure Payment via Chargily',
        mostPopular: language === 'ar' ? 'الأكثر مبيعاً' : 'Most Popular',
        points: language === 'ar' ? 'نقطة' : 'Points',
        switchCustom: language === 'ar' ? 'شراء مبلغ مخصص' : 'Buy custom amount',
        switchPacks: language === 'ar' ? 'العودة للباقات' : 'Back to packs',
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="wallet">
            <div className="point-payment-container animate-fade-in">
                <button className="back-btn" onClick={() => onNavigate('wallet')}>
                    <FiChevronLeft /> {language === 'ar' ? 'رجوع' : 'Back'}
                </button>

                <div className="payment-header">
                    <h1>{labels.title}</h1>
                    <p>{labels.subtitle}</p>
                </div>

                <div className="current-points-card">
                    <div className="points-info">
                        <span>{labels.currentBalance}</span>
                        <h2>{balance.toLocaleString()} {labels.points}</h2>
                    </div>
                    <FiStar className="balance-decor-icon" />
                </div>

                <div className="purchase-type-tabs">
                    <button
                        className={`tab-btn ${purchaseType === 'pack' ? 'active' : ''}`}
                        onClick={() => setPurchaseType('pack')}
                    >
                        {labels.selectPack}
                    </button>
                    <button
                        className={`tab-btn ${purchaseType === 'custom' ? 'active' : ''}`}
                        onClick={() => setPurchaseType('custom')}
                    >
                        {labels.customAmount}
                    </button>
                </div>

                {purchaseType === 'pack' ? (
                    <div className="packs-section animate-slide-up">
                        <div className="packs-grid">
                            {packs.map((pack) => (
                                <div
                                    key={pack.id}
                                    className={`pack-card ${selectedPack?.id === pack.id ? 'selected' : ''} ${pack.isPopular ? 'popular' : ''}`}
                                    onClick={() => setSelectedPack(pack)}
                                >
                                    {pack.isPopular && <div className="pack-badge">{labels.mostPopular}</div>}
                                    <div className="pack-icon">
                                        {pack.icon || <FiZap />}
                                    </div>
                                    <h3>{pack.name}</h3>
                                    <div className="pack-points">{pack.points} {labels.points}</div>
                                    <div className="pack-price">{pack.priceDzd} DZD</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="custom-section animate-slide-up">
                        <div className="custom-input-card">
                            <label>{labels.pointsToBuy}</label>
                            <div className="input-wrapper">
                                {(language === 'en' || language === 'fr') && (
                                    <FiCreditCard className="input-card-icon" />
                                )}
                                <input
                                    type="number"
                                    placeholder="e.g. 1500"
                                    value={customPoints}
                                    onChange={(e) => setCustomPoints(e.target.value)}
                                    className={(language === 'en' || language === 'fr') ? 'with-icon' : ''}
                                />
                                <span className="unit">{labels.points}</span>
                            </div>
                            <p className="price-hint">
                                {customPoints ? `≈ ${(customPoints * 5).toLocaleString()} DZD` : ''}
                                {language === 'ar' ? ' (تقريباً)' : ' (Estimated)'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="payment-footer">
                    <Button
                        className="btn-pay-now"
                        variant="primary"
                        onClick={handlePurchase}
                        disabled={purchaseType === 'pack' ? !selectedPack : !customPoints}
                    >
                        {labels.payNow}
                    </Button>
                    <div className="secure-notice">
                        <FiShield /> {labels.securePayment}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PointPayment;
