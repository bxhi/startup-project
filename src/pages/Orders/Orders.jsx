import React, { useState } from 'react';
import './Orders.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiShoppingCart, FiChevronLeft, FiBox, FiMessageCircle, FiUpload, FiPackage, FiPlay, FiChevronRight } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import MarkShippedModal from '../../components/Orders/MarkShippedModal';
import { useLanguage } from '../../context/LanguageContext';

const Orders = ({ onNavigate }) => {
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isMarkShippedOpen, setIsMarkShippedOpen] = useState(false);
    const { t, dir } = useLanguage();

    const orders = [
        {
            id: 'ORD-2026-001',
            client: 'ABC Trading',
            total: '€7 500',
            escrowStatus: 'held',
            escrowStatusLabel: t.escrowHeld,
            orderStatus: 'processing',
            orderStatusLabel: t.orderProcessing,
            createdAt: '2026-02-10',
            items: [{ name: 'Premium Leather Jackets', detail: '€75 × 100 units', price: '€7 500' }],
            escrow: { deposit: '€3 750', held: '€7 500', released: '€0', progress: 50 }
        },
        {
            id: 'ORD-2026-002',
            client: 'XYZ Imports',
            total: '€4 500',
            escrowStatus: 'released',
            escrowStatusLabel: t.escrowReleased,
            orderStatus: 'completed',
            orderStatusLabel: t.orderCompleted,
            createdAt: '2026-02-05',
            items: [{ name: 'Cotton T-Shirts', detail: '€15 × 300 units', price: '€4 500' }],
            escrow: { deposit: '€4 500', held: '€4 500', released: '€4 500', progress: 100 }
        }
    ];

    const selectedOrder = orders.find(o => o.id === selectedOrderId);
    const BackIcon = dir === 'rtl' ? FiChevronRight : FiChevronLeft;

    const renderListView = () => (
        <div className="orders-list-container">
            <div className="orders-header">
                <h1>{t.ordersTitle}</h1>
                <p>{t.ordersSubtitle}</p>
            </div>
            <div className="orders-table-wrapper card-glass">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>{t.orderId}</th>
                            <th>{t.client}</th>
                            <th>{t.total}</th>
                            <th>{t.escrowStatus}</th>
                            <th>{t.orderStatus}</th>
                            <th>{t.createdAt}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="order-id-link" onClick={() => setSelectedOrderId(order.id)}>{order.id}</td>
                                <td>{order.client}</td>
                                <td className="total-cell">{order.total}</td>
                                <td>
                                    <span className={`status-pill escrow-${order.escrowStatus}`}>{order.escrowStatusLabel}</span>
                                </td>
                                <td>
                                    <span className={`status-pill order-${order.orderStatus}`}>{order.orderStatusLabel}</span>
                                </td>
                                <td>{order.createdAt}</td>
                                <td>
                                    <button className="view-details-btn" onClick={() => setSelectedOrderId(order.id)}>
                                        {t.viewDetails}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDetailView = () => (
        <div className="order-detail-container animate-in">
            <button className="back-btn" onClick={() => setSelectedOrderId(null)}>
                <BackIcon /> {t.backToOrders}
            </button>
            <div className="order-detail-header">
                <div className="header-main">
                    <h1>{selectedOrder.id}</h1>
                    <p>{t.createdOn} {selectedOrder.createdAt}</p>
                </div>
                <div className="header-status">
                    <span className={`status-pill escrow-${selectedOrder.escrowStatus}`}>
                        {t.escrowStatus}: {selectedOrder.escrowStatusLabel}
                    </span>
                    <span className={`status-pill order-${selectedOrder.orderStatus}`}>
                        {selectedOrder.orderStatusLabel}
                    </span>
                </div>
            </div>
            <div className="order-detail-grid">
                <div className="detail-main-column">
                    <div className="order-items-card card-glass">
                        <h3>{t.orderItems}</h3>
                        <div className="items-list">
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="order-item">
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>{item.detail}</p>
                                    </div>
                                    <div className="item-price">{item.price}</div>
                                </div>
                            ))}
                        </div>
                        <div className="total-row">
                            <span>{t.total}</span>
                            <span className="total-amount">{selectedOrder.total}</span>
                        </div>
                    </div>
                    <div className="shipment-proof-card card-glass">
                        <h3>{t.shipmentProof}</h3>
                        <div className="empty-state">
                            <div className="empty-icon"><FiPackage /></div>
                            <p>{t.noShipmentDocs}</p>
                            <Button variant="primary" className="btn-small-width" onClick={() => setIsMarkShippedOpen(true)}>
                                {t.markAsShipped}
                            </Button>
                        </div>
                    </div>
                    <div className="inspection-video-card card-glass">
                        <h3>{t.inspectionVideo}</h3>
                        <div className="empty-state">
                            <div className="empty-icon play-icon"><FiPlay /></div>
                            <p>{t.uploadInspectionVideo}</p>
                            <button className="btn-action-animated">
                                <FiUpload /> {t.uploadVideo}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="detail-sidebar-column">
                    <div className="escrow-details-card card-glass">
                        <h3>{t.escrowDetails}</h3>
                        <div className="escrow-stats">
                            <div className="escrow-stat">
                                <label>{t.depositAmount}</label>
                                <div className="value">{selectedOrder.escrow.deposit}</div>
                            </div>
                            <div className="escrow-stat">
                                <label>{t.totalHeld}</label>
                                <div className="value-primary">{selectedOrder.escrow.held}</div>
                            </div>
                            <div className="escrow-stat">
                                <label>{t.releasedAmount}</label>
                                <div className="value-success">{selectedOrder.escrow.released}</div>
                            </div>
                        </div>
                        <div className="escrow-progress-container">
                            <label>{t.escrowProgress}</label>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${selectedOrder.escrow.progress}%` }}></div>
                            </div>
                            <div className="progress-labels">
                                <span>0%</span><span>50%</span><span>100%</span>
                            </div>
                        </div>
                    </div>
                    <div className="actions-card card-glass">
                        <h3>{t.actionsCard}</h3>
                        <button className="btn-action-animated full-width">
                            <FiMessageCircle /> {t.contactClient}
                        </button>
                    </div>
                </div>
            </div>
            <MarkShippedModal isOpen={isMarkShippedOpen} onClose={() => setIsMarkShippedOpen(false)} orderId={selectedOrder?.id} />
        </div>
    );

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="orders" contentClassName="orders-layout">
            <div className="orders-page-wrapper">
                {selectedOrderId ? renderDetailView() : renderListView()}
            </div>
        </DashboardLayout>
    );
};

export default Orders;
