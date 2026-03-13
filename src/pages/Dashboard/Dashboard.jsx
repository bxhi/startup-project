import React, { useState } from 'react';
import './Dashboard.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CreateOfferModal from '../../components/CreateOfferModal/CreateOfferModal';
import { FiFileText, FiShoppingCart, FiBox, FiArrowUpRight, FiArrowDownRight, FiPlus } from 'react-icons/fi';
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2';
import { IoWalletOutline } from 'react-icons/io5';
import { LuShoppingBag, LuPackage, LuTrendingUp, LuStore, LuDollarSign, LuBox } from 'react-icons/lu';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard = ({ onNavigate }) => {
    const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
    const statCards = [
        {
            title: 'Active Commands',
            value: '156',
            trend: '+12%',
            isPositive: true,
            icon: <FiFileText />,
            colorClass: 'blue'
        },
        {
            title: 'Active Negotiations',
            value: '42',
            trend: '+8%',
            isPositive: true,
            icon: <HiOutlineChatBubbleOvalLeftEllipsis />,
            colorClass: 'green'
        },
        {
            title: 'Active Orders',
            value: '28',
            trend: '-3%',
            isPositive: false,
            icon: <FiShoppingCart />,
            colorClass: 'orange'
        },
        {
            title: 'Points Balance',
            value: '€24,580',
            trend: '+25%',
            isPositive: true,
            icon: <IoWalletOutline />,
            colorClass: 'yellow'
        }
    ];

    const pieData = [
        { name: 'Completed', value: 45, color: '#22c55e' },
        { name: 'In Progress', value: 25, color: '#eab308' },
        { name: 'Pending', value: 20, color: '#1a56db' },
        { name: 'Cancelled', value: 10, color: '#ef4444' }
    ];

    const lineData = [
        { month: 'Jan', earnings: 12000 },
        { month: 'Feb', earnings: 15000 },
        { month: 'Mar', earnings: 18000 },
        { month: 'Apr', earnings: 22000 },
        { month: 'May', earnings: 26000 },
        { month: 'Jun', earnings: 32000 },
    ];

    const recentActivity = [
        { id: '#12453', client: 'ABC Trading', action: 'New proposal received', amount: '€12,500', time: '2 min ago', status: 'new' },
        { id: '#12452', client: 'XYZ Imports', action: 'Order completed', amount: '€8,200', time: '1 hour ago', status: 'completed' },
        { id: '#12451', client: 'Global Traders', action: 'Payment received', amount: '€15,000', time: '3 hours ago', status: 'paid' },
        { id: '#12450', client: 'Euro Supplies', action: 'Negotiation started', amount: '€5,500', time: '5 hours ago', status: 'negotiating' }
    ];

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's what's happening with your business.</p>
            </div>

            <div className="stat-cards-container">
                {statCards.map((card, index) => (
                    <div key={index} className="stat-card">
                        <div className={`icon-container ${card.colorClass}`}>
                            {card.icon}
                        </div>
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

            {/* Top Row: Charts */}
            <div className="dashboard-charts-row">
                {/* Earnings Overview */}
                <div className="chart-card line-chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Earnings Overview</h2>
                            <p className="subtitle">Monthly earnings trend</p>
                        </div>
                        <select className="period-select">
                            <option>Last 6 month</option>
                            <option>Last 12 month</option>
                            <option>This year</option>
                        </select>
                    </div>
                    <div className="line-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#cbd5e1" strokeOpacity={1} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}`}
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

                {/* Orders by Status */}
                <div className="chart-card pie-chart-card">
                    <h2>Orders by Status</h2>
                    <div className="pie-chart-content">
                        <div className="pie-chart-wrapper">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
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

            {/* Second Row: Actions and This Month */}
            <div className="dashboard-grid">
                <div className="dashboard-left-column">
                    <div className="dashboard-section-card quick-actions-card">
                        <h3>Quick Actions</h3>
                        <div className="actions-buttons">
                            <button className="btn-create-offer" onClick={() => setIsCreateOfferOpen(true)}>
                                <FiPlus size={22} /> Create Offer
                            </button>
                            <button className="btn btn-outline" onClick={() => onNavigate('commands')}>
                                <FiFileText /> Browse Commands
                            </button>
                        </div>
                    </div>
                </div>

                <div className="dashboard-right-column">
                    <div className="dashboard-section-card this-month-card">
                        <h3>This Month</h3>
                        <div className="month-stats-grid">
                            <div className="month-stat-item">
                                <span className="stat-value">€31,240</span>
                                <span className="stat-label">Total Earnings</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">18</span>
                                <span className="stat-label">Orders Completed</span>
                            </div>
                            <div className="month-stat-item border-left">
                                <span className="stat-value">4.8</span>
                                <span className="stat-label">Avg. Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Activity Table */}
            <div className="dashboard-section-card recent-activity-card">
                <h3>Recent Activity</h3>
                <div className="table-container">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Action</th>
                                <th>Amount</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((activity, index) => (
                                <tr key={index}>
                                    <td className="id-cell">{activity.id}</td>
                                    <td>{activity.client}</td>
                                    <td>{activity.action}</td>
                                    <td className="amount-cell">{activity.amount}</td>
                                    <td className="time-cell">{activity.time}</td>
                                    <td>
                                        <span className={`status-badge ${activity.status}`}>
                                            {activity.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateOfferModal
                isOpen={isCreateOfferOpen}
                onClose={() => setIsCreateOfferOpen(false)}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
