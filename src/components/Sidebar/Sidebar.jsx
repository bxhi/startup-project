import React, { useState } from 'react';
import './Sidebar.css';
import { MdOutlineDashboard } from 'react-icons/md';
import { FiFileText, FiBox, FiShoppingCart, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2';
import { IoWalletOutline } from 'react-icons/io5';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = ({ onNavigate, activePage }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { t, dir } = useLanguage();

    const menuItems = [
        { key: 'dashboard', name: t.dashboard, icon: <MdOutlineDashboard />, active: activePage === 'dashboard', action: () => onNavigate('dashboard') },
        { key: 'commands', name: t.clientCommands, icon: <FiFileText />, active: activePage === 'commands', action: () => onNavigate('commands') },
        { key: 'negotiations', name: t.negotiations, icon: <HiOutlineChatBubbleOvalLeftEllipsis />, active: activePage === 'negotiations', action: () => onNavigate('negotiations') },
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
                                <span className="icon">{item.icon}</span>
                                <span className={`text ${collapsed ? 'hidden' : ''}`}>{item.name}</span>
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
