import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CreateOfferModal from '../../components/CreateOfferModal/CreateOfferModal';
import CreateOfferCard from '../../components/CreateOfferCard/CreateOfferCard';
import { FiFileText, FiShoppingCart, FiBox, FiArrowUpRight, FiArrowDownRight, FiPlus } from 'react-icons/fi';
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2';
import { IoWalletOutline } from 'react-icons/io5';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';
import { authApi, negotiationApi, ordersApi, walletApi } from '../../api/api';

const Dashboard = ({ onNavigate }) => {
    const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
    const { t, language } = useLanguage();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [vStatus, setVStatus] = useState(localStorage.getItem('verificationStatus') || user.status);

    const [negotiationsCount, setNegotiationsCount] = useState(0);
    const [confirmedOrdersCount, setConfirmedOrdersCount] = useState(0);
    const [deliveredOrdersCount, setDeliveredOrdersCount] = useState(0);
    const [pointsBalance, setPointsBalance] = useState(0);
    const [dynamicPieData, setDynamicPieData] = useState([]);
    const [dynamicLineData, setDynamicLineData] = useState([]);

    useEffect(() => {
        const refreshProfileAndStats = async () => {
            try {
                // Profile
                const profileRes = await authApi.get('/auth/profile');
                if (profileRes.data) {
                    const latestUser = profileRes.data.user || profileRes.data;
                    const latestProfile = profileRes.data.profile;
                    
                    let status = latestUser.status || latestUser.importatorProfile?.verificationStatus || latestUser.clientProfile?.verificationStatus;
                    const allStatuses = [
                        latestUser.status, 
                        latestUser.importatorProfile?.verificationStatus, 
                        latestUser.clientProfile?.verificationStatus,
                        latestProfile?.verificationStatus
                    ];
                    
                    if (allStatuses.some(s => s && String(s).toUpperCase() === 'APPROVED')) {
                        status = 'APPROVED';
                    }
                    
                    setUser(latestUser);
                    setVStatus(status);
                    
                    localStorage.setItem('user', JSON.stringify(latestUser));
                    localStorage.setItem('verificationStatus', status);
                }

                if (!user.userId) return;

                // Negotiations
                const negRes = await negotiationApi.get('/negotiation', { params: { importatorId: user.userId }});
                const negotiations = Array.isArray(negRes.data) ? negRes.data : (negRes.data?.data || []);
                setNegotiationsCount(negotiations.length);

                // Orders
                let orders = [];
                try {
                    const params = user.role === 'client' ? { clientId: user.userId } : { importatorId: user.userId };
                    const ordRes = await ordersApi.get('/orders', { params });
                    orders = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data?.data || []);
                } catch (err) {
                    console.error('Failed to fetch orders, using empty list:', err);
                }
                const confirmed = orders.filter(o => o && (o.status === 'CONFIRMED' || o.status === 'SHIPPED')).length;
                const delivered = orders.filter(o => o && (o.status === 'DELIVERED' || o.status === 'COMPLETED')).length;
                setConfirmedOrdersCount(confirmed);
                setDeliveredOrdersCount(delivered);

                // Orders Status Pie
                const pie = [
                    { name: t.completed || 'Completed', value: delivered, color: '#22c55e' },
                    { name: t.inProgress || 'In Progress', value: confirmed, color: '#eab308' },
                    { name: t.pending || 'Pending', value: orders.filter(o => o && o.status === 'PENDING').length, color: '#1a56db' },
                    { name: t.cancelled || 'Cancelled', value: orders.filter(o => o && o.status === 'CANCELLED').length, color: '#ef4444' }
                ].filter(p => p.value > 0);
                setDynamicPieData(pie.length > 0 ? pie : [
                    { name: 'No Orders', value: 1, color: '#cbd5e1' }
                ]);

                // Calculate dynamic monthly earnings
                const months = language === 'ar' 
                    ? [t.jan || 'جانفي', t.feb || 'فيفري', t.mar || 'مارس', t.apr || 'أفريل', t.may || 'ماي', t.jun || 'جوان', t.jul || 'جويلية', t.aug || 'أوت', t.sep || 'سبتمبر', t.oct || 'أكتوبر', t.nov || 'نوفمبر', t.dec || 'ديسمبر']
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                const monthlyValues = new Array(12).fill(0);
                let hasEarnings = false;
                orders.forEach(o => {
                    if (o && (o.status === 'DELIVERED' || o.status === 'COMPLETED' || o.status === 'SHIPPED' || o.status === 'CONFIRMED')) {
                        const date = o.createdAt ? new Date(o.createdAt) : null;
                        if (date) {
                            const monthIndex = date.getMonth();
                            monthlyValues[monthIndex] += (o.totalPrice || o.price || 500);
                            hasEarnings = true;
                        }
                    }
                });

                const currentMonth = new Date().getMonth();
                const calculatedLineData = [];
                for (let i = 5; i >= 0; i--) {
                    const idx = (currentMonth - i + 12) % 12;
                    calculatedLineData.push({
                        month: months[idx],
                        earnings: hasEarnings ? monthlyValues[idx] : [12000, 15000, 18000, 22000, 26000, 32000][5 - i]
                    });
                }
                setDynamicLineData(calculatedLineData);

                // Wallet
                try {
                    const walRes = await walletApi.get('/wallet/balance');
                    setPointsBalance(walRes.data?.pointBalance || 0);
                } catch (err) {
                    console.error('Failed to fetch wallet balance:', err);
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };
        refreshProfileAndStats();
    }, [user.userId, t, language]);

    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);

    const handleCreateOfferClick = async () => {
        if (!user.userId) return;
        const toastId = toast.loading(language === 'ar' ? 'جاري التحقق من الرصيد...' : 'Checking credit limits...');
        try {
            const res = await walletApi.get(`/wallet/can-create-offer?userId=${user.userId}`);
            if (res.data && res.data.allowed === false) {
                const errorMsg = language === 'ar'
                    ? 'يرجى ترقية اشتراكك بإحدى الباقات أو شراء نقاط للمتابعة.'
                    : 'Please upgrade with one of the packs or buy points to create a new offer.';
                toast.error(errorMsg, { id: toastId });
                return;
            }
            toast.dismiss(toastId);
            setIsCreateOfferOpen(true);
        } catch (err) {
            console.error('Credit limit check failed:', err);
            toast.error(language === 'ar' ? 'فشل التحقق من الرصيد. يرجى المحاولة مجدداً.' : 'Failed to verify credit limit. Please try again.', { id: toastId });
        }
    };

    const statCards = [
        { title: t.activeNegotiations || 'Active Negotiations', value: (negotiationsCount || 0).toString(), trend: '+0%', isPositive: true, icon: <HiOutlineChatBubbleOvalLeftEllipsis />, colorClass: 'green' },
        { title: t.confirmedOrders || 'Confirmed Orders', value: (confirmedOrdersCount || 0).toString(), trend: '+0%', isPositive: true, icon: <FiFileText />, colorClass: 'blue' },
        { title: t.deliveredOrders || 'Delivered Orders', value: (deliveredOrdersCount || 0).toString(), trend: '+0%', isPositive: true, icon: <FiShoppingCart />, colorClass: 'orange' },
        { title: t.pointsBalance || 'Points Balance', value: (pointsBalance || 0).toLocaleString() + ' ' + (t.ptsUnit || 'PTS'), trend: '+0%', isPositive: true, icon: <IoWalletOutline />, colorClass: 'yellow' }
    ];

    const pieData = [
        { name: t.completed, value: 45, color: '#22c55e' },
        { name: t.inProgress, value: 25, color: '#eab308' },
        { name: t.pending, value: 20, color: '#1a56db' },
        { name: t.cancelled, value: 10, color: '#ef4444' }
    ];

    const lineData = [
        { month: t.jan, earnings: 12000 },
        { month: t.feb, earnings: 15000 },
        { month: t.mar, earnings: 18000 },
        { month: t.apr, earnings: 22000 },
        { month: t.may, earnings: 26000 },
        { month: t.jun, earnings: 32000 },
    ];

    const lineDataEn = [
        { month: 'Jan', earnings: 12000 },
        { month: 'Feb', earnings: 15000 },
        { month: 'Mar', earnings: 18000 },
        { month: 'Apr', earnings: 22000 },
        { month: 'May', earnings: 26000 },
        { month: 'Jun', earnings: 32000 },
    ];
    const chartData = dynamicLineData.length > 0 ? dynamicLineData : (language === 'ar' ? lineData : lineDataEn);

    const recentActivity = [
        { id: '#12453', client: 'ABC Trading', action: t.actNewProposal, amount: '€12,500', time: '2 min', status: t.statusNew, statusKey: 'new' },
        { id: '#12452', client: 'XYZ Imports', action: t.actOrderCompleted, amount: '€8,200', time: '1h', status: t.completed, statusKey: 'completed' },
        { id: '#12451', client: 'Global Traders', action: t.actPaymentReceived, amount: '€15,000', time: '3h', status: t.statusPaid, statusKey: 'paid' },
        { id: '#12450', client: 'Euro Supplies', action: t.actNegotiationStarted, amount: '€5,500', time: '5h', status: t.statusNegotiating, statusKey: 'negotiating' }
    ];

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="dashboard">
            <div className="dashboard-header">
                <h1>{t.dashboardTitle}</h1>
                <p>{t.dashboardSubtitle}</p>
            </div>

            <div className="stat-cards-container">
                {statCards.map((card, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-card-top">
                            <div className={`icon-container ${card.colorClass}`}>{card.icon}</div>
                            <div className={`trend-badge ${card.isPositive ? 'positive' : 'negative'}`}>
                                {card.isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                <span>{card.trend.replace('+', '').replace('-', '')}</span>
                            </div>
                        </div>
                        <div className="stat-card-bottom">
                            <h3 className="stat-value">{card.value}</h3>
                            <p className="stat-label">{card.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-charts-row">
                <div className="chart-card line-chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>{t.earningsOverview}</h2>
                            <p className="subtitle">{t.monthlyEarnings}</p>
                        </div>
                        <select className="period-select">
                            <option>{t.last6Months}</option>
                            <option>{t.last12Months}</option>
                            <option>{t.thisYear}</option>
                        </select>
                    </div>
                    <div className="line-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31, 115, 183, 0.1)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(v) => `${v} DZD`}
                                    orientation={language === 'ar' ? 'right' : 'left'}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 600 }}
                                    itemStyle={{ color: '#0f172a' }}
                                    formatter={(value) => `${value} DZD`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="var(--primary, #1a56db)"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: 'var(--primary, #1a56db)', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card pie-chart-card">
                    <h2>{t.ordersByStatus}</h2>
                    <div className="pie-chart-content">
                        <div className="pie-chart-wrapper">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={dynamicPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {dynamicPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="custom-legend below">
                            {dynamicPieData.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <div className="legend-label-group">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="legend-label">{item.name}</span>
                                    </div>
                                    <span className="legend-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-left-column">
                    <div className="dashboard-section-card quick-actions-card">
                        <h3>{t.quickActions}</h3>
                        <div className="actions-buttons">
                            <CreateOfferCard 
                                onClick={handleCreateOfferClick}
                                isPending={isPending}
                                t={t}
                            />
                            <button className="btn btn-outline browse-commands-btn" onClick={() => onNavigate('commands')}>
                                <FiFileText /> {t.browseCommands}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dashboard-right-column">
                    <div className="dashboard-section-card this-month-card">
                        <h3>{t.thisMonth}</h3>
                        <div className="month-stats-grid">
                            <div className="month-stat-item">
                                <span className="stat-value">4.8</span>
                                <span className="stat-label">{t.avgRating}</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">€31,240</span>
                                <span className="stat-label">{t.totalEarnings}</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">18</span>
                                <span className="stat-label">{t.ordersCompleted}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section-card recent-activity-card">
                <h3>{t.recentActivity}</h3>
                <div className="table-container">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>{t.orderId}</th>
                                <th>{t.client}</th>
                                <th>{t.action}</th>
                                <th>{t.amount}</th>
                                <th>{t.time}</th>
                                <th>{t.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((activity, index) => (
                                <tr key={index}>
                                    <td className="id-cell">{activity.id}</td>
                                    <td>
                                        <div className="client-info-cell">
                                            <div className="client-avatar">{activity.client.charAt(0)}</div>
                                            <span>{activity.client}</span>
                                        </div>
                                    </td>
                                    <td className="action-cell">{activity.action}</td>
                                    <td className="amount-cell">{activity.amount}</td>
                                    <td className="time-cell">{activity.time}</td>
                                    <td>
                                        <span className={`status-badge ${activity.statusKey}`}>{activity.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateOfferModal isOpen={isCreateOfferOpen} onClose={() => setIsCreateOfferOpen(false)} />
        </DashboardLayout>
    );
};

export default Dashboard;
