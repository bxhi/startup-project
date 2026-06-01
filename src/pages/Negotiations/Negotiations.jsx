import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Negotiations.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { negotiationService } from '../../api/negotiationService';
import socketService from '../../api/socketService';
import { FiPaperclip, FiSend, FiCheck, FiLoader, FiAlertCircle, FiX, FiEdit2, FiTrash2, FiMessageCircle, FiTrendingUp, FiZap, FiPackage, FiMapPin, FiBox, FiArrowRight, FiCopy } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { orderService } from '../../api/orderService';
import offerService from '../../api/offerService';

const Negotiations = ({ onNavigate }) => {
    const { t, dir } = useLanguage();
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
    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [messageInput, setMessageInput] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [isCountering, setIsCountering] = useState(false);
    const [counterData, setCounterData] = useState({ price: '', quantity: '' });
    const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [offerTitles, setOfferTitles] = useState({});
    const [showOrderResume, setShowOrderResume] = useState(false);
    const [showDetailsDropdown, setShowDetailsDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const activeNeg = negotiations.find(n => n.id === activeNegotiationId);
    const isImporter = currentUser?.role === 'importator' || currentUser?.role === 'importer';
    const hasOrder = (activeNeg?.orderId) || (activeOrder && !activeOrder.isCustom && ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(activeOrder.status?.toUpperCase()));

    const handleContextMenu = (e, proposal) => {
        e.preventDefault();
        if (proposal.senderId !== currentUser?.userId) return; // Only allow editing/deleting own messages
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            proposal
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    useEffect(() => {
        const handleClick = () => closeContextMenu();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t.copied || 'Copied to clipboard');
    };

    const handleDeleteMessage = async (proposalId) => {
        try {
            await negotiationService.deleteProposal(proposalId);
            setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, isDeleted: true, message: 'This message was deleted' } : p));
            toast.success(t.msgDeleted || 'Message deleted');
        } catch (err) {
            toast.error(t.errDeleteMsg || 'Failed to delete message');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [proposals, isCountering]);

    useEffect(() => {
        const fetchActiveOrder = async () => {
            let resolvedOrderId = activeNeg?.orderId;

            // 1. Try to find the Order ID from proposals
            if (!resolvedOrderId && proposals && proposals.length > 0) {
                const invoiceProp = proposals.find(p => p.message && (p.message.includes('FORMAL CONTRACT INVOICE') || p.message.includes('FORMAL ORDER CREATED')));
                if (invoiceProp) {
                    const orderIdMatch = invoiceProp.message.match(/Order ID:\s*`#?([A-Za-z0-9\-]+)`/i) || invoiceProp.message.match(/Order Reference:\s*#?([A-Za-z0-9\-]+)/i);
                    if (orderIdMatch) {
                        resolvedOrderId = orderIdMatch[1];
                    }
                }
            }

            // 2. Try to find from localStorage
            if (!resolvedOrderId && activeNeg?.id) {
                const savedOrderIds = JSON.parse(localStorage.getItem('negotiation_orders') || '{}');
                resolvedOrderId = savedOrderIds[activeNeg.id];
            }

            if (resolvedOrderId) {
                try {
                    const response = await orderService.getOrder(resolvedOrderId);
                    setActiveOrder(response.data);
                } catch (err) {
                    console.warn("Failed to fetch order status inside chat:", err);
                    setActiveOrder(null);
                }
            } else {
                setActiveOrder(null);
            }
        };
        fetchActiveOrder();
    }, [activeNeg?.id, activeNeg?.orderId, proposals]);

    const handleMessageChange = (e) => {
        const val = e.target.value;
        setMessageInput(val);
        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        setShowWarning(phoneRegex.test(val) || emailRegex.test(val));
    };

    const fetchNegotiations = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            setCurrentUser(user);

            const params = user.role === 'client' ? { clientId: user.userId } : { importatorId: user.userId };
            const response = await negotiationService.getNegotiations(params);
            const fetchedNegs = response.data || [];
            setNegotiations(fetchedNegs);
        } catch (err) {
            console.error('Error fetching negotiations:', err);
            setError('Failed to load negotiations.');
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, []);

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

    // Auto-refresh negotiations silently every 30 seconds as requested
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNegotiations(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchNegotiations]);

    useEffect(() => {
        if (!negotiations || negotiations.length === 0) return;
        negotiations.forEach(async (neg) => {
            if (neg.offerId && !offerTitles[neg.offerId]) {
                try {
                    const offerRes = await offerService.getOfferById(neg.offerId);
                    const offerData = offerRes.data || offerRes;
                    const title = offerData.title || offerData.productName || offerData.name;
                    if (title) {
                        setOfferTitles(prev => ({ ...prev, [neg.offerId]: title }));
                    }
                } catch (err) {
                    console.warn(`Failed to fetch offer title for ${neg.offerId}:`, err);
                }
            }
        });
    }, [negotiations, offerTitles]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeNegotiationId || !currentUser) return;

        if (editingMessageId) {
            try {
                await negotiationService.updateProposal(editingMessageId, messageInput);
                setProposals(prev => prev.map(p => p.id === editingMessageId ? { ...p, message: messageInput, isEdited: true } : p));
                setEditingMessageId(null);
                setMessageInput('');
                toast.success(t.msgUpdated || 'Message updated');
            } catch (err) {
                console.error('Error updating proposal:', err);
                toast.error(t.errUpdateMsg || 'Failed to update message');
            }
            return;
        }

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

    // Initialize order form items and address when the modal is opened
    useEffect(() => {
        if (showAcceptConfirm && activeNeg) {
            setDeliveryAddress('');
            setOrderItems([
                {
                    name: activeNeg.productName || '',
                    price: activeNeg.finalPrice || activeNeg.proposedPrice || (proposals.length > 0 ? proposals[0].proposedPrice : 0) || 0,
                    quantity: activeNeg.requestedQuantity || activeNeg.proposedQuantity || (proposals.length > 0 ? proposals[0].proposedQuantity : 1) || 1
                }
            ]);
        }
    }, [showAcceptConfirm, activeNeg, proposals]);

    const handleConfirmAndCreateOrder = async () => {
        if (!deliveryAddress.trim()) {
            toast.error('Please enter a delivery address');
            return;
        }
        for (const item of orderItems) {
            if (!item.name.trim()) {
                toast.error('Please enter all item names');
                return;
            }
            if (item.price === '' || parseFloat(item.price) < 0) {
                toast.error('Please enter valid prices');
                return;
            }
            if (!item.quantity || parseInt(item.quantity) < 1) {
                toast.error('Please enter valid quantities');
                return;
            }
        }

        setIsCreatingOrder(true);
        try {
            // 1. Create the order in the NestJS ms-orders backend
            const orderPayload = {
                clientId: activeNeg.clientId,
                importatorId: activeNeg.importatorId,
                deliveryAddress: deliveryAddress.trim(),
                status: 'CREATED',
                items: orderItems.map(item => ({
                    productName: item.name.trim(),
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.price)
                }))
            };
            const response = await orderService.createOrder(orderPayload);
            const createdOrderId = response.data?.id || response.data?._id || 'Order';
            // Immediately set the active order to reflect the newly created order and hide the create button
            setActiveOrder(response.data);
            try {
                const savedOrderIds = JSON.parse(localStorage.getItem('negotiation_orders') || '{}');
                savedOrderIds[activeNegotiationId] = createdOrderId;
                localStorage.setItem('negotiation_orders', JSON.stringify(savedOrderIds));
            } catch (storageErr) {
                console.warn('Failed to save order ID to localStorage:', storageErr);
            }

            try {
                await negotiationService.updateNegotiation(activeNegotiationId, { orderId: createdOrderId });
            } catch (updateErr) {
                console.error('Failed to update negotiation with order ID:', updateErr);
            }

            await fetchNegotiations(true);

            // 2. Format a highly readable rich markdown receipt card and post in chat
            const totalAmount = orderItems.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);
            const importerName = currentUser?.businessName || currentUser?.username || 'Importer';
            const clientName = activeNeg.clientName || 'Client';

            const summaryMessage = `✨ **FORMAL CONTRACT INVOICE** ✨\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `🆔 **Order ID:** \`#${createdOrderId.slice(0, 8).toUpperCase()}\`\n` +
                `🤝 **Contract Parties:**\n` +
                `   • **Importer:** ${importerName}\n` +
                `   • **Client:** ${clientName}\n` +
                `📍 **Delivery Destination:** ${deliveryAddress.trim()}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `🛍️ **ORDERED ITEMS LIST:**\n\n` +
                orderItems.map((item, idx) => `   ${idx + 1}. 📦 **${item.name.trim()}**\n` +
                    `      • Qty: \`${item.quantity}\` × \`${parseFloat(item.price).toLocaleString()} DZD\`\n` +
                    `      • Subtotal: **${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()} DZD**`).join('\n\n') +
                `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `💳 **PAYMENT SUMMARY:**\n` +
                `   • **Grand Total:** **${totalAmount.toLocaleString()} DZD**\n` +
                `   • **Current Status:** 🟡 \`AWAITING ESCROW CONFIRMATION\`\n\n` +
                `*Thank you for trading through our secure escrow platform!*`;

            try {
                // Post contract card to negotiation chat timeline
                await negotiationService.createProposal(
                    activeNegotiationId,
                    orderItems[0].quantity,
                    orderItems[0].price,
                    user.role || 'importator',
                    summaryMessage
                );

                // Update negotiation status to ACCEPTED directly in database (prevents duplicate Kafka events)
                await negotiationService.updateNegotiation(activeNegotiationId, { status: 'ACCEPTED', orderId: createdOrderId });

                // Update local negotiations state array immediately
                setNegotiations(prev => prev.map(n =>
                    n.id === activeNegotiationId ? { ...n, status: 'ACCEPTED', orderId: createdOrderId } : n
                ));

                // Fetch the active order details immediately to update UI state
                try {
                    if (response.data) {
                        setActiveOrder(response.data);
                    } else {
                        const orderRes = await orderService.getOrder(createdOrderId);
                        setActiveOrder(orderRes.data);
                    }
                } catch (fetchErr) {
                    console.warn("Failed to preload order details:", fetchErr);
                }
            } catch (negErr) {
                console.warn('Failed to sync negotiation status details:', negErr);
            }

            toast.success('Order created and negotiation finalized successfully!');
            setShowAcceptConfirm(false);

            // Refresh proposals list
            fetchProposals(activeNegotiationId);
        } catch (err) {
            console.error('Error finalising order:', err);
            const isAuthError = err.response?.status === 401 || err.message?.includes('401') || (err.message === 'Network Error' && !err.response);
            if (isAuthError) {
                toast.error('Session expired or unauthorized. Please log out and log in again to refresh your session.');
            } else {
                toast.error('Failed to finalize order. Please try again.');
            }
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const getDisplayName = (neg) => {
        if (!neg) return '';
        const name = (currentUser?.role === 'client')
            ? (neg.importatorName || neg.vendorName || 'Importer')
            : (neg.clientName || 'Client');
        return name;
    };

    const getProductDisplayTitle = (neg) => {
        if (!neg) return '';
        const title = offerTitles[neg.offerId] || neg.productName;
        if (title === 'Custom Order' || !title) {
            return t.createNewOffer || 'Custom Order';
        }
        return title;
    };

    const renderTimelineMessageContent = (message) => {
        if (!message) return null;
        if (message.includes('FORMAL CONTRACT INVOICE') || message.includes('FORMAL ORDER CREATED')) {
            const orderIdMatch = message.match(/Order ID:\s*`#?([A-Za-z0-9]+)`/i) || message.match(/Order Reference:\s*#?([A-Za-z0-9]+)/i);
            const orderId = orderIdMatch ? orderIdMatch[1] : (activeOrder?.id || activeNeg?.orderId || 'Order');
            
            const deliveryMatch = message.match(/Delivery Destination:\s*(.*)/i) || message.match(/Delivery Address:\s*(.*)/i);
            const deliveryAddressParsed = deliveryMatch ? deliveryMatch[1].replace(/━━━━━━━━━.*/, '').trim() : (activeOrder?.deliveryAddress || 'Address');
            
            const totalMatch = message.match(/Grand Total:\s*\*\*?(.*)\*\*?/i) || message.match(/Grand Total:\s*(.*)/i);
            const total = totalMatch ? totalMatch[1].trim() : (activeOrder?.totalPrice || '0 DZD');
            
            const status = activeOrder?.status || 'CREATED';
            const productName = getProductDisplayTitle(activeNeg);
            
            const statuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
            const currentIdx = statuses.indexOf(status.toUpperCase());
            const stepTranslations = {
                'CREATED': 'تم الإنشاء',
                'CONFIRMED': 'مؤكد',
                'SHIPPED': 'تم الشحن',
                'DELIVERED': 'تم التوصيل'
            };

            return (
                <div className="premium-timeline-invoice card-glass animate-zoom-in" style={{ padding: '0', overflow: 'hidden', border: '1.5px solid rgba(31, 115, 183, 0.25)', background: 'rgba(255, 255, 255, 0.88)', borderRadius: '24px', maxWidth: '600px', margin: '20px 0', boxShadow: '0 20px 50px rgba(31, 115, 183, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)', direction: dir }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(31, 115, 183, 0.1) 0%, rgba(99, 102, 241, 0.06) 100%)', padding: '26px', borderBottom: '1.5px solid rgba(31, 115, 183, 0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(31, 115, 183, 0.12)', color: '#1F73B7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1.5px solid rgba(31, 115, 183, 0.25)' }}>
                                    <FiPackage />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#1F73B7', letterSpacing: '0.15em' }}>{dir === 'rtl' ? 'اتفاقية الطلب' : 'ORDER AGREEMENT'}</div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: '950', color: '#0f172a', letterSpacing: '0.01em' }}>#{orderId.slice(0, 8).toUpperCase()}</div>
                                </div>
                            </div>
                            <div style={{ padding: '8px 18px', borderRadius: '30px', background: 'linear-gradient(135deg, #1F73B7, #6366f1)', fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', boxShadow: '0 4px 12px rgba(31, 115, 183, 0.2)' }}>
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '26px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', background: 'rgba(31, 115, 183, 0.02)', padding: '22px', borderRadius: '18px', border: '1px solid rgba(31, 115, 183, 0.08)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.05em' }}>{dir === 'rtl' ? 'العميل' : 'Client'}</div>
                                    <div style={{ color: '#1e293b', fontWeight: '750', fontSize: '1.05rem' }}>{activeNeg?.clientName || 'Client'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.05em' }}>{dir === 'rtl' ? 'المستورد' : 'Importer'}</div>
                                    <div style={{ color: '#1e293b', fontWeight: '750', fontSize: '1.05rem' }}>{currentUser?.businessName || currentUser?.username || 'Importer'}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.05em' }}>{dir === 'rtl' ? 'الوجهة' : 'Destination'}</div>
                                    <div style={{ color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                                        <FiMapPin style={{ color: '#1F73B7', fontSize: '1.1rem' }} /> {deliveryAddressParsed}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dir === 'rtl' ? 'تفاصيل محتوى الشحنة' : 'Manifest Items'}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(activeOrder?.items && activeOrder.items.length > 0) ? activeOrder.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'rgba(255, 255, 255, 0.9)', border: '1.5px solid rgba(31, 115, 183, 0.12)', borderLeft: dir === 'rtl' ? 'none' : '5px solid #1F73B7', borderRight: dir === 'rtl' ? '5px solid #1F73B7' : 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(31, 115, 183, 0.02)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>📦</span> {item.productName}
                                                </span>
                                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{item.quantity} {dir === 'rtl' ? 'وحدة' : 'Units'} × {item.unitPrice?.toLocaleString()} DZD</span>
                                            </div>
                                            <span style={{ color: '#1F73B7', fontWeight: '950', fontSize: '1.15rem' }}>{(item.unitPrice * item.quantity)?.toLocaleString()} DZD</span>
                                        </div>
                                    )) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'rgba(255, 255, 255, 0.9)', border: '1.5px solid rgba(31, 115, 183, 0.12)', borderLeft: dir === 'rtl' ? 'none' : '5px solid #1F73B7', borderRight: dir === 'rtl' ? '5px solid #1F73B7' : 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(31, 115, 183, 0.02)' }}>
                                            <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '1.05rem' }}>📦 {productName}</span>
                                            <span style={{ color: '#1F73B7', fontWeight: '950', fontSize: '1.15rem' }}>{total.includes('DZD') ? total : `${total} DZD`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '10px', padding: '24px', background: 'rgba(31, 115, 183, 0.02)', borderRadius: '18px', border: '1.5px solid rgba(31, 115, 183, 0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '4px', background: '#e2e8f0', zIndex: 0, borderRadius: '2px' }} />
                                    <div style={{ position: 'absolute', top: '18px', [dir === 'rtl' ? 'right' : 'left']: '10%', width: `${currentIdx >= 0 ? (currentIdx / 3) * 80 : 0}%`, height: '4px', background: 'linear-gradient(90deg, #1F73B7, #6366f1)', zIndex: 0, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '2px' }} />
                                    
                                    {statuses.map((step, idx) => {
                                        const isActive = currentIdx >= idx;
                                        return (
                                            <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: isActive ? 'linear-gradient(135deg, #1F73B7, #6366f1)' : '#ffffff', border: `3.5px solid ${isActive ? 'transparent' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#ffffff' : '#94a3b8', fontSize: '1rem', boxShadow: isActive ? '0 6px 20px rgba(31,115,183,0.3)' : 'none', transition: 'all 0.4s ease' }}>
                                                    {isActive && <FiCheck strokeWidth={3} />}
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isActive ? '#1F73B7' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{dir === 'rtl' ? stepTranslations[step] : step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(90deg, rgba(31, 115, 183, 0.05) 0%, rgba(99, 102, 241, 0.03) 100%)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid rgba(31, 115, 183, 0.12)' }}>
                        <span style={{ color: '#475569', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.95rem' }}>{dir === 'rtl' ? 'المجموع الكلي' : 'Grand Total'}</span>
                        <strong style={{ color: '#1F73B7', fontSize: '1.85rem', fontWeight: '950', textShadow: '0 2px 10px rgba(31, 115, 183, 0.1)' }}>{total.includes('DZD') ? total : `${total} DZD`}</strong>
                    </div>
                </div>
            );
        }

        return <p className="message-text">{message}</p>;
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="negotiations">
            <div className={`negotiations-container ${isPending ? 'pending-banner-active' : ''}`}>
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
                                    if (activeNegotiationId !== neg.id) {
                                        setActiveNegotiationId(neg.id);
                                        setProposals([]);
                                        setActiveOrder(null);
                                        setNegotiations(prev => prev.map(n =>
                                            n.id === neg.id ? { ...n, isRead: true } : n
                                        ));
                                    }
                                }}
                            >
                                <div className="contact-avatar">
                                    {(neg.clientName || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <span className="contact-name">{getDisplayName(neg)}</span>
                                        <span className="last-time">{neg.lastMessageTime || '12:45'}</span>
                                    </div>
                                    <p className="message-preview">
                                        {neg.lastMessage || getProductDisplayTitle(neg)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="negotiation-chat-main">
                    {activeNeg ? (
                        <>
                            <div className="chat-header" style={{ direction: dir, padding: '20px 24px' }}>
                                <div className="chat-contact-details" style={{ flex: '1', minWidth: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="contact-avatar" style={{ flexShrink: 0 }}>{(activeNeg.clientName || 'C').charAt(0).toUpperCase()}</div>
                                    <div className="chat-contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayName(activeNeg)}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="chat-command-ref" style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                                                {getProductDisplayTitle(activeNeg)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                    {activeNeg.status && activeNeg.status.toUpperCase() !== 'OPEN' && (
                                        <span className={`chat-command-ref ${activeNeg.status.toLowerCase()}`}>{activeNeg.status}</span>
                                    )}
                                    {!hasOrder && isImporter && (
                                        <div className="create-order-wrapper">
                                            <button
                                                className="btn-create-order-chat"
                                                onClick={() => setShowAcceptConfirm(true)}
                                            >
                                                <div className="btn-glow-effect"></div>
                                                <FiPackage className="btn-icon" />
                                                <span>{t.createOrder || 'Create Order'}</span>
                                            </button>
                                            <p className="btn-hint premium-hint">
                                                <FiZap /> {t.finalizeHint || 'Finalize terms and secure your order'}
                                            </p>
                                        </div>
                                    )}
                                    {hasOrder && (
                                        <div className="create-order-wrapper">
                                            {hasOrder && (() => {
                                        const status = activeOrder?.status?.toUpperCase() || 'CREATED';
                                        const steps = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                                        const currentStepIdx = steps.indexOf(status);
                                        const progressPercent = currentStepIdx >= 0 ? ((currentStepIdx + 1) / 4) * 100 : 0;
                                        
                                        // Dynamic status badge styling
                                        let badgeStyle = {
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.72rem',
                                            fontWeight: '900',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase'
                                        };
                                        if (status === 'CREATED') {
                                            badgeStyle = { ...badgeStyle, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' };
                                        } else if (status === 'CONFIRMED') {
                                            badgeStyle = { ...badgeStyle, background: 'rgba(31, 115, 183, 0.1)', color: '#1F73B7', border: '1px solid rgba(31, 115, 183, 0.2)' };
                                        } else if (status === 'SHIPPED') {
                                            badgeStyle = { ...badgeStyle, background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', border: '1px solid rgba(217, 119, 6, 0.2)' };
                                        } else if (status === 'DELIVERED') {
                                            badgeStyle = { ...badgeStyle, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
                                        } else {
                                            badgeStyle = { ...badgeStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
                                        }

                                        return (
                                            <div style={{ position: 'relative', width: '100%', zIndex: 50, marginBottom: '20px' }}>
                                                {/* Premium Horizontal Action Bar */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(31, 115, 183, 0.15)', padding: '14px 20px', borderRadius: '22px', animation: 'premiumFadeIn 0.5s ease', boxShadow: '0 10px 30px rgba(31, 115, 183, 0.08), inset 0 2px 0 rgba(255,255,255,0.8)', direction: dir, gap: '32px' }}>
                                                    
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        {/* Glowing Status Pill */}
                                                        <div style={{ position: 'relative' }}>
                                                            <div style={{ position: 'absolute', top: '-3px', left: '-3px', right: '-3px', bottom: '-3px', background: badgeStyle.color, borderRadius: '24px', opacity: 0.15, filter: 'blur(5px)', animation: 'pulse 2s infinite' }}></div>
                                                            <span style={{...badgeStyle, position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', background: '#ffffff', border: `1.5px solid ${badgeStyle.color}`}}>
                                                                {dir === 'rtl' ? (status === 'CREATED' ? 'تم الإنشاء' : status === 'CONFIRMED' ? 'مؤكد' : status === 'SHIPPED' ? 'تم الشحن' : status === 'DELIVERED' ? 'تم التوصيل' : status) : status}
                                                            </span>
                                                        </div>

                                                        {/* Sleek Progress Ring/Bar */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '90px', height: '6px', background: 'rgba(31, 115, 183, 0.1)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
                                                                <div style={{ width: `${progressPercent}%`, height: '100%', background: `linear-gradient(90deg, ${badgeStyle.color}, #6366f1)`, borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${badgeStyle.color}` }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: '950', color: badgeStyle.color }}>{progressPercent}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Creative View Details Button */}
                                                    <button
                                                        onClick={() => setShowDetailsDropdown(!showDetailsDropdown)}
                                                        style={{
                                                            padding: '10px 22px',
                                                            borderRadius: '16px',
                                                            background: showDetailsDropdown ? 'linear-gradient(135deg, #1F73B7, #6366f1)' : '#ffffff',
                                                            color: showDetailsDropdown ? '#ffffff' : '#1F73B7',
                                                            border: showDetailsDropdown ? 'none' : '1.5px solid rgba(31, 115, 183, 0.2)',
                                                            fontWeight: '900',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                            boxShadow: showDetailsDropdown ? '0 10px 25px rgba(31, 115, 183, 0.3)' : '0 4px 12px rgba(31, 115, 183, 0.05)',
                                                            transform: showDetailsDropdown ? 'translateY(-2px)' : 'none'
                                                        }}
                                                        onMouseOver={(e) => { if(!showDetailsDropdown) e.currentTarget.style.transform = 'translateY(-2px)' }}
                                                        onMouseOut={(e) => { if(!showDetailsDropdown) e.currentTarget.style.transform = 'none' }}
                                                    >
                                                        <FiBox size={18} style={{ animation: showDetailsDropdown ? 'float 2s ease-in-out infinite' : 'none' }} />
                                                        {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'} 
                                                        <div style={{ transform: showDetailsDropdown ? 'rotate(90deg)' : (dir === 'rtl' ? 'rotate(180deg)' : 'none'), transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', display: 'flex' }}>
                                                            <FiArrowRight size={16} />
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Absolutely Positioned Dropdown Overlay */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 14px)',
                                                    [dir === 'rtl' ? 'left' : 'right']: 0,
                                                    width: '380px',
                                                    maxWidth: '100%',
                                                    opacity: showDetailsDropdown ? 1 : 0,
                                                    visibility: showDetailsDropdown ? 'visible' : 'hidden',
                                                    transform: showDetailsDropdown ? 'translateY(0) scale(1)' : 'translateY(-15px) scale(0.95)',
                                                    transformOrigin: 'top center',
                                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    zIndex: 100,
                                                    pointerEvents: showDetailsDropdown ? 'auto' : 'none'
                                                }}>
                                                    {hasOrder && (
                                                        <div className="chat-order-details-dropdown card-glass" style={{
                                                            background: 'rgba(255, 255, 255, 0.98)',
                                                            backdropFilter: 'blur(25px)',
                                                            border: '1.5px solid rgba(255, 255, 255, 0.6)',
                                                            borderRadius: '24px',
                                                            padding: '24px',
                                                            boxShadow: '0 30px 60px rgba(31, 115, 183, 0.15), 0 0 0 1px rgba(31, 115, 183, 0.05)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '16px',
                                                            direction: dir
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(31, 115, 183, 0.1)', color: '#1F73B7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid rgba(31, 115, 183, 0.2)', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                                                        <FiBox />
                                                                    </div>
                                                                    <div>
                                                                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '950', letterSpacing: '-0.01em' }}>{dir === 'rtl' ? 'اتفاقية ضمان آمنة' : 'Secure Escrow Agreement'}</h4>
                                                                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '800' }}>
                                                                            {dir === 'rtl' ? 'معرف الطلب:' : 'Order ID:'} <code style={{ color: '#1F73B7', background: 'rgba(31,115,183,0.06)', padding: '2px 6px', borderRadius: '6px', fontSize: '0.78rem', margin: '0 6px', border: '1px solid rgba(31,115,183,0.1)' }}>#{activeOrder?.id?.slice(0, 8).toUpperCase() || activeNeg?.orderId?.slice(0, 8).toUpperCase()}</code>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={() => onNavigate('orders', activeOrder?.id || activeNeg?.orderId)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '10px 16px',
                                                                    background: 'linear-gradient(135deg, #1F73B7, #6366f1)',
                                                                    color: '#fff',
                                                                    borderRadius: '14px',
                                                                    fontWeight: '900',
                                                                    fontSize: '0.82rem',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    boxShadow: '0 6px 15px rgba(31, 115, 183, 0.25)',
                                                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                                    marginTop: '4px'
                                                                }}
                                                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(31, 115, 183, 0.35)'; }}
                                                                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(31, 115, 183, 0.25)'; }}
                                                            >
                                                                {dir === 'rtl' ? 'الذهاب للوحة القيادة' : 'Go to Deck'} <FiArrowRight size={16} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
                                                            </button>

                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px', background: 'rgba(31, 115, 183, 0.02)', padding: '18px', borderRadius: '18px', border: '1px solid rgba(31, 115, 183, 0.08)' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.08em' }}>{dir === 'rtl' ? 'أطراف العقد' : 'Contract Parties'}</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#1e293b', fontWeight: '800', fontSize: '0.9rem' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#64748b' }}>{dir === 'rtl' ? 'المستورد' : 'Importer'}:</span> <span>{currentUser?.role === 'client' ? activeNeg?.importatorName : (currentUser?.businessName || currentUser?.username || 'Importer')}</span></div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#64748b' }}>{dir === 'rtl' ? 'العميل' : 'Client'}:</span> <span>{currentUser?.role === 'client' ? (currentUser?.username || 'Client') : activeNeg?.clientName}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ borderTop: '1.5px dashed rgba(31, 115, 183, 0.15)', paddingTop: '16px' }}>
                                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.08em' }}>{dir === 'rtl' ? 'عنوان التسليم' : 'Delivery Address'}</div>
                                                                    <div style={{ color: '#334155', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <FiMapPin style={{ color: '#1F73B7', flexShrink: 0, fontSize: '1.1rem' }} /> 
                                                                        <span>{activeOrder?.deliveryAddress || activeNeg?.deliveryAddress || (dir === 'rtl' ? 'غير محدد' : 'Not specified')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.08em' }}>{dir === 'rtl' ? 'تفاصيل محتوى الشحنة' : 'Manifest Payload Details'}</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    {(activeOrder?.items && activeOrder.items.length > 0) ? activeOrder.items.map((item, idx) => (
                                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ffffff', border: '1.5px solid rgba(31, 115, 183, 0.12)', borderLeft: dir === 'rtl' ? 'none' : '4px solid #1F73B7', borderRight: dir === 'rtl' ? '4px solid #1F73B7' : 'none', borderRadius: '14px', boxShadow: '0 2px 8px rgba(31,115,183,0.02)' }}>
                                                                            <div>
                                                                                <span style={{ color: '#1e293b', fontWeight: '900', fontSize: '0.9rem' }}>📦 {item.productName}</span>
                                                                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', margin: '0 10px' }}>{item.quantity} {dir === 'rtl' ? 'وحدة' : 'Unit(s)'} × {item.unitPrice?.toLocaleString()} DZD</span>
                                                                            </div>
                                                                            <span style={{ color: '#1F73B7', fontWeight: '950', fontSize: '0.95rem' }}>{(item.unitPrice * item.quantity).toLocaleString()} DZD</span>
                                                                        </div>
                                                                    )) : (
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ffffff', border: '1.5px solid rgba(31, 115, 183, 0.12)', borderLeft: dir === 'rtl' ? 'none' : '4px solid #1F73B7', borderRight: dir === 'rtl' ? '4px solid #1F73B7' : 'none', borderRadius: '14px', boxShadow: '0 2px 8px rgba(31,115,183,0.02)' }}>
                                                                            <span style={{ color: '#1e293b', fontWeight: '900', fontSize: '0.9rem' }}>📦 {getProductDisplayTitle(activeNeg)}</span>
                                                                            <span style={{ color: '#1F73B7', fontWeight: '950', fontSize: '0.95rem' }}>{activeOrder?.totalPrice?.toLocaleString() || ((activeNeg?.requestedQuantity || 1) * (activeNeg?.finalPrice || 0)).toLocaleString()} DZD</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid rgba(31,115,183,0.08)', paddingTop: '16px', marginTop: '4px' }}>
                                                                <span style={{ color: '#475569', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.1em' }}>{dir === 'rtl' ? 'المجموع الكلي' : 'Grand Total'}</span>
                                                                <strong style={{ color: '#1F73B7', fontSize: '1.45rem', fontWeight: '950', textShadow: '0 2px 10px rgba(31,115,183,0.1)' }}>{activeOrder?.totalPrice?.toLocaleString() || ((activeNeg?.requestedQuantity || 1) * (activeNeg?.finalPrice || 0)).toLocaleString()} DZD</strong>
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                        );
                                    })()}
                                </div>
                                            )}
                                </div>
                            </div>

                            <div className="chat-messages">
                                {isProposalsLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <div className="premium-spinner"></div>
                                    </div>
                                ) : (
                                    [...proposals].reverse().map((p) => {
                                        const isMsgDeleted = p.status === 'DELETED' || p.isDeleted;
                                    return (
                                        <div key={p.id} className={`message-group ${p.senderId === currentUser?.userId ? 'outgoing' : 'incoming'} ${isMsgDeleted ? 'deleted-message-group' : ''}`}>
                                            {isMsgDeleted ? (
                                                <div 
                                                    className="deleted-message-bar"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 16px',
                                                        background: 'rgba(241, 245, 249, 0.6)',
                                                        border: '1px dashed rgba(148, 163, 184, 0.4)',
                                                        borderRadius: '30px',
                                                        color: '#94a3b8',
                                                        fontSize: '0.85rem',
                                                        fontStyle: 'italic',
                                                        margin: '4px 0',
                                                        userSelect: 'none'
                                                    }}
                                                >
                                                    <span>🚫</span> {dir === 'rtl' ? 'تم حذف هذا المقترح' : 'This proposal was deleted'}
                                                </div>
                                            ) : (
                                                <div 
                                                    className="message-bubble" 
                                                    onContextMenu={(e) => handleContextMenu(e, p)}
                                                >
                                                    <p className="message-text">
                                                        {p.message}
                                                        {p.isEdited && <span style={{ fontSize: '0.65rem', marginLeft: '6px', opacity: 0.6 }}>(edited)</span>}
                                                    </p>

                                                    {p.proposedPrice > 0 && (
                                                        <div 
                                                            className="proposal-summary-card"
                                                            style={p.status === 'ACCEPTED' ? { border: '2px solid #1F73B7', background: 'rgba(31, 115, 183, 0.05)', boxShadow: '0 4px 12px rgba(31, 115, 183, 0.15)' } : {}}
                                                        >
                                                             <div className="proposal-row">
                                                                 <span className="p-label">{t.proposedPriceLabel || 'Proposed Price'}</span>
                                                                 <span className="p-value">${p.proposedPrice}</span>
                                                             </div>
                                                             <div className="proposal-row">
                                                                 <span className="p-label">{t.proposedQuantityLabel || 'Proposed Quantity'}</span>
                                                                 <span className="p-value">{p.proposedQuantity} Units</span>
                                                             </div>

                                                             {p.status === 'ACCEPTED' && (
                                                                 <div style={{ marginTop: '10px', color: '#1F73B7', fontWeight: '950', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                     <FiCheck strokeWidth={3} /> ACCEPTED
                                                                 </div>
                                                             )}

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
                                            )}
                                        </div>
                                    );
                                })
                                )}
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
                                                    <input type="number" value={counterData.price} onChange={e => setCounterData(prev => ({ ...prev, price: e.target.value }))} />
                                                </div>
                                                <div className="input-group">
                                                    <label>Quantity</label>
                                                    <input type="number" value={counterData.quantity} onChange={e => setCounterData(prev => ({ ...prev, quantity: e.target.value }))} />
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
                        <div className="chat-blank-slate" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)' }}>
                            <div style={{ background: 'rgba(31, 115, 183, 0.05)', padding: '30px', borderRadius: '50%', marginBottom: '24px' }}>
                                <FiMessageCircle size={48} style={{ color: '#1F73B7', opacity: 0.8 }} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '800', marginBottom: '12px' }}>{dir === 'rtl' ? 'اختر مفاوضة للبدء' : 'Choose a Negotiation'}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '320px', textAlign: 'center', lineHeight: '1.6' }}>
                                {dir === 'rtl' ? 'اختر مفاوضة وابدأ التفاوض أو أنشئ طلباً مخصصاً.' : 'Choose a negotiation and start negotiating or make an order'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {contextMenu && !contextMenu.proposal.isDeleted && (
                <div 
                    className="context-menu-premium"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '12px',
                        padding: '6px',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '160px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <button 
                        onClick={() => handleCopyText(contextMenu.proposal.message)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '0.85rem' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <FiBox /> Copy
                    </button>
                    <button 
                        onClick={() => {
                            setEditingMessageId(contextMenu.proposal.id);
                            setMessageInput(contextMenu.proposal.message);
                            closeContextMenu();
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', color: '#334155', fontWeight: '600', fontSize: '0.85rem' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <FiEdit2 /> Edit
                    </button>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                    <button 
                        onClick={() => { handleDeleteMessage(contextMenu.proposal.id); closeContextMenu(); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', color: '#ef4444', fontWeight: '600', fontSize: '0.85rem' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <FiTrash2 /> Delete
                    </button>
                </div>
            )}

                {/* Cool Custom Confirmation Modal moved to top level for correct Z-index */}
                {showAcceptConfirm && activeNeg && (() => {
                    const resolvedImporterName = (currentUser?.role === 'importator' || currentUser?.role === 'importer')
                        ? (currentUser?.fullName || currentUser?.businessName || currentUser?.username || 'Importer')
                        : (activeNeg.importatorName || activeNeg.vendorName || 'Importer');
                    const resolvedClientName = (currentUser?.role === 'client')
                        ? (currentUser?.fullName || currentUser?.businessName || currentUser?.username || 'Client')
                        : (activeNeg.clientName || 'Client');
                    return (
                        <div className="custom-modal-overlay animate-fade-in">
                            <div className="custom-modal-content order-creation-modal animate-zoom-in">
                                <div className="modal-icon-header">
                                    <div className="icon-circle">
                                        <FiPackage />
                                    </div>
                                </div>
                                <h2>{t.createFormalOrder || 'Create Formal Order'}</h2>
                                <p className="modal-subtitle-desc">{t.createOrderDesc || 'Finalize terms and generate the contract details.'}</p>

                                <div className="order-form-body">
                                    <div className="form-grid-two-columns">
                                        <div className="form-group-item">
                                            <label>{t.importerLabel || 'Importer'}</label>
                                            <input
                                                type="text"
                                                value={resolvedImporterName}
                                                readOnly
                                                className="input-readonly"
                                            />
                                        </div>
                                        <div className="form-group-item">
                                            <label>{t.clientLabel || 'Client'}</label>
                                            <input
                                                type="text"
                                                value={resolvedClientName}
                                                readOnly
                                                className="input-readonly"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-item full-width-field">
                                        <label>{t.deliveryAddressLabel || 'Delivery Address *'}</label>
                                        <input
                                            type="text"
                                            placeholder={t.deliveryAddressPlaceholder || 'Enter full delivery address'}
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            className="input-premium-text"
                                            required
                                        />
                                    </div>

                                    <div className="order-items-section">
                                        <div className="section-header-row">
                                            <h3>{t.orderItemsLabel || 'Items in Order'}</h3>
                                            <button
                                                type="button"
                                                className="btn-add-item-dynamic"
                                                onClick={() => setOrderItems([...orderItems, { name: '', price: '', quantity: 1 }])}
                                            >
                                                + {t.addItem || 'Add Item'}
                                            </button>
                                        </div>

                                        <div className="dynamic-items-list">
                                            {orderItems.map((item, idx) => (
                                                <div key={idx} className="dynamic-item-row">
                                                    <div className="item-field item-name-field">
                                                        <label>{t.itemName || 'Item Name *'}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={t.itemNamePlaceholder || 'e.g. Cargo Container'}
                                                            value={item.name}
                                                            onChange={(e) => {
                                                                const newItems = [...orderItems];
                                                                newItems[idx].name = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="input-premium-text"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="item-field item-price-field">
                                                        <label>{t.unitPrice || 'Price per Unit (DZD) *'}</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={item.price}
                                                            onChange={(e) => {
                                                                const newItems = [...orderItems];
                                                                newItems[idx].price = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="input-premium-text"
                                                            min="0"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="item-field item-qty-field">
                                                        <label>{t.qty || 'Qty *'}</label>
                                                        <input
                                                            type="number"
                                                            placeholder="1"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...orderItems];
                                                                newItems[idx].quantity = e.target.value;
                                                                setOrderItems(newItems);
                                                            }}
                                                            className="input-premium-text"
                                                            min="1"
                                                            required
                                                        />
                                                    </div>
                                                    {orderItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn-remove-item-dynamic"
                                                            onClick={() => {
                                                                const newItems = orderItems.filter((_, i) => i !== idx);
                                                                setOrderItems(newItems);
                                                            }}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="order-total-preview-card">
                                        <span>{t.totalOrderValue || 'Total Order Value:'}</span>
                                        <strong>
                                            {orderItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0).toLocaleString()} DZD
                                        </strong>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-modal-secondary" onClick={() => setShowAcceptConfirm(false)} disabled={isCreatingOrder}>
                                        {t.cancel || 'Cancel'}
                                    </button>
                                    <button
                                        className="btn-modal-primary"
                                        onClick={handleConfirmAndCreateOrder}
                                        disabled={isCreatingOrder}
                                    >
                                        {isCreatingOrder ? <FiLoader className="animate-spin" /> : (t.confirmAndCreate || 'Confirm & Create Order')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            {contextMenu && (
                <div 
                    className="premium-context-menu"
                    style={{
                        position: 'fixed',
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                        zIndex: 9999,
                        background: '#ffffff',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        padding: '6px',
                        minWidth: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                    }}
                >
                    <button 
                        onClick={() => {
                            handleCopyText(contextMenu.proposal.message);
                            closeContextMenu();
                        }}
                        style={{
                            padding: '10px 14px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%'
                        }}
                    >
                        <FiCopy size={14} /> {t.copy || 'Copy'}
                    </button>
                    <button 
                        onClick={() => {
                            setEditingMessageId(contextMenu.proposal.id);
                            setMessageInput(contextMenu.proposal.message);
                            closeContextMenu();
                        }}
                        style={{
                            padding: '10px 14px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%'
                        }}
                    >
                        <FiEdit2 size={14} /> {t.edit || 'Edit'}
                    </button>
                    <button 
                        onClick={() => {
                            handleDeleteMessage(contextMenu.proposal.id);
                            closeContextMenu();
                        }}
                        style={{
                            padding: '10px 14px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%'
                        }}
                    >
                        <FiTrash2 size={14} /> {t.delete || 'Delete'}
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Negotiations;
