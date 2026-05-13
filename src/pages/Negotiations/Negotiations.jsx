import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Negotiations.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { negotiationService } from '../../api/negotiationService';
import socketService from '../../api/socketService';
import { FiPaperclip, FiSend, FiCheck, FiLoader, FiAlertCircle, FiX, FiEdit2, FiTrash2, FiMessageCircle, FiTrendingUp, FiZap } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Negotiations = ({ onNavigate }) => {
    const { t } = useLanguage();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);
    
    const [negotiations, setNegotiations] = useState([]);
    const [activeNegotiationId, setActiveNegotiationId] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProposalsLoading, setIsProposalsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [isCountering, setIsCountering] = useState(false);
    const [counterData, setCounterData] = useState({ price: '', quantity: '' });
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [proposals, isCountering]);

    const handleMessageChange = (e) => {
        const val = e.target.value;
        setMessageInput(val);
        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        setShowWarning(phoneRegex.test(val) || emailRegex.test(val));
    };

    const fetchNegotiations = useCallback(async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            setCurrentUser(user);

            const params = user.role === 'client' ? { clientId: user.userId } : { importatorId: user.userId };
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

    const fetchProposals = useCallback(async (negId) => {
        if (!negId) return;
        setIsProposalsLoading(true);
        try {
            const response = await negotiationService.getProposals(negId);
            const fetchedProposals = response.data || [];
            setProposals(fetchedProposals);
            
            // Mark the active negotiation as read in the sidebar list
            setNegotiations(prev => prev.map(n => 
                n.id === negId ? { ...n, isRead: true } : n
            ));

            // Mark unread as read on server
            const unread = fetchedProposals.filter(p => !p.isRead && p.senderId !== currentUser?.userId);
            for (const p of unread) {
                negotiationService.openProposal(p.id).catch(console.error);
            }
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setIsProposalsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchNegotiations();
        socketService.connect();
        return () => { socketService.removeListeners(); socketService.disconnect(); };
    }, [fetchNegotiations]);

    useEffect(() => {
        if (activeNegotiationId) {
            fetchProposals(activeNegotiationId);
            socketService.joinNegotiation(activeNegotiationId);
        }

        socketService.onProposalCreated((proposal) => {
            if (proposal.negotiationId === activeNegotiationId) {
                setProposals(prev => [proposal, ...prev]);
                if (proposal.senderId !== currentUser?.userId) {
                    negotiationService.openProposal(proposal.id).catch(console.error);
                }
                // Update sidebar for active neg
                setNegotiations(prev => prev.map(n => 
                    n.id === activeNegotiationId ? { ...n, lastMessage: proposal.message, lastSenderId: proposal.senderId, isRead: true } : n
                ));
            } else {
                // Update sidebar for inactive neg
                setNegotiations(prev => prev.map(n => 
                    n.id === proposal.negotiationId ? { ...n, isRead: false, lastSenderId: proposal.senderId, lastMessage: proposal.message } : n
                ));
            }
        });

        socketService.onNegotiationAccepted((data) => {
            if (data.negotiationId === activeNegotiationId) {
                fetchNegotiations();
                fetchProposals(activeNegotiationId);
            }
        });

        return () => { socketService.removeListeners(); };
    }, [activeNegotiationId, fetchProposals, fetchNegotiations, currentUser]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeNegotiationId || !currentUser) return;
        try {
            const activeNeg = negotiations.find(n => n.id === activeNegotiationId);
            await negotiationService.createProposal(
                activeNegotiationId,
                activeNeg.requestedQuantity || 1,
                activeNeg.finalPrice || 0,
                currentUser.role,
                messageInput
            );

            // Update local sidebar state immediately
            setNegotiations(prev => prev.map(n => 
                n.id === activeNegotiationId ? { ...n, lastMessage: messageInput, lastSenderId: currentUser.userId, isRead: true } : n
            ));

            setMessageInput('');
            setShowWarning(false);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to send message');
        }
    };

    const handleSendCounter = async () => {
        if (!counterData.price || !counterData.quantity) return;
        try {
            await negotiationService.createProposal(
                activeNegotiationId,
                counterData.quantity,
                counterData.price,
                currentUser.role,
                `Counter offer: ${counterData.quantity} units at $${counterData.price}`
            );
            setIsCountering(false);
            setCounterData({ price: '', quantity: '' });
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to send counter');
        }
    };

    const handleAccept = async () => {
        try {
            await negotiationService.acceptNegotiation(activeNegotiationId);
            toast.success('Negotiation accepted!');
            fetchNegotiations();
        } catch (err) {
            toast.error('Failed to accept');
        }
    };

    const activeNeg = negotiations.find(n => n.id === activeNegotiationId);
    const getDisplayName = (neg) => {
        if (!neg) return '';
        const name = neg.clientName || (neg.role === 'client' ? neg.clientId : neg.importatorId);
        return name?.slice(0, 12);
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="negotiations">
            <div className="negotiations-container">
                <div className="negotiations-sidebar">
                    <div className="negotiations-sidebar-header">
                        <h2>{t.negotiations || 'Negotiations'}</h2>
                        <p>{t.activeNegotiations || 'Your active chats'}</p>
                    </div>
                    <div className="negotiations-list">
                        {isLoading ? (
                            <div className="loading-state"><FiLoader className="animate-spin" /></div>
                        ) : negotiations.map((neg) => (
                            <div
                                key={neg.id}
                                className={`negotiation-item ${activeNegotiationId === neg.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveNegotiationId(neg.id);
                                    // Mark only this specific negotiation as read locally
                                    setNegotiations(prev => prev.map(n => 
                                        n.id === neg.id ? { ...n, isRead: true } : n
                                    ));
                                }}
                            >
                                <div className="contact-avatar">
                                    {(neg.clientName || 'C').charAt(0).toUpperCase()}
                                    {!neg.isRead && neg.lastSenderId !== currentUser?.userId && (
                                        <div className="unread-dot" />
                                    )}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <span className="contact-name">{getDisplayName(neg)}</span>
                                        <span className="last-time">{neg.lastMessageTime || '12:45'}</span>
                                    </div>
                                    <p className={`message-preview ${(!neg.isRead && neg.lastSenderId !== currentUser?.userId) ? 'unread' : ''}`}>
                                        {neg.lastMessage || `Offer: ${neg.offerId?.slice(0, 8)}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="negotiation-chat-main">
                    {activeNeg ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-contact-details">
                                    <div className="contact-avatar">{(activeNeg.clientName || 'C').charAt(0).toUpperCase()}</div>
                                    <div className="chat-contact-info">
                                        <h3>{getDisplayName(activeNeg)}</h3>
                                        <span className="chat-command-ref">Offer: {activeNeg.offerId}</span>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <span className={`chat-command-ref ${activeNeg.status.toLowerCase()}`}>{activeNeg.status}</span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {[...proposals].reverse().map((p) => (
                                    <div key={p.id} className={`message-group ${p.senderId === currentUser?.userId ? 'outgoing' : 'incoming'}`}>
                                        <div className="message-bubble">
                                            <p className="message-text">{p.message}</p>
                                            
                                            {(p.proposedPrice > 0) && (
                                                <div className="proposal-summary-card">
                                                    <div className="proposal-row">
                                                        <span className="p-label">{t.proposedPriceLabel || 'Proposed Price'}</span>
                                                        <span className="p-value">${p.proposedPrice}</span>
                                                    </div>
                                                    <div className="proposal-row">
                                                        <span className="p-label">{t.proposedQuantityLabel || 'Proposed Quantity'}</span>
                                                        <span className="p-value">{p.proposedQuantity} Units</span>
                                                    </div>
                                                    
                                                    {p.senderId !== currentUser?.userId && p.status === 'PENDING' && (
                                                        <div className="proposal-actions">
                                                            <button className="btn-action-small accept" onClick={handleAccept}>Accept</button>
                                                            <button className="btn-action-small reject" onClick={() => {
                                                                setIsCountering(true);
                                                                setCounterData({ price: p.proposedPrice, quantity: p.proposedQuantity });
                                                            }}>Counter</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area-container">
                                {showWarning && (
                                    <div className="safety-warning-bubble">
                                        <FiAlertCircle /> <span>IMMEDIATE BAN RISK: Do not share contact info.</span>
                                    </div>
                                )}
                                
                                {isCountering && (
                                    <div className="counter-overlay">
                                        <div className="counter-form">
                                            <div className="counter-header">
                                                <span>Counter Offer</span>
                                                <button onClick={() => setIsCountering(false)}><FiX /></button>
                                            </div>
                                            <div className="counter-inputs">
                                                <div className="input-group">
                                                    <label>New Price</label>
                                                    <input type="number" value={counterData.price} onChange={e => setCounterData(prev => ({...prev, price: e.target.value}))} />
                                                </div>
                                                <div className="input-group">
                                                    <label>Quantity</label>
                                                    <input type="number" value={counterData.quantity} onChange={e => setCounterData(prev => ({...prev, quantity: e.target.value}))} />
                                                </div>
                                            </div>
                                            <button className="btn-send-counter" onClick={handleSendCounter}>Send Counter Offer</button>
                                        </div>
                                    </div>
                                )}

                                <div 
                                    className="chat-input-area-wrapper"
                                    onClick={() => {
                                        if (isPending) {
                                            toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
                                        }
                                    }}
                                >
                                    {attachedFile && (
                                        <div className="attached-file-preview">
                                            <div className="file-info">
                                                <FiPaperclip />
                                                <span>{attachedFile.name}</span>
                                            </div>
                                            <button className="remove-file-btn" onClick={() => setAttachedFile(null)}>
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                    <div className="chat-input-area">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            style={{ display: 'none' }} 
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setAttachedFile(file);
                                                }
                                            }}
                                        />
                                        <button 
                                            className={`btn-attach ${isPending ? 'pending-disabled' : ''}`} 
                                            title={isPending ? "Verification required" : "Attach file"} 
                                            onClick={() => !isPending && fileInputRef.current?.click()}
                                        >
                                            <FiPaperclip />
                                        </button>
                                        <div className={`chat-input-wrapper ${isPending ? 'pending-disabled' : ''}`}>
                                            <input
                                                type="text"
                                                placeholder={isPending ? "Verification in progress..." : "Type a message..."}
                                                value={messageInput}
                                                onChange={handleMessageChange}
                                                onKeyPress={e => !isPending && e.key === 'Enter' && handleSendMessage()}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <button 
                                            className={`btn-send ${isPending ? 'pending-disabled' : ''}`} 
                                            onClick={() => {
                                                if (!isPending) {
                                                    handleSendMessage();
                                                    setAttachedFile(null);
                                                }
                                            }} 
                                            title={isPending ? "Verification required" : "Send message"}
                                        >
                                            <FiSend />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection-state">
                            <div className="no-selection-content">
                                <div className="no-selection-icon">
                                    <FiMessageCircle />
                                </div>
                                <h2>{t.workspaceTitle || 'Your Workspace'}</h2>
                                <p>{t.selectNegotiationPlaceholder}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Negotiations;

