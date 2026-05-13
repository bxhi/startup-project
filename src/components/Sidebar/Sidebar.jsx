import React, { useState } from 'react';
import './Sidebar.css';
import { MdOutlineDashboard } from 'react-icons/md';
import { FiFileText, FiBox, FiShoppingCart, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2';
import { IoWalletOutline } from 'react-icons/io5';
import { useLanguage } from '../../context/LanguageContext';
import { negotiationService } from '../../api/negotiationService';
import { useEffect } from 'react';

const Sidebar = ({ onNavigate, activePage }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { t, dir } = useLanguage();
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);

                const params = {};
                if (user.role === 'client') params.clientId = user.userId;
                else if (user.role === 'importator') params.importatorId = user.userId;

                const response = await negotiationService.getNegotiations(params);
                const negotiations = response.data || [];
                
                // Check if any negotiation has unread proposals from the other party
                let unreadFound = false;
                for (const neg of negotiations) {
                    try {
                        const proposalsRes = await negotiationService.getProposals(neg.id);
                        const proposals = proposalsRes.data || [];
                        if (proposals.some(p => !p.isRead && p.senderId !== user.userId)) {
                            unreadFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                setHasUnread(unreadFound);
            } catch (err) {
                console.error('Error checking unread negotiations:', err);
            }
        };

        checkUnread();
        const interval = setInterval(checkUnread, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { key: 'dashboard', name: t.dashboard, icon: <MdOutlineDashboard />, active: activePage === 'dashboard', action: () => onNavigate('dashboard') },
        { key: 'commands', name: t.clientCommands, icon: <FiFileText />, active: activePage === 'commands', action: () => onNavigate('commands') },
        { 
            key: 'negotiations', 
            name: t.negotiations, 
            icon: <HiOutlineChatBubbleOvalLeftEllipsis />, 
            active: activePage === 'negotiations', 
            action: () => onNavigate('negotiations'),
            hasNotification: hasUnread
        },
        { key: 'offers', name: t.myOffers, icon: <FiBox />, active: activePage === 'offers', action: () => onNavigate('offers') },
        { key: 'orders', name: t.orders, icon: <FiShoppingCart />, active: activePage === 'orders', action: () => onNavigate('orders') },
        { key: 'wallet', name: t.wallet, icon: <IoWalletOutline />, active: activePage === 'wallet', action: () => onNavigate('wallet') },
        { key: 'settings', name: t.settings, icon: <FiSettings />, active: activePage === 'settings', action: () => onNavigate('settings') }
    ];

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.key} className={`nav-item ${item.active ? 'active' : ''}`}>
                            <a href="#" onClick={(e) => {
                                e.preventDefault();
                                if (item.action) item.action();
                            }}>
                                <span className="icon">
                                    {item.icon}
                                    {item.hasNotification && <span className="notification-dot"></span>}
                                </span>
                                <span className={`text ${collapsed ? 'hidden' : ''} ${item.hasNotification ? 'bold-text' : ''}`}>{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed
                        ? (dir === 'rtl' ? <FiChevronLeft /> : <FiChevronRight />)
                        : (dir === 'rtl' ? <FiChevronRight /> : <FiChevronLeft />)
                    }
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
