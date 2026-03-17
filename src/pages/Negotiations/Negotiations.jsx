import React, { useState } from 'react';
import './Negotiations.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiPaperclip, FiSend, FiCheck } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Negotiations = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [conversations] = useState([
        { id: 1, name: 'ABC Trading', avatar: 'AT', unread: 2, time: '10:30 AM', lastMessage: t.negotiationMessages, commandRef: 'Command #CMD-001' },
        { id: 2, name: 'XYZ Imports', avatar: 'XI', unread: 0, time: 'Yesterday', lastMessage: t.negotiationMessages, commandRef: 'Command #CMD-005' },
        { id: 3, name: 'Global Traders', avatar: 'GT', unread: 1, time: '2 days ago', lastMessage: t.negotiationMessages, commandRef: 'Command #CMD-012' },
    ]);

    const [activeConversationId, setActiveConversationId] = useState(1);
    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const inProgressText = t.inProgress ? t.inProgress.toUpperCase() : 'IN PROGRESS';

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="negotiations">
            <div className="negotiations-container">
                <div className="negotiations-sidebar">
                    <div className="negotiations-sidebar-header">
                        <h2>{t.negotiations}</h2>
                        <p>{t.activeNegotiations}</p>
                    </div>
                    <div className="negotiations-list">
                        {conversations.map((conv) => (
                            <div key={conv.id} className={`negotiation-item ${activeConversationId === conv.id ? 'active' : ''}`} onClick={() => setActiveConversationId(conv.id)}>
                                <div className="contact-avatar">{conv.avatar}</div>
                                <div className="contact-info">
                                    <div className="contact-header">
                                        <span className="contact-name">{conv.name}</span>
                                        {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                                    </div>
                                    <p className="message-preview">{conv.lastMessage}</p>
                                    <span className="message-time">{conv.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-area">
                    {activeConversation && (
                        <>
                            <div className="chat-header">
                                <div className="chat-contact-details">
                                    <div className="contact-avatar">{activeConversation.avatar}</div>
                                    <div className="chat-contact-info">
                                        <h3>{activeConversation.name}</h3>
                                        <p className="chat-command-ref">{activeConversation.commandRef}</p>
                                    </div>
                                </div>
                                <div className="chat-status">
                                    <span className="status-badge">{inProgressText}</span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                <div className="message-group incoming">
                                    <div className="message-bubble">
                                        {t.language === undefined ? 'Hello! I saw your offer for leather jackets. Can you provide more details?' : 'مرحباً! رأيت عرضك للجاكيتات الجلدية. هل يمكنك تقديم مزيد من التفاصيل؟'}
                                    </div>
                                    <span className="message-timestamp">9:00 AM</span>
                                </div>
                                <div className="message-group outgoing">
                                    <div className="message-bubble">
                                        {t.language === undefined ? 'Of course! I can offer premium quality Italian leather jackets. Here is my proposal:' : 'بالطبع! يمكنني تقديم جاكيتات جلدية إيطالية فاخرة. إليك عرضي:'}
                                    </div>
                                    <span className="message-timestamp">9:15 AM</span>
                                </div>
                                <div className="proposal-summary-card">
                                    <h4>{t.sendProposal ? t.sendProposal.replace('إرسال ', '') : 'Proposal Summary'}</h4>
                                    <div className="proposal-details">
                                        <div className="proposal-row">
                                            <span className="label">{t.proposedUnitPrice ? t.proposedUnitPrice.split('(')[0].trim() : 'Unit Price'}:</span>
                                            <span className="value">€75</span>
                                        </div>
                                        <div className="proposal-row">
                                            <span className="label">{t.quantity}:</span>
                                            <span className="value">100 {t.units}</span>
                                        </div>
                                        <div className="proposal-row">
                                            <span className="label">{t.deliveryTime ? t.deliveryTime.split('(')[0].trim() : 'Delivery'}:</span>
                                            <span className="value">15 days</span>
                                        </div>
                                        <div className="proposal-row total">
                                            <span className="label">{t.total}:</span>
                                            <span className="value">€7 500</span>
                                        </div>
                                    </div>
                                    <div className="proposal-actions">
                                        <button className="btn-accept"><FiCheck /> {t.approved || 'Accept'}</button>
                                        <button className="btn-counter">{t.saveDraft || 'Counter'}</button>
                                    </div>
                                </div>
                            </div>

                            <div className="chat-input-area">
                                <button className="btn-attach"><FiPaperclip /></button>
                                <div className="chat-input-wrapper">
                                    <input type="text" placeholder={t.describeOffer || 'Type your message...'} />
                                </div>
                                <button className="btn-send-message"><FiSend /></button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Negotiations;
