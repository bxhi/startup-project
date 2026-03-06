import React, { useState } from 'react';
import './ClientCommands.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiSearch, FiFilter, FiList, FiGrid, FiMapPin, FiCalendar, FiWifi } from 'react-icons/fi';
import { LuSend } from 'react-icons/lu';
import { TbListDetails } from 'react-icons/tb';
import { MdClose } from 'react-icons/md';

const ClientCommands = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState('detailed'); // 'detailed', 'list', 'grid'
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [proposalCommand, setProposalCommand] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [filters, setFilters] = useState({
        date: '',
        location: 'All Locations',
        status: 'All Status',
        minBudget: '',
        maxBudget: ''
    });

    const commands = [
        {
            id: 'CMD-001',
            title: 'High-Quality Leather Jackets (100 units)',
            product: 'Leather Jackets',
            quantity: 100,
            budget: '€5,000 - €8,000',
            location: 'Algiers',
            deadline: '2026-03-15',
            postedAgo: 'Posted 2 days ago',
            description: 'Looking for premium quality leather jackets for winter collection. Must be genuine leather with good stitching.',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'CMD-002',
            title: 'Electronic Components - Resistors & Capacitors',
            product: 'Electronic Components',
            quantity: 5000,
            budget: '€2,000 - €3,500',
            location: 'Oran',
            deadline: '2026-03-20',
            postedAgo: 'Posted 5 days ago',
            description: 'Need various electronic components for manufacturing. Bulk order required.',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'CMD-003',
            title: 'Modern Office Furniture Set',
            product: 'Office Furniture',
            quantity: 150,
            budget: '€15,000 - €20,000',
            location: 'Constantine',
            deadline: '2026-04-01',
            postedAgo: 'Posted 1 week ago',
            description: 'Complete set of modern office furniture including desks, ergonomic chairs, and filing cabinets.',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredCommands = commands.filter(cmd => {
        // Search term filter
        const matchesSearch = cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.product.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = category === 'All Categories' || cmd.product.toLowerCase().includes(category.toLowerCase());

        // Location filter
        const matchesLocation = filters.location === 'All Locations' || cmd.location === filters.location;

        // Status filter (logic depends on how status is defined in data)
        // For now, let's assume 'Urgent' means deadline is within 10 days
        const matchesStatus = filters.status === 'All Status' || (filters.status === 'Urgent' && new Date(cmd.deadline) < new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));

        // Budget filter (parsing the "€5,000 - €8,000" string)
        const budgetValues = cmd.budget.match(/\d+/g);
        const minVal = budgetValues ? parseInt(budgetValues[0].replace(/,/g, '')) : 0;
        const maxVal = budgetValues ? parseInt(budgetValues[1].replace(/,/g, '')) : Infinity;

        const matchesMinBudget = !filters.minBudget || minVal >= parseInt(filters.minBudget);
        const matchesMaxBudget = !filters.maxBudget || maxVal <= parseInt(filters.maxBudget);

        return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesMinBudget && matchesMaxBudget;
    });

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="commands">
            <div className="commands-page-container">

                {/* Main Content Area */}
                <div className={`commands-split-view ${selectedCommand ? 'sidebar-open' : ''}`}>

                    {/* Left Side: Header and Content */}
                    <div className="commands-main-column">
                        {/* Fixed Header Section */}
                        <div className="commands-fixed-header">
                            <div className="commands-header-top">
                                <div>
                                    <h1>Client Commands</h1>
                                    <p>Browse and respond to import requests</p>
                                </div>

                                <div className="view-toggles">
                                    <button
                                        className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                                        onClick={() => setViewMode('detailed')}
                                        title="Detailed View"
                                    >
                                        <TbListDetails />
                                    </button>
                                    <button
                                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="List View"
                                    >
                                        <FiList />
                                    </button>
                                    <button
                                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                    >
                                        <FiGrid />
                                    </button>
                                </div>
                            </div>

                            <div className="commands-filters-bar">
                                <div className="search-input-wrapper">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search commands..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="filter-actions">
                                    <select
                                        className="category-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>All Categories</option>
                                        <option>Electronics</option>
                                        <option>Clothing</option>
                                        <option>Furniture</option>
                                    </select>

                                    <button
                                        className={`btn-filter ${showAdvancedFilters ? 'active' : ''}`}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        <FiFilter /> More Filters
                                    </button>
                                </div>
                            </div>

                            <div className={`advanced-filters-bar ${showAdvancedFilters ? 'show' : ''}`}>
                                <div className="filter-group">
                                    <label><FiCalendar /> Launch Date</label>
                                    <input
                                        type="date"
                                        className="filter-input"
                                        value={filters.date}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label><FiMapPin /> Origin (Wilaya)</label>
                                    <select
                                        className="filter-select"
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                    >
                                        <option>All Locations</option>
                                        <option>Algiers</option>
                                        <option>Oran</option>
                                        <option>Constantine</option>
                                        <option>Setif</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label><FiWifi /> Status</label>
                                    <select
                                        className="filter-select"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option>All Status</option>
                                        <option>Urgent</option>
                                        <option>Normal</option>
                                        <option>New</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Budget Range</label>
                                    <div className="budget-inputs">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="filter-input-small"
                                            value={filters.minBudget}
                                            onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="filter-input-small"
                                            value={filters.maxBudget}
                                            onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content Section */}
                        <div className="commands-scrollable-content">

                            {/* Detailed View */}
                            {viewMode === 'detailed' && (
                                <div className="detailed-view-container">
                                    {filteredCommands.map((cmd) => (
                                        <div
                                            key={cmd.id}
                                            className="detailed-card"
                                            onClick={() => setSelectedCommand(cmd)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="detailed-image">
                                                <img src={cmd.image} alt={cmd.product} />
                                            </div>
                                            <div className="detailed-info">
                                                <div className="detailed-header">
                                                    <h2>{cmd.title}</h2>
                                                    <span className="detailed-budget">{cmd.budget}</span>
                                                </div>

                                                <div className="detailed-meta">
                                                    <span className="meta-item"><FiMapPin /> {cmd.location}</span>
                                                    <span className="meta-item"><FiCalendar /> {cmd.postedAgo}</span>
                                                </div>

                                                <p className="detailed-desc">{cmd.description}</p>

                                                <div className="detailed-footer">
                                                    <div className="detailed-specs">
                                                        <span><strong>Qty:</strong> {cmd.quantity} units</span>
                                                        <span><strong>Deadline:</strong> {cmd.deadline}</span>
                                                    </div>
                                                    <button
                                                        className="btn-send-proposal"
                                                        onClick={(e) => { e.stopPropagation(); setProposalCommand(cmd); }}
                                                    >
                                                        <LuSend /> Send Proposal
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="list-view-container">
                                    <table className="commands-table">
                                        <thead>
                                            <tr>
                                                <th>Command ID</th>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Budget</th>
                                                <th>Wilaya</th>
                                                <th>Deadline</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCommands.map((cmd) => (
                                                <tr
                                                    key={cmd.id}
                                                    onClick={() => setSelectedCommand(cmd)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="cmd-id">{cmd.id}</td>
                                                    <td className="cmd-product">{cmd.product}</td>
                                                    <td>{cmd.quantity}</td>
                                                    <td>{cmd.budget}</td>
                                                    <td>{cmd.location}</td>
                                                    <td>{cmd.deadline}</td>
                                                    <td>
                                                        <button
                                                            className="btn-text-action"
                                                            onClick={(e) => { e.stopPropagation(); setProposalCommand(cmd); }}
                                                        >
                                                            Send Proposal &rsaquo;
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Grid View (Placeholder/Extension based on what's expected) */}
                            {viewMode === 'grid' && (
                                <div className="grid-view-container">
                                    {filteredCommands.map((cmd) => (
                                        <div
                                            key={cmd.id}
                                            className="grid-card"
                                            onClick={() => setSelectedCommand(cmd)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="grid-image">
                                                <img src={cmd.image} alt={cmd.product} />
                                            </div>
                                            <div className="grid-content">
                                                <h3 className="grid-title">{cmd.title}</h3>
                                                <p className="grid-budget">{cmd.budget}</p>
                                                <div className="grid-meta">
                                                    <span><FiMapPin /> {cmd.location}</span>
                                                    <span><FiCalendar /> {cmd.deadline}</span>
                                                </div>
                                                <button
                                                    className="btn-send-proposal full-width"
                                                    onClick={(e) => { e.stopPropagation(); setProposalCommand(cmd); }}
                                                >
                                                    <LuSend /> Send Proposal
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div> {/* End of commands-scrollable-content */}
                    </div> {/* End of commands-main-column */}

                    {/* Command Details Sidebar */}
                    <div className={`command-details-sidebar ${selectedCommand ? 'open' : ''}`}>
                        {selectedCommand && (
                            <div className="command-details-inner">
                                <div className="details-sidebar-header">
                                    <div className="header-titles">
                                        <h2>Command Details</h2>
                                        <span className="details-sidebar-id">{selectedCommand.id}</span>
                                    </div>
                                    <button
                                        className="close-sidebar-btn"
                                        onClick={() => setSelectedCommand(null)}
                                    >
                                        <MdClose />
                                    </button>
                                </div>

                                <div className="details-sidebar-content">
                                    <div className="details-sidebar-image">
                                        <img src={selectedCommand.image} alt={selectedCommand.product} />
                                    </div>

                                    <h3 className="details-sidebar-title">{selectedCommand.title}</h3>

                                    <p className="details-sidebar-desc">{selectedCommand.description}</p>

                                    <div className="details-sidebar-info-grid">
                                        <div className="info-row">
                                            <span className="info-label">Client</span>
                                            <span className="info-value">Fashion Boutique Ltd</span> {/* Static for now, as not in array */}
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Category</span>
                                            <span className="info-value">{selectedCommand.product}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Quantity</span>
                                            <span className="info-value">{selectedCommand.quantity} units</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Budget Range</span>
                                            <span className="info-value">{selectedCommand.budget}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Location</span>
                                            <span className="info-value">{selectedCommand.location}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Deadline</span>
                                            <span className="info-value">{selectedCommand.deadline}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="details-sidebar-footer">
                                    <button
                                        className="btn-send-proposal full-width"
                                        onClick={(e) => { e.stopPropagation(); setProposalCommand(selectedCommand); }}
                                    >
                                        <LuSend /> Send Proposal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div> {/* End of commands-split-view */}

            </div>

            {/* Send Proposal Modal Overlay */}
            {proposalCommand && (
                <div className="proposal-modal-overlay" onClick={() => setProposalCommand(null)}>
                    <div className="proposal-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="proposal-modal-header">
                            <h2>Send Proposal - {proposalCommand.id}</h2>
                            <button className="close-modal-btn" onClick={() => setProposalCommand(null)}>
                                <MdClose />
                            </button>
                        </div>

                        <div className="proposal-modal-body">
                            <div className="form-group">
                                <label>Proposed Unit Price (€)</label>
                                <input type="number" placeholder="Enter your price per unit" />
                            </div>

                            <div className="form-group">
                                <label>Quantity Offered</label>
                                <input type="number" placeholder={`Max: ${proposalCommand.quantity}`} />
                            </div>

                            <div className="form-group">
                                <label>Delivery Time (days)</label>
                                <select defaultValue="7-10 days">
                                    <option value="7-10 days">7 - 10 days</option>
                                    <option value="10-15 days">10 - 15 days</option>
                                    <option value="15-20 days">15 - 20 days</option>
                                    <option value="20-30 days">20 - 30 days</option>
                                    <option value="+30 days">+30 days</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Message to Client</label>
                                <textarea rows="4" placeholder="Describe your offer, quality guarantees, shipping details..."></textarea>
                                <p className="form-help-text">
                                    Be specific about product quality, certifications, and terms.
                                    <br /><span className="text-warning">Warning: Do not share external contact information. Our AI detects this and it will result in an immediate account ban.</span>
                                </p>
                            </div>
                        </div>

                        <div className="proposal-modal-footer">
                            <button className="btn-secondary" onClick={() => setProposalCommand(null)}>Save Draft</button>
                            <button className="btn-send-proposal">Send Proposal</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClientCommands;
