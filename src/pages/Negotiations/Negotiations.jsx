import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Negotiations.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiPaperclip, FiSend, FiCheck, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { negotiationService } from '../../api/negotiationService';
import socketService from '../../api/socketService';

const Negotiations = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [negotiations, setNegotiations] = useState([]);
    const [activeNegotiationId, setActiveNegotiationId] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProposalsLoading, setIsProposalsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isCountering, setIsCountering] = useState(false);
    const [counterData, setCounterData] = useState({ price: '', quantity: '' });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [proposals, isCountering]);

    // Fetch initial negotiations
    const fetchNegotiations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('User not found. Please log in.');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user);

            const params = {};
            if (user.role === 'client') params.clientId = user.userId;
            else if (user.role === 'importator') params.importatorId = user.userId;

            const response = await negotiationService.getNegotiations(params);
            const fetchedNegs = response.data || [];
            setNegotiations(fetchedNegs);
            
            if (fetchedNegs.length > 0 && !activeNegotiationId) {
                setActiveNegotiationId(fetchedNegs[0].id);
            }
        } catch (err) {
            console.error('Error fetching negotiations:', err);
            setError('Failed to load negotiations.');
        } finally {
            setIsLoading(false);
        }
    }, [activeNegotiationId]);

    // Fetch proposals for active negotiation
    const fetchProposals = useCallback(async (negId) => {
        if (!negId) return;
        setIsProposalsLoading(true);
        try {
            const response = await negotiationService.getProposals(negId);
            setProposals(response.data || []);
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setIsProposalsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNegotiations();
        socketService.connect();
        return () => socketService.disconnect();
    }, [fetchNegotiations]);

    useEffect(() => {
        if (activeNegotiationId) {
            fetchProposals(activeNegotiationId);
            socketService.joinNegotiation(activeNegotiationId);
        }

        socketService.removeListeners();
        socketService.onProposalCreated((proposal) => {
            if (proposal.negotiationId === activeNegotiationId) {
                setProposals(prev => [proposal, ...prev]);
            }
        });

        socketService.onNegotiationAccepted((data) => {
            if (data.negotiationId === activeNegotiationId) {
                fetchNegotiations();
                fetchProposals(activeNegotiationId);
            }
        });
    }, [activeNegotiationId, fetchProposals, fetchNegotiations]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeNegotiationId || !currentUser) return;
        
        try {
            // In this specific backend model, messages are typically proposals
            // For a simple chat message, we use the active negotiation targets
            const activeNeg = negotiations.find(n => n.id === activeNegotiationId);
            await negotiationService.createProposal(
                activeNegotiationId,
                activeNeg.requestedQuantity || 1,
                activeNeg.finalPrice || 0,
                currentUser.role
            );
            setMessageInput('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleSendCounter = async () => {
        if (!counterData.price || !counterData.quantity || !activeNegotiationId || !currentUser) return;
        
        try {
            await negotiationService.createProposal(
                activeNegotiationId,
                counterData.quantity,
                counterData.price,
                currentUser.role
            );
            setIsCountering(false);
            setCounterData({ price: '', quantity: '' });
        } catch (err) {
            console.error('Error sending counter:', err);
        }
    };

    const handleAccept = async () => {
        if (!activeNegotiationId) return;
        try {
            await negotiationService.acceptNegotiation(activeNegotiationId);
            alert('Negotiation accepted and order created!');
        } catch (err) {
            console.error('Error accepting negotiation:', err);
            alert('Failed to accept negotiation.');
        }
    };

    const activeNegotiation = negotiations.find(n => n.id === activeNegotiationId);

    const getDisplayName = (neg) => {
        return currentUser?.role === 'client' ? `${t.vendor}: ${neg.importatorId.slice(0, 8)}` : `${t.client}: ${neg.clientId.slice(0, 8)}`;
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="negotiations">
            <div className="negotiations-container">
                <div className="negotiations-sidebar">
                    <div className="negotiations-sidebar-header">
                        <h2>{t.negotiations}</h2>
                        <p>{t.activeNegotiations}</p>
                    </div>
                    <div className="negotiations-list">
                        {isLoading ? (
                            <div className="loading-state"><FiLoader className="animate-spin" /></div>
                        ) : error ? (
                            <div className="error-state"><FiAlertCircle /> {error}</div>
                        ) : negotiations.length === 0 ? (
                            <div className="empty-negotiations">
                                <div className="empty-icon-capsule">
                                    <FiPaperclip />
                                </div>
                                <h3>{t.noNegotiationsFound}</h3>
                                <button className="btn-explore" onClick={() => onNavigate('commands')}>
                                    {t.browseCommands}
                                </button>
                            </div>
                        ) : (
                            negotiations.map((neg) => (
                                <div 
                                    key={neg.id} 
                                    className={`negotiation-item ${activeNegotiationId === neg.id ? 'active' : ''} ${neg.status.toLowerCase()}`} 
                                    onClick={() => setActiveNegotiationId(neg.id)}
                                >
                                    <div className="contact-avatar">{getDisplayName(neg).slice(0, 2).toUpperCase()}</div>
                                    <div className="contact-info">
                                        <div className="contact-header">
                                            <span className="contact-name">{getDisplayName(neg)}</span>
                                            <span className={`status-dot ${neg.status.toLowerCase()}`}></span>
                                        </div>
                                        <p className="message-preview">Offer: {neg.offerId.slice(0, 8)}</p>
                                        <span className="message-status-text">{neg.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="chat-area">
                    {activeNegotiation ? (
                        <>
                            {/* ... existing active chat content ... */}
                            <div className="chat-header">
                                <div className="chat-contact-details">
                                    <div className="contact-avatar">{getDisplayName(activeNegotiation).slice(0, 2).toUpperCase()}</div>
                                    <div className="chat-contact-info">
                                        <h3>{getDisplayName(activeNegotiation)}</h3>
                                        <p className="chat-command-ref">{t.relatesToOffer}: {activeNegotiation.offerId}</p>
                                    </div>
                                </div>
                                <div className="chat-status">
                                    <span className={`status-badge ${activeNegotiation.status.toLowerCase()}`}>
                                        {activeNegotiation.status}
                                    </span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {isProposalsLoading ? (
                                    <div className="loading-state"><FiLoader className="animate-spin" /></div>
                                ) : (
                                    [...proposals].reverse().map((proposal) => (
                                        <React.Fragment key={proposal.id}>
                                            <div className={`message-group ${proposal.senderId === currentUser?.userId ? 'outgoing' : 'incoming'}`}>
                                                <div className="message-bubble">
                                                    <div className="proposal-data">
                                                        <span className="p-price">${proposal.proposedPrice}</span>
                                                        <span className="p-qty">× {proposal.proposedQuantity} {t.units}</span>
                                                    </div>
                                                    <div className="proposal-footer">
                                                        <span className="status">{t.status}: {proposal.status}</span>
                                                        <span className="time">{new Date(proposal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {proposal.status === 'PENDING' && proposal.senderId !== currentUser?.userId && activeNegotiation.status === 'OPEN' && (
                                                <div className="proposal-summary-card">
                                                    <h4>{t.incomingProposal}</h4>
                                                    <div className="proposal-details">
                                                        <div className="proposal-row">
                                                            <span className="label">{t.proposedUnitPrice}:</span>
                                                            <span className="value">${proposal.proposedPrice}</span>
                                                        </div>
                                                        <div className="proposal-row">
                                                            <span className="label">{t.quantity}:</span>
                                                            <span className="value">{proposal.proposedQuantity} {t.units}</span>
                                                        </div>
                                                        <div className="proposal-row total">
                                                            <span className="label">{t.totalValue}:</span>
                                                            <span className="value">${(proposal.proposedPrice * proposal.proposedQuantity).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="proposal-actions">
                                                        <button className="btn-accept" onClick={handleAccept}><FiCheck /> {t.approved || 'Accept'}</button>
                                                        <button className="btn-counter" onClick={() => {
                                                            setIsCountering(true);
                                                            setCounterData({ price: proposal.proposedPrice, quantity: proposal.proposedQuantity });
                                                        }}>{t.counter || 'Counter'}</button>
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {activeNegotiation.status === 'OPEN' && (
                                <div className="chat-input-area-container">
                                    {isCountering && (
                                        <div className="counter-overlay">
                                            <div className="counter-form">
                                                <div className="counter-header">
                                                    <span>{t.makeCounterOffer}</span>
                                                    <button onClick={() => setIsCountering(false)}><FiX /></button>
                                                </div>
                                                <div className="counter-inputs">
                                                    <div className="input-group">
                                                        <label>{t.newPrice}</label>
                                                        <input 
                                                            type="number" 
                                                            value={counterData.price} 
                                                            onChange={(e) => setCounterData(prev => ({ ...prev, price: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="input-group">
                                                        <label>{t.newQuantity}</label>
                                                        <input 
                                                            type="number" 
                                                            value={counterData.quantity} 
                                                            onChange={(e) => setCounterData(prev => ({ ...prev, quantity: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <button className="btn-send-counter" onClick={handleSendCounter}>{t.sendCounterOffer}</button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="chat-input-area">
                                        <button className="btn-attach"><FiPaperclip /></button>
                                        <div className="chat-input-wrapper">
                                            <input 
                                                type="text" 
                                                placeholder={t.typeAMessage} 
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                        </div>
                                        <button className="btn-send-message" onClick={handleSendMessage}><FiSend /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-selection-state">
                            <div className="no-selection-content">
                                <div className="no-selection-icon">
                                    <FiSend />
                                </div>
                                <h2>{t.selectNegotiation}</h2>
                                <p>{t.negotiationDesc}</p>
                                <div className="features-grid">
                                    <div className="feature"><FiCheck /> <span>{t.directComm}</span></div>
                                    <div className="feature"><FiCheck /> <span>{t.securePayments}</span></div>
                                    <div className="feature"><FiCheck /> <span>{t.priceNeg}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Negotiations;


