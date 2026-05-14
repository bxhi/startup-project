import React, { useState } from 'react';
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

const Dashboard = ({ onNavigate }) => {
    const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
    const { t } = useLanguage();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);

    const statCards = [
        { title: t.activeCommands, value: '156', trend: '+12%', isPositive: true, icon: <FiFileText />, colorClass: 'blue' },
        { title: t.activeNegotiations, value: '42', trend: '+8%', isPositive: true, icon: <HiOutlineChatBubbleOvalLeftEllipsis />, colorClass: 'green' },
        { title: t.activeOrders, value: '28', trend: '-3%', isPositive: false, icon: <FiShoppingCart />, colorClass: 'orange' },
        { title: t.pointsBalance, value: '€24,580', trend: '+25%', isPositive: true, icon: <IoWalletOutline />, colorClass: 'yellow' }
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

    const { language } = useLanguage();
    const chartData = language === 'ar' ? lineData : lineDataEn;

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
                        <div className={`icon-container ${card.colorClass}`}>{card.icon}</div>
                        <div className={`trend ${card.isPositive ? 'positive' : 'negative'}`}>
                            {card.isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
                            <span>{card.trend.replace('+', '').replace('-', '')}</span>
                        </div>
                        <div className="stat-content">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
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
                                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#cbd5e1" strokeOpacity={1} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                    reversed={language === 'ar'}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(v) => `${v}`}
                                    orientation={language === 'ar' ? 'right' : 'left'}
                                />
                                <Tooltip />
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
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="custom-legend below">
                            {pieData.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <div className="legend-label-group">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="legend-label">{item.name}</span>
                                    </div>
                                    <span className="legend-value">{item.value}%</span>
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
                                onClick={() => setIsCreateOfferOpen(true)}
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
                                <span className="stat-value">€31,240</span>
                                <span className="stat-label">{t.totalEarnings}</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">18</span>
                                <span className="stat-label">{t.ordersCompleted}</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">4.8</span>
                                <span className="stat-label">{t.avgRating}</span>
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
