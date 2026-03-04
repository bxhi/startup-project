import React, { useState } from 'react';
import './Negotiations.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiPaperclip, FiSend, FiCheck } from 'react-icons/fi';

const Negotiations = ({ onNavigate }) => {
    // Dummy active conversation data based on screenshot
    const [conversations] = useState([
        { id: 1, name: 'ABC Trading', avatar: 'AT', unread: 2, time: '10:30 AM', lastMessage: 'Can you improve the delivery time?', commandRef: 'Command #CMD-001' },
        { id: 2, name: 'XYZ Imports', avatar: 'XI', unread: 0, time: 'Yesterday', lastMessage: 'Thank you for the proposal', commandRef: 'Command #CMD-005' },
        { id: 3, name: 'Global Traders', avatar: 'GT', unread: 1, time: '2 days ago', lastMessage: 'What about bulk discounts?', commandRef: 'Command #CMD-012' },
    ]);

    const [activeConversationId, setActiveConversationId] = useState(1);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="negotiations">
            <div className="negotiations-container">

                {/* Left Sidebar: Conversations List */}
                <div className="negotiations-sidebar">
                    <div className="negotiations-sidebar-header">
                        <h2>Negotiations</h2>
                        <p>Active conversations</p>
                    </div>

                    <div className="negotiations-list">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`negotiation-item ${activeConversationId === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveConversationId(conv.id)}
                            >
                                <div className="contact-avatar">
                                    {conv.avatar}
                                </div>
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

                {/* Right Area: Chat Interface */}
                <div className="chat-area">
                    {/* Chat Header */}
                    {activeConversation && (
                        <>
                            <div className="chat-header">
                                <div className="chat-contact-details">
                                    <div className="contact-avatar">
                                        {activeConversation.avatar}
                                    </div>
                                    <div className="chat-contact-info">
                                        <h3>{activeConversation.name}</h3>
                                        <p className="chat-command-ref">{activeConversation.commandRef}</p>
                                    </div>
                                </div>
                                <div className="chat-status">
                                    <span className="status-badge">IN PROGRESS</span>
                                </div>
                            </div>

                            {/* Chat Messages flow */}
                            <div className="chat-messages">

                                {/* Incoming Text Message */}
                                <div className="message-group incoming">
                                    <div className="message-bubble">
                                        Hello! I saw your offer for leather jackets. Can you provide more details?
                                    </div>
                                    <span className="message-timestamp">9:00 AM</span>
                                </div>

                                {/* Outgoing Text Message */}
                                <div className="message-group outgoing">
                                    <div className="message-bubble">
                                        Of course! I can offer premium quality Italian leather jackets. Here is my proposal:
                                    </div>
                                    <span className="message-timestamp">9:15 AM</span>
                                </div>

                                {/* Outgoing Proposal Summary Card */}
                                <div className="proposal-summary-card">
                                    <h4>Proposal Summary</h4>

                                    <div className="proposal-details">
                                        <div className="proposal-row">
                                            <span className="label">Unit Price:</span>
                                            <span className="value">€75</span>
                                        </div>
                                        <div className="proposal-row">
                                            <span className="label">Quantity:</span>
                                            <span className="value">100 units</span>
                                        </div>
                                        <div className="proposal-row">
                                            <span className="label">Delivery:</span>
                                            <span className="value">15 days</span>
                                        </div>
                                        <div className="proposal-row total">
                                            <span className="label">Total:</span>
                                            <span className="value">€7 500</span>
                                        </div>
                                    </div>

                                    <div className="proposal-actions">
                                        <button className="btn-accept">
                                            <FiCheck /> Accept
                                        </button>
                                        <button className="btn-counter">
                                            Counter
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Chat Input Area */}
                            <div className="chat-input-area">
                                <button className="btn-attach">
                                    <FiPaperclip />
                                </button>
                                <div className="chat-input-wrapper">
                                    <input type="text" placeholder="Type your message..." />
                                </div>
                                <button className="btn-send-message">
                                    <FiSend />
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Negotiations;
