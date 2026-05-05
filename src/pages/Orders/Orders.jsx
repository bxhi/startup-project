import React, { useState, useEffect, useCallback } from 'react';
import './Orders.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiShoppingCart, FiChevronLeft, FiBox, FiMessageCircle, FiUpload, FiPackage, FiPlay, FiChevronRight, FiLoader, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import MarkShippedModal from '../../components/Orders/MarkShippedModal';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../api/orderService';

const Orders = ({ onNavigate }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isMarkShippedOpen, setIsMarkShippedOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t, dir } = useLanguage();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (currentUser?.role === 'client') {
                params.clientId = currentUser.userId;
            } else {
                params.importatorId = currentUser.userId;
            }
            const response = await orderService.getOrders(params);
            // The backend returns { data: [...], total: ... }
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.role, currentUser?.userId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!selectedOrderId) {
                setSelectedOrder(null);
                return;
            }
            try {
                const response = await orderService.getOrder(selectedOrderId);
                setSelectedOrder(response.data);
            } catch (err) {
                console.error('Error fetching order detail:', err);
            }
        };
        fetchOrderDetail();
    }, [selectedOrderId]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'DELIVERED': return 'completed';
            case 'CANCELLED': return 'cancelled';
            case 'CREATED':
            case 'CONFIRMED':
            case 'PAID':
            case 'SHIPPED':
                return 'processing';
            default: return 'processing';
        }
    };

    const getEscrowStatus = (order) => {
        if (order.status === 'DELIVERED') return { key: 'released', label: t.escrowReleased };
        return { key: 'held', label: t.escrowHeld };
    };

    const BackIcon = dir === 'rtl' ? FiChevronRight : FiChevronLeft;

    const renderListView = () => (
        <div className="orders-list-container">
            <div className="orders-header">
                <h1>{t.ordersTitle}</h1>
                <p>{t.ordersSubtitle}</p>
            </div>
            {isLoading ? (
                <div className="loading-state-full"><FiLoader className="animate-spin" /> {t.loading}...</div>
            ) : error ? (
                <div className="error-state-full"><FiAlertCircle /> {error}</div>
            ) : orders.length === 0 ? (
                <div className="empty-orders-view-premium card-glass animate-in">
                    <div className="empty-illustration">
                        <div className="blob-bg"></div>
                        <FiBox className="main-icon" />
                        <div className="dot dot-1"></div>
                        <div className="dot dot-2"></div>
                    </div>
                    <h2>{t.noOrdersFound || 'No Orders Yet'}</h2>
                    <p>{t.noOrdersMsg}</p>
                    <button className="btn-discover" onClick={() => onNavigate('offers')}>
                        {t.discoverDeals}
                    </button>
                </div>
            ) : (
                <div className="orders-table-wrapper card-glass">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>{t.orderId}</th>
                                <th>{currentUser?.role === 'client' ? t.vendor : t.client}</th>
                                <th>{t.total}</th>
                                <th>{t.escrowStatus}</th>
                                <th>{t.orderStatus}</th>
                                <th>{t.createdAt}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const escrow = getEscrowStatus(order);
                                return (
                                    <tr key={order.id}>
                                        <td className="order-id-link" onClick={() => setSelectedOrderId(order.id)}>{order.id.slice(0, 8)}...</td>
                                        <td>{currentUser?.role === 'client' ? order.importatorId : order.clientId}</td>
                                        <td className="total-cell">${order.totalPrice.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-pill escrow-${escrow.key}`}>{escrow.label}</span>
                                        </td>
                                        <td>
                                            <span className={`status-pill order-${getStatusClass(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="view-details-btn" onClick={() => setSelectedOrderId(order.id)}>
                                                {t.viewDetails}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderDetailView = () => {
        if (!selectedOrder) return <div className="loading-state-full"><FiLoader className="animate-spin" /></div>;
        
        const escrow = getEscrowStatus(selectedOrder);
        const progress = selectedOrder.status === 'DELIVERED' ? 100 : selectedOrder.status === 'CREATED' ? 0 : 50;

        return (
            <div className="order-detail-container animate-in">
                <button className="back-btn" onClick={() => setSelectedOrderId(null)}>
                    <BackIcon /> {t.backToOrders}
                </button>
                <div className="order-detail-header">
                    <div className="header-main">
                        <h1>Order #{selectedOrder.id.slice(0, 8)}</h1>
                        <p>{t.createdOn} {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="header-status">
                        <span className={`status-pill escrow-${escrow.key}`}>
                            {t.escrowStatus}: {escrow.label}
                        </span>
                        <span className={`status-pill order-${getStatusClass(selectedOrder.status)}`}>
                            {selectedOrder.status}
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
                                            <h4>{item.productName}</h4>
                                            <p>${item.unitPrice} × {item.quantity}</p>
                                        </div>
                                        <div className="item-price">${(item.unitPrice * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="total-row">
                                <span>{t.total}</span>
                                <span className="total-amount">${selectedOrder.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="shipment-proof-card card-glass">
                            <h3>{t.shipmentProof}</h3>
                            {selectedOrder.shipmentProofUrl ? (
                                <div className="proof-content">
                                    <img src={selectedOrder.shipmentProofUrl} alt="Shipment Proof" className="proof-preview" />
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon"><FiPackage /></div>
                                    <p>{t.noShipmentDocs}</p>
                                    {currentUser?.role === 'importator' && selectedOrder.status === 'PAID' && (
                                        <Button variant="primary" className="btn-small-width" onClick={() => setIsMarkShippedOpen(true)}>
                                            {t.markAsShipped}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="detail-sidebar-column">
                        <div className="escrow-details-card card-glass">
                            <h3>{t.escrowDetails}</h3>
                            <div className="escrow-stats">
                                <div className="escrow-stat">
                                    <label>{t.depositAmount}</label>
                                    <div className="value">${(selectedOrder.totalPrice * 0.5).toLocaleString()}</div>
                                </div>
                                <div className="escrow-stat">
                                    <label>{t.totalHeld}</label>
                                    <div className="value-primary">${selectedOrder.totalPrice.toLocaleString()}</div>
                                </div>
                                <div className="escrow-stat">
                                    <label>{t.releasedAmount}</label>
                                    <div className="value-success">${selectedOrder.status === 'DELIVERED' ? selectedOrder.totalPrice.toLocaleString() : '$0'}</div>
                                </div>
                            </div>
                            <div className="escrow-progress-container">
                                <label>{t.escrowProgress}</label>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
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
                <MarkShippedModal 
                    isOpen={isMarkShippedOpen} 
                    onClose={() => {
                        setIsMarkShippedOpen(false);
                        fetchOrders();
                    }} 
                    orderId={selectedOrder?.id} 
                />
            </div>
        );
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="orders" contentClassName="orders-layout">
            <div className="orders-page-wrapper">
                {selectedOrderId ? renderDetailView() : renderListView()}
            </div>
        </DashboardLayout>
    );
};

export default Orders;
