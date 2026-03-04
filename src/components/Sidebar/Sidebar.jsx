import React, { useState } from 'react';
import './Sidebar.css';
import { MdOutlineDashboard } from 'react-icons/md';
import { FiFileText, FiBox, FiShoppingCart, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineChatBubbleOvalLeftEllipsis } from 'react-icons/hi2';
import { IoWalletOutline, IoColorPaletteOutline } from 'react-icons/io5';
import { TbAlphabetArabic } from 'react-icons/tb';

const Sidebar = ({ onNavigate, activePage }) => {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <MdOutlineDashboard />, active: activePage === 'dashboard', action: () => onNavigate('dashboard') },
        { name: 'Client Commands', icon: <FiFileText />, active: activePage === 'commands', action: () => onNavigate('commands') },
        { name: 'Negotiations', icon: <HiOutlineChatBubbleOvalLeftEllipsis />, active: activePage === 'negotiations', action: () => onNavigate('negotiations') },
        { name: 'My Offers', icon: <FiBox />, active: activePage === 'offers', action: () => onNavigate('offers') },
        { name: 'Orders', icon: <FiShoppingCart /> },
        { name: 'Wallet', icon: <IoWalletOutline /> },
        { name: 'Settings', icon: <FiSettings /> },
        { name: 'Design System', icon: <IoColorPaletteOutline /> },
        { name: 'RTL Demo', icon: <TbAlphabetArabic /> },
        { name: 'Logout (Test Login)', icon: <FiChevronLeft />, action: () => onNavigate('login') }
    ];

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2 className={`brand ${collapsed ? 'hidden' : ''}`}>Importer</h2>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
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
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
