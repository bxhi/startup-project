import React from 'react';
import './Navbar.css';
import { FiSearch, FiBell } from 'react-icons/fi';

const Navbar = () => {
    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search..." className="search-input" />
                </div>

                <button className="notification-btn">
                    <FiBell />
                    <span className="notification-dot"></span>
                </button>

                <div className="user-profile">
                    <div className="user-avatar">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
                        </svg>
                    </div>
                    <div className="user-info">
                        <span className="user-name">Business Name</span>
                        <span className="user-role">Importer</span>
                    </div>
                </div>
            </div>

            <div className="navbar-right">
                {/* Space for future items */}
            </div>
        </header>
    );
};

export default Navbar;
