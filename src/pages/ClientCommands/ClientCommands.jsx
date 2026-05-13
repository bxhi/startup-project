import React, { useState } from 'react';
import './ClientCommands.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiSearch, FiFilter, FiList, FiGrid, FiMapPin, FiCalendar, FiWifi } from 'react-icons/fi';
import { TbListDetails } from 'react-icons/tb';
import { MdClose } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { negotiationService } from '../../api/negotiationService';
import { FiAlertCircle, FiLoader, FiShield } from 'react-icons/fi';
import { FaHandshake } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ClientCommands = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState('detailed');
    const [selectedCommand, setSelectedCommand] = useState(null);
    const [proposalCommand, setProposalCommand] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [filters, setFilters] = useState({ date: '', location: 'all', status: 'all', minBudget: '', maxBudget: '' });
    const { t, language } = useLanguage();

    const [proposalData, setProposalData] = useState({ message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showContactWarning, setShowContactWarning] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);

    const commands = [
        {
            id: 'CMD-001',
            clientId: 'client-abc-123',
            clientName: 'ABC Trading',
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
            clientId: 'client-xyz-456',
            clientName: 'XYZ Imports',
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
            clientId: 'client-global-789',
            clientName: 'Global Traders',
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

    const handleProposalMessageChange = (e) => {
        const val = e.target.value;
        setProposalData(prev => ({ ...prev, message: val }));

        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        if (phoneRegex.test(val) || emailRegex.test(val)) {
            setShowContactWarning(true);
        } else {
            setShowContactWarning(false);
        }
    };

    const handleSendProposal = async () => {
        if (!proposalData.message || proposalData.message.trim().length < 5) {
            toast.error(t.messageTooShort || 'Please enter at least 5 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error('Please login first');
                setIsSubmitting(false);
                return;
            }
            const user = JSON.parse(userStr);

            // 1. Create Negotiation with required fields
            const negResponse = await negotiationService.createNegotiation(
                proposalCommand.id,
                proposalCommand.clientId,
                proposalCommand.clientName,
                user.userId
            );
            const negotiationId = negResponse.id;

            // 2. Create Initial Proposal
            const defaultPrice = parseFloat(proposalCommand.budget.replace(/[^0-9.]/g, '')) || 0;
            const defaultQty = proposalCommand.quantity || 1;

            await negotiationService.createProposal(
                negotiationId,
                defaultQty,
                defaultPrice,
                user.role,
                proposalData.message
            );

            toast.success('Proposal sent successfully!');
            setProposalCommand(null);
            setProposalData({ message: '' });
        } catch (err) {
            console.error('Error sending proposal:', err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to send proposal.';
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                        <div className="info-row"><span className="info-label">{t.client}</span><span className="info-value">{selectedCommand.clientName}</span></div>
                                        <div className="info-row"><span className="info-label">{t.category}</span><span className="info-value">{selectedCommand.product}</span></div>
                                        <div className="info-row"><span className="info-label">{t.quantity}</span><span className="info-value">{selectedCommand.quantity} {t.units}</span></div>
                                        <div className="info-row"><span className="info-label">{t.budgetRangeLabel}</span><span className="info-value">{selectedCommand.budget}</span></div>
                                        <div className="info-row"><span className="info-label">{t.location}</span><span className="info-value">{selectedCommand.location}</span></div>
                                        <div className="info-row"><span className="info-label">{t.deadline}</span><span className="info-value">{selectedCommand.deadline}</span></div>
                                    </div>
                                </div>
                                <div className="details-sidebar-footer">
                                    <button 
                                        className={`btn-send-proposal cool-send-btn full-width ${isPending ? 'pending-disabled' : ''}`} 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (isPending) {
                                                toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
                                                return;
                                            }
                                            setProposalCommand(selectedCommand); 
                                        }}
                                    >
                                        <div className="svg-wrapper">
                                            <FaHandshake className="handshake-icon" />
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
                            <div className="form-group large-group">
                                <label className="large-label">{t.yourProposal || 'Your Proposal Message'}</label>
                                <textarea
                                    rows="6"
                                    placeholder={t.describeOffer}
                                    value={proposalData.message}
                                    onChange={handleProposalMessageChange}
                                    className="proposal-textarea cool-textarea"
                                    spellCheck={false}
                                    data-gramm={false}
                                ></textarea>
                            </div>
                            <div className="creative-warning-banner is-warning">
                                <div className="warning-content">
                                    <strong className="warning-title">
                                        {language === 'ar' ? 'لضمان أمان حسابك' : 'Protect Your Account'}
                                    </strong>
                                    <p className="warning-text">
                                        {language === 'ar' 
                                            ? 'يرجى إبقاء جميع المحادثات والمعاملات داخل المنصة. مشاركة معلومات الاتصال الخارجية (رقم الهاتف، البريد الإلكتروني، إلخ) قد يؤدي إلى تعليق الحساب.' 
                                            : 'Please keep all communications and transactions on the platform. Sharing external contact information (phone number, email, etc.) may lead to account suspension.'}
                                    </p>
                                </div>
                                <div className="animated-shield-bg"></div>
                            </div>
                        </div>
                        <div className="proposal-modal-footer">
                            <button className="btn-send-proposal cool-send-btn" onClick={handleSendProposal} disabled={isSubmitting}>
                                <div className="svg-wrapper">
                                    {isSubmitting ? <FiLoader className="animate-spin" /> : <FaHandshake className="handshake-icon" />}
                                </div>
                                <span>{isSubmitting ? 'Sending...' : t.sendProposal}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClientCommands;
