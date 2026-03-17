import React, { useState } from 'react';
import './ClientCommands.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiSearch, FiFilter, FiList, FiGrid, FiMapPin, FiCalendar, FiWifi } from 'react-icons/fi';
import { TbListDetails } from 'react-icons/tb';
import { MdClose } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';

const ClientCommands = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState('detailed');
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [proposalCommand, setProposalCommand] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [filters, setFilters] = useState({ date: '', location: 'all', status: 'all', minBudget: '', maxBudget: '' });
    const { t } = useLanguage();

    const commands = [
        {
            id: 'CMD-001',
            title: 'High-Quality Leather Jackets (100 units)',
            product: 'Leather Jackets',
            quantity: 100,
            budget: '€5,000 - €8,000',
            location: 'Algiers',
            deadline: '2026-03-15',
            postedAgo: t.posted2DaysAgo,
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
            postedAgo: t.posted5DaysAgo,
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
            postedAgo: t.posted1WeekAgo,
            description: 'Complete set of modern office furniture including desks, ergonomic chairs, and filing cabinets.',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        }
    ];

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const filteredCommands = commands.filter(cmd => {
        const matchesSearch = cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) || cmd.product.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || cmd.product.toLowerCase().includes(category.toLowerCase());
        const matchesLocation = filters.location === 'all' || cmd.location === filters.location;
        const matchesStatus = filters.status === 'all' || (filters.status === 'urgent' && new Date(cmd.deadline) < new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
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
                <div className={`commands-split-view ${selectedCommand ? 'sidebar-open' : ''}`}>
                    <div className="commands-main-column">
                        <div className="commands-fixed-header">
                            <div className="commands-header-top">
                                <div>
                                    <h1>{t.clientCommandsTitle}</h1>
                                    <p>{t.clientCommandsSubtitle}</p>
                                </div>
                                <div className="view-toggles">
                                    <button className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`} onClick={() => setViewMode('detailed')} title="Detailed View"><TbListDetails /></button>
                                    <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View"><FiList /></button>
                                    <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View"><FiGrid /></button>
                                </div>
                            </div>

                            <div className="commands-filters-bar">
                                <div className="search-input-wrapper">
                                    <FiSearch className="search-icon" />
                                    <input type="text" placeholder={t.searchCommands} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="filter-actions">
                                    <select className="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="all">{t.allCategories}</option>
                                        <option value="electronics">{t.electronics}</option>
                                        <option value="clothing">{t.clothing}</option>
                                        <option value="furniture">{t.furniture}</option>
                                    </select>
                                    <button className={`btn-filter ${showAdvancedFilters ? 'active' : ''}`} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                                        <FiFilter /> {t.moreFilters}
                                    </button>
                                </div>
                            </div>

                            <div className={`advanced-filters-bar ${showAdvancedFilters ? 'show' : ''}`}>
                                <div className="filter-group">
                                    <label><FiCalendar /> {t.launchDate}</label>
                                    <input type="date" className="filter-input" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
                                </div>
                                <div className="filter-group">
                                    <label><FiMapPin /> {t.originWilaya}</label>
                                    <select className="filter-select" value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}>
                                        <option value="all">{t.allLocations}</option>
                                        <option>Algiers</option>
                                        <option>Oran</option>
                                        <option>Constantine</option>
                                        <option>Setif</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label><FiWifi /> {t.status}</label>
                                    <select className="filter-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                                        <option value="all">{t.allStatus}</option>
                                        <option value="urgent">{t.urgent}</option>
                                        <option value="normal">{t.normal}</option>
                                        <option value="new">{t.statusNew2}</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>{t.budgetRange}</label>
                                    <div className="budget-inputs">
                                        <input type="number" placeholder={t.min} className="filter-input-small" value={filters.minBudget} onChange={(e) => handleFilterChange('minBudget', e.target.value)} />
                                        <span>-</span>
                                        <input type="number" placeholder={t.max} className="filter-input-small" value={filters.maxBudget} onChange={(e) => handleFilterChange('maxBudget', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="commands-scrollable-content">
                            {viewMode === 'detailed' && (
                                <div className="detailed-view-container">
                                    {filteredCommands.map((cmd) => (
                                        <div key={cmd.id} className="detailed-card" onClick={() => setSelectedCommand(cmd)} style={{ cursor: 'pointer' }}>
                                            <div className="detailed-image"><img src={cmd.image} alt={cmd.product} /></div>
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
                                                        <span><strong>{t.qty}:</strong> {cmd.quantity} {t.units}</span>
                                                        <span><strong>{t.deadline}:</strong> {cmd.deadline}</span>
                                                    </div>
                                                    <div className="detailed-actions">
                                                        <button className="btn-see-more" onClick={(e) => { e.stopPropagation(); setSelectedCommand(cmd); }}>
                                                            <span>{t.seeMore}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'list' && (
                                <div className="list-view-container">
                                    <table className="commands-table">
                                        <thead>
                                            <tr>
                                                <th>{t.commandId}</th>
                                                <th>{t.product}</th>
                                                <th>{t.quantity}</th>
                                                <th>{t.budget}</th>
                                                <th>{t.originWilaya}</th>
                                                <th>{t.deadline}</th>
                                                <th>{t.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCommands.map((cmd) => (
                                                <tr key={cmd.id} onClick={() => setSelectedCommand(cmd)} style={{ cursor: 'pointer' }}>
                                                    <td className="cmd-id">{cmd.id}</td>
                                                    <td className="cmd-product">{cmd.product}</td>
                                                    <td>{cmd.quantity}</td>
                                                    <td>{cmd.budget}</td>
                                                    <td>{cmd.location}</td>
                                                    <td>{cmd.deadline}</td>
                                                    <td>
                                                        <button className="btn-text-action" onClick={(e) => { e.stopPropagation(); setProposalCommand(cmd); }}>
                                                            {t.sendProposal} &rsaquo;
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {viewMode === 'grid' && (
                                <div className="grid-view-container">
                                    {filteredCommands.map((cmd) => (
                                        <div key={cmd.id} className="grid-card" onClick={() => setSelectedCommand(cmd)} style={{ cursor: 'pointer' }}>
                                            <div className="grid-image"><img src={cmd.image} alt={cmd.product} /></div>
                                            <div className="grid-content">
                                                <h3 className="grid-title">{cmd.title}</h3>
                                                <p className="grid-budget">{cmd.budget}</p>
                                                <div className="grid-meta">
                                                    <span><FiMapPin /> {cmd.location}</span>
                                                    <span><FiCalendar /> {cmd.deadline}</span>
                                                </div>
                                                <button className="btn-see-more full-width" onClick={(e) => { e.stopPropagation(); setSelectedCommand(cmd); }}>
                                                    {t.seeMore}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`command-details-sidebar ${selectedCommand ? 'open' : ''}`}>
                        {selectedCommand && (
                            <div className="command-details-inner">
                                <div className="details-sidebar-header">
                                    <div className="header-titles">
                                        <h2>{t.commandDetails}</h2>
                                        <span className="details-sidebar-id">{selectedCommand.id}</span>
                                    </div>
                                    <button className="close-sidebar-btn" onClick={() => setSelectedCommand(null)}><MdClose /></button>
                                </div>
                                <div className="details-sidebar-content">
                                    <div className="details-sidebar-image"><img src={selectedCommand.image} alt={selectedCommand.product} /></div>
                                    <h3 className="details-sidebar-title">{selectedCommand.title}</h3>
                                    <p className="details-sidebar-desc">{selectedCommand.description}</p>
                                    <div className="details-sidebar-info-grid">
                                        <div className="info-row"><span className="info-label">{t.client}</span><span className="info-value">Fashion Boutique Ltd</span></div>
                                        <div className="info-row"><span className="info-label">{t.category}</span><span className="info-value">{selectedCommand.product}</span></div>
                                        <div className="info-row"><span className="info-label">{t.quantity}</span><span className="info-value">{selectedCommand.quantity} {t.units}</span></div>
                                        <div className="info-row"><span className="info-label">{t.budgetRangeLabel}</span><span className="info-value">{selectedCommand.budget}</span></div>
                                        <div className="info-row"><span className="info-label">{t.location}</span><span className="info-value">{selectedCommand.location}</span></div>
                                        <div className="info-row"><span className="info-label">{t.deadline}</span><span className="info-value">{selectedCommand.deadline}</span></div>
                                    </div>
                                </div>
                                <div className="details-sidebar-footer">
                                    <button className="btn-send-proposal full-width" onClick={(e) => { e.stopPropagation(); setProposalCommand(selectedCommand); }}>
                                        <div className="svg-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                            </svg>
                                        </div>
                                        <span>{t.sendProposal}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {proposalCommand && (
                <div className="proposal-modal-overlay" onClick={() => setProposalCommand(null)}>
                    <div className="proposal-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="proposal-modal-header">
                            <h2>{t.sendProposal} - {proposalCommand.id}</h2>
                            <button className="close-modal-btn" onClick={() => setProposalCommand(null)}><MdClose /></button>
                        </div>
                        <div className="proposal-modal-body">
                            <div className="form-group">
                                <label>{t.proposedUnitPrice}</label>
                                <input type="number" placeholder={t.enterPricePerUnit} />
                            </div>
                            <div className="form-group">
                                <label>{t.quantityOffered}</label>
                                <input type="number" placeholder={`Max: ${proposalCommand.quantity}`} />
                            </div>
                            <div className="form-group">
                                <label>{t.deliveryTime}</label>
                                <select defaultValue="7-10 days">
                                    <option value="7-10 days">{t.delivery7to10Days}</option>
                                    <option value="10-15 days">{t.delivery10to15Days}</option>
                                    <option value="15-20 days">{t.delivery15to20Days}</option>
                                    <option value="20-30 days">{t.delivery20to30Days}</option>
                                    <option value="+30 days">{t.deliveryMore30Days}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t.messageToClient}</label>
                                <textarea rows="4" placeholder={t.describeOffer}></textarea>
                                <p className="form-help-text">
                                    {t.beSpecific}<br />
                                    <span className="text-warning">{t.warningContact}</span>
                                </p>
                            </div>
                        </div>
                        <div className="proposal-modal-footer">
                            <button className="btn-secondary" onClick={() => setProposalCommand(null)}>{t.saveDraft}</button>
                            <button className="btn-send-proposal">
                                <div className="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                    </svg>
                                </div>
                                <span>{t.sendProposal}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClientCommands;
