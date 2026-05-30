import React, { useState, useEffect } from 'react';
import './ClientCommands.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { ordersApi, negotiationApi } from '../../api/api';
import { FiSearch, FiFilter, FiList, FiGrid, FiMapPin, FiCalendar, FiWifi, FiInfo, FiClock, FiLoader, FiBox } from 'react-icons/fi';
import { TbListDetails } from 'react-icons/tb';
import { MdClose } from 'react-icons/md';
import { FaHandshake } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
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

    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [proposalData, setProposalData] = useState({ message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showContactWarning, setShowContactWarning] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const response = await ordersApi.get('/orders/custom/available');
            // Assuming the response is an array of commands
            const fetchedCommands = response.data.map(cmd => {
                const firstItem = cmd.items?.[0] || {};
                return {
                    id: cmd.id || `CMD-${Math.floor(Math.random() * 1000)}`,
                    clientId: cmd.clientId || cmd.userId,
                    clientName: cmd.clientName || 'Private Client',
                    title: firstItem.productName || 'Custom Command',
                    product: firstItem.productName || 'Product',
                    quantity: firstItem.quantity || 1,
                    budget: cmd.totalPrice ? (cmd.totalPrice.toLocaleString() + ' DZD') : 'N/A',
                    location: cmd.deliveryAddress || 'N/A',
                    deadline: cmd.createdAt ? new Date(cmd.createdAt).toLocaleDateString() : 'N/A',
                    postedAgo: cmd.createdAt ? new Date(cmd.createdAt).toLocaleDateString() : 'Recently',
                    description: cmd.description || `Order for ${firstItem.productName || 'custom product'}`,
                    image: (firstItem.productImages && firstItem.productImages[0]) || null
                };
            });
            setCommands(fetchedCommands);
        } catch (error) {
            console.error('Error fetching commands:', error);
            toast.error('Failed to load client commands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const filteredCommands = commands.filter(cmd => {
        const matchesSearch = cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) || cmd.product.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || cmd.product.toLowerCase().includes(category.toLowerCase());
        const matchesLocation = filters.location === 'all' || cmd.location === filters.location;
        const matchesStatus = filters.status === 'all' || (filters.status === 'urgent' && new Date(cmd.deadline) < new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
        
        let matchesBudget = true;
        if (filters.minBudget || filters.maxBudget) {
            const budgetValues = cmd.budget.match(/\d+/g);
            if (budgetValues) {
                const minVal = parseInt(budgetValues[0].replace(/,/g, ''));
                const maxVal = budgetValues[1] ? parseInt(budgetValues[1].replace(/,/g, '')) : minVal;
                if (filters.minBudget && minVal < parseInt(filters.minBudget)) matchesBudget = false;
                if (filters.maxBudget && maxVal > parseInt(filters.maxBudget)) matchesBudget = false;
            }
        }
        
        return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesBudget;
    });

    const VISIBLE_LIMIT = 3;
    const visibleCommands = filteredCommands.slice(0, VISIBLE_LIMIT);
    const blurredCommands = filteredCommands.slice(VISIBLE_LIMIT);

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

            // 1. Check if negotiation already exists
            let negotiationId;
            try {
                const checkResponse = await negotiationApi.get('/negotiation', {
                    params: {
                        orderId: proposalCommand.id,
                        importatorId: user.userId,
                        clientId: proposalCommand.clientId
                    }
                });

                // The backend returns { data: [...], total: ... }
                if (checkResponse.data && checkResponse.data.data && checkResponse.data.data.length > 0) {
                    negotiationId = checkResponse.data.data[0].id;
                    console.log('Using existing negotiation:', negotiationId);
                }
            } catch (checkErr) {
                console.warn('Error checking existing negotiation, will try to create one:', checkErr);
            }

            // 2. If no negotiationId, create a new one
            if (!negotiationId) {
                const negResponse = await negotiationApi.post(`/negotiation/custom-order/${proposalCommand.id}`, {
                    importatorName: user.fullName || user.username || 'Importer'
                });
                negotiationId = negResponse.data.id;
                console.log('Created new negotiation:', negotiationId);
            }

            // 3. Create the Proposal
            // Note: The backend expects negotiationId, message, senderRole, proposedQuantity, proposedPrice
            await negotiationApi.post('/negotiation/proposal', {
                negotiationId,
                message: proposalData.message,
                senderRole: 'importator',
                proposedQuantity: proposalCommand.quantity || 1,
                proposedPrice: parseFloat(String(proposalCommand.budget).replace(/[^0-9.]/g, '')) || 0
            });

            toast.success('Proposal sent successfully!');
            setProposalCommand(null);
            setProposalData({ message: '' });
        } catch (err) {
            console.error('Detailed error sending proposal:', err);
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
                        <div className="commands-scrollable-content">
                            <div className="commands-header-section">
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

                            {loading ? (
                                <div className="loading-container">
                                    <FiLoader className="animate-spin" />
                                    <p>Loading available commands...</p>
                                </div>
                            ) : filteredCommands.length === 0 ? (
                                <div className="empty-container">
                                    <FiInfo />
                                    <p>No available commands found matching your filters.</p>
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'detailed' && (
                                        <div className="detailed-view-container">
                                            {visibleCommands.map((cmd) => (
                                                <div key={cmd.id} className="detailed-card" onClick={() => setSelectedCommand(cmd)} style={{ cursor: 'pointer' }}>
                                                    <div className="detailed-image">
                                                        {cmd.image ? (
                                                            <img src={cmd.image} alt={cmd.product} />
                                                        ) : (
                                                            <div className="glass-placeholder" style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px' }}>
                                                                <FiBox className="placeholder-icon" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                                                            </div>
                                                        )}
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
                                            {blurredCommands.length > 0 && (
                                                <div className="blurred-commands-wrapper">
                                                    <div className="blurred-overlay">
                                                        <div className="overlay-content">
                                                            <h3>{language === 'ar' ? 'اكتشف المزيد من الطلبات' : 'Unlock More Commands'}</h3>
                                                            <p>{language === 'ar' ? 'قم بشراء نقاط لرؤية المزيد من طلبات العملاء وإرسال العروض.' : 'Buy points to see more client commands and send proposals.'}</p>
                                                            <button className="btn-send-proposal cool-send-btn" onClick={() => toast.info('Redirecting to points purchase...')}>
                                                                <span>{language === 'ar' ? 'شراء نقاط' : 'Buy Points'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="blurred-content" style={{ filter: 'blur(8px)', opacity: 0.6 }}>
                                                        {blurredCommands.slice(0, 2).map((cmd) => (
                                                            <div key={cmd.id} className="detailed-card" style={{ minHeight: '300px' }}>
                                                                <div className="detailed-image"><div className="glass-placeholder"></div></div>
                                                                <div className="detailed-info"><div className="detailed-header"><h2>Locked Command</h2></div></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
                                                    {visibleCommands.map((cmd) => (
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
                                                    {blurredCommands.length > 0 && (
                                                        <tr>
                                                            <td colSpan="7" style={{ position: 'relative', padding: 0 }}>
                                                                <div className="blurred-commands-wrapper" style={{ minHeight: '150px' }}>
                                                                    <div className="blurred-overlay" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                                                        <div className="overlay-content">
                                                                            <h3>{language === 'ar' ? 'اكتشف المزيد من الطلبات' : 'Unlock More Commands'}</h3>
                                                                            <button className="btn-send-proposal cool-send-btn" style={{ minHeight: '40px', height: '40px' }} onClick={() => toast.info('Redirecting to points purchase...')}>
                                                                                <span>{language === 'ar' ? 'شراء نقاط' : 'Buy Points'}</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="blurred-content">
                                                                        <div style={{ padding: '20px', filter: 'blur(5px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                            <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px' }}></div>
                                                                            <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px' }}></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {viewMode === 'grid' && (
                                        <div className="grid-view-container">
                                            {visibleCommands.map((cmd) => (
                                                <div key={cmd.id} className="grid-card" onClick={() => setSelectedCommand(cmd)} style={{ cursor: 'pointer' }}>
                                                    <div className="grid-image">
                                                        {cmd.image ? (
                                                            <img src={cmd.image} alt={cmd.product} />
                                                        ) : (
                                                            <div className="glass-placeholder" style={{ height: '180px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                                                                <FiBox className="placeholder-icon" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                                                            </div>
                                                        )}
                                                    </div>
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
                                            {blurredCommands.length > 0 && (
                                                <div className="blurred-commands-wrapper grid-span-all" style={{ gridColumn: '1 / -1' }}>
                                                    <div className="blurred-overlay">
                                                        <div className="overlay-content">
                                                            <h3>{language === 'ar' ? 'اكتشف المزيد من الطلبات' : 'Unlock More Commands'}</h3>
                                                            <p>{language === 'ar' ? 'قم بشراء نقاط لرؤية المزيد من طلبات العملاء وإرسال العروض.' : 'Buy points to see more client commands and send proposals.'}</p>
                                                            <button className="btn-send-proposal cool-send-btn" onClick={() => toast.info('Redirecting to points purchase...')}>
                                                                <span>{language === 'ar' ? 'شراء نقاط' : 'Buy Points'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="blurred-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                                        {blurredCommands.slice(0, 3).map((cmd) => (
                                                            <div key={cmd.id} className="grid-card" style={{ filter: 'blur(8px)', opacity: 0.6 }}>
                                                                <div className="grid-image"><div className="glass-placeholder"></div></div>
                                                                <div className="grid-content"><h3 className="grid-title">Locked Command</h3></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
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
                                    <div className="details-sidebar-image">
                                        {selectedCommand.image ? (
                                            <img src={selectedCommand.image} alt={selectedCommand.product} />
                                        ) : (
                                            <div className="glass-placeholder" style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px' }}>
                                                <FiBox className="placeholder-icon" style={{ fontSize: '3rem', color: '#cbd5e1' }} />
                                            </div>
                                        )}
                                    </div>
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
