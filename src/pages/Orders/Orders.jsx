import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Orders.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiShoppingCart, FiChevronLeft, FiBox, FiMessageCircle, FiUpload, FiPackage, FiPlay, FiChevronRight, FiLoader, FiAlertCircle, FiCheck, FiCamera, FiEye, FiVideo } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../api/orderService';
import { uploadToCloudinary } from '../../api/uploadService';
import { toast } from 'react-hot-toast';

const ORDER_STEPS = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = ({ onNavigate }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState(null);
    const { t, dir } = useLanguage();
    const fileInputRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isImporter = currentUser?.role === 'importator' || currentUser?.role === 'importer';

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
            setOrders(response.data.data || response.data || []);
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
            case 'SHIPPED':
                return 'processing';
            default: return 'processing';
        }
    };

    const getEscrowStatus = (order) => {
        if (order.status === 'DELIVERED') return { key: 'released', label: t.escrowReleased || 'Released' };
        return { key: 'held', label: t.escrowHeld || 'Held in Escrow' };
    };

    const handleConfirmOrder = async (withReceipt = false) => {
        setIsConfirming(true);
        try {
            await orderService.updateStatus(selectedOrder.id, 'confirm');
            toast.success(withReceipt ? "Order confirmed with receipt!" : "Order confirmed without receipt!");
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            toast.error("Failed to confirm order.");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleUploadShipmentProof = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading("Uploading shipment proof...");
        try {
            const secureUrl = await uploadToCloudinary(file);
            await orderService.uploadShipmentProof(selectedOrder.id, secureUrl);
            await orderService.updateStatus(selectedOrder.id, 'ship'); // Move to shipped
            toast.success("Shipment proof uploaded and order shipped!", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload shipment proof.", { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleMarkVideoSeen = async () => {
        try {
            await orderService.updateOrder(selectedOrder.id, { clientVideoSeen: true });
            setSelectedOrder({ ...selectedOrder, clientVideoSeen: true });
            toast.success("Client unboxing video marked as seen.");
        } catch (err) {
            toast.error("Failed to mark video as seen.");
        }
    };

    const BackIcon = dir === 'rtl' ? FiChevronRight : FiChevronLeft;

    const renderListView = () => (
        <div className="orders-list-container">
            <div className="orders-header">
                <h1>{t.ordersTitle || 'Orders'}</h1>
                <p>{t.ordersSubtitle || 'Manage and track your orders'}</p>
            </div>
            {isLoading ? (
                <div className="loading-state-full"><FiLoader className="animate-spin" /> {t.loading || 'Loading...'}</div>
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
                    <p>{t.noOrdersMsg || "You don't have any active orders right now."}</p>
                    <button className="btn-discover" onClick={() => onNavigate('offers')}>
                        {t.discoverDeals || 'Discover Deals'}
                    </button>
                </div>
            ) : (
                <div className="orders-table-wrapper card-glass">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>{t.orderId || 'Order ID'}</th>
                                <th>{currentUser?.role === 'client' ? (t.vendor || 'Vendor') : (t.client || 'Client')}</th>
                                <th>{t.total || 'Total'}</th>
                                <th>{t.orderStatus || 'Status'}</th>
                                <th>{t.createdAt || 'Created At'}</th>
                                <th>{t.actions || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                return (
                                    <tr key={order.id}>
                                        <td className="order-id-link" onClick={() => setSelectedOrderId(order.id)}>{order.id.slice(0, 8)}...</td>
                                        <td>{currentUser?.role === 'client' ? order.importatorId : order.clientId}</td>
                                        <td className="total-cell">${order.totalPrice?.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-pill order-${getStatusClass(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="view-details-btn" onClick={() => setSelectedOrderId(order.id)}>
                                                {t.viewDetails || 'View Details'}
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

    const renderTimeline = (currentStatus) => {
        if (currentStatus === 'CANCELLED') {
             return (
                 <div className="order-timeline-container cancelled card-glass animate-in">
                     <div className="timeline-cancelled-msg">
                         <FiAlertCircle size={24} />
                         <span>This order was Cancelled</span>
                     </div>
                 </div>
             );
        }
        
        let currentIndex = ORDER_STEPS.indexOf(currentStatus);
        if (currentIndex === -1) currentIndex = 0; // fallback
        
        return (
            <div className="order-timeline-container card-glass animate-in">
                 <div className="timeline-steps">
                     {ORDER_STEPS.map((step, index) => {
                          const isActive = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          return (
                               <div key={step} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                                   <div className="step-indicator-wrapper">
                                       <div className="step-indicator">
                                           {isActive ? <FiCheck /> : <div className="step-dot" />}
                                       </div>
                                       {isCurrent && <div className="step-pulse" />}
                                   </div>
                                   <div className="step-label">{step}</div>
                                   {index < ORDER_STEPS.length - 1 && <div className={`step-connector ${index < currentIndex ? 'active' : ''}`} />}
                               </div>
                          );
                     })}
                 </div>
            </div>
        );
    };

    const renderDetailView = () => {
        if (!selectedOrder) return <div className="loading-state-full"><FiLoader className="animate-spin" /></div>;
        
        return (
            <div className="order-detail-container animate-in">
                <button className="back-btn" onClick={() => setSelectedOrderId(null)}>
                    <BackIcon /> {t.backToOrders || 'Back to Orders'}
                </button>
                
                <div className="order-detail-header">
                    <div className="header-main">
                        <h1>Order #{selectedOrder.id.slice(0, 8)}</h1>
                        <p>{t.createdOn || 'Created on'} {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="header-status">
                        <span className={`status-pill order-${getStatusClass(selectedOrder.status)}`}>
                            {selectedOrder.status}
                        </span>
                    </div>
                </div>

                {renderTimeline(selectedOrder.status)}

                {/* Dynamic Action Box based on Status */}
                {isImporter && selectedOrder.status === 'CREATED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon"><FiBox /></div>
                            <div className="action-box-text">
                                <h3>Deposit Receipt Verification</h3>
                                {selectedOrder.depositReceiptUrl ? (
                                    <div className="receipt-viewer">
                                        <p className="success-text">Client has uploaded a deposit receipt.</p>
                                        <img src={selectedOrder.depositReceiptUrl} alt="Deposit Receipt" className="proof-preview" />
                                        <Button variant="primary" onClick={() => handleConfirmOrder(true)} disabled={isConfirming}>
                                            {isConfirming ? <FiLoader className="animate-spin"/> : 'Confirm Order'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="receipt-missing">
                                        <p className="warning-text">The client still hasn't sent the deposit receipt yet.</p>
                                        <p>Do you want to continue and confirm the order anyway?</p>
                                        <div className="action-buttons-row">
                                            <Button variant="primary" onClick={() => handleConfirmOrder(false)} disabled={isConfirming}>
                                                {isConfirming ? <FiLoader className="animate-spin"/> : 'Confirm Without Receipt'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isImporter && selectedOrder.status === 'CONFIRMED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon primary"><FiPackage /></div>
                            <div className="action-box-text">
                                <h3>Upload Shipment Proof</h3>
                                <p>Please provide proof that the product has been shipped to move the order to SHIPPED status.</p>
                                <div className="upload-zone-premium" onClick={() => !isUploading && fileInputRef.current?.click()}>
                                    {isUploading ? (
                                        <div className="uploading-state">
                                            <FiLoader className="animate-spin icon-large" />
                                            <span>Uploading securely to Cloudinary...</span>
                                        </div>
                                    ) : (
                                        <div className="upload-prompt">
                                            <div className="upload-icons">
                                                <FiUpload className="icon-main" />
                                                <FiCamera className="icon-sub" />
                                            </div>
                                            <span>Click to upload image or take a photo</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        ref={fileInputRef} 
                                        style={{display: 'none'}} 
                                        onChange={handleUploadShipmentProof}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isImporter && selectedOrder.status === 'SHIPPED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon success"><FiVideo /></div>
                            <div className="action-box-text">
                                <h3>Client Unboxing Video</h3>
                                {selectedOrder.clientVideoUrl ? (
                                    <div className="video-viewer">
                                        <p>The client has uploaded an unboxing video to confirm delivery condition.</p>
                                        <div className="video-player-mock">
                                            <FiPlay className="play-icon" />
                                            <span>{selectedOrder.clientVideoUrl}</span>
                                        </div>
                                        {!selectedOrder.clientVideoSeen && (
                                            <Button variant="primary" onClick={handleMarkVideoSeen} className="mt-4">
                                                <FiEye /> Mark as Seen
                                            </Button>
                                        )}
                                        {selectedOrder.clientVideoSeen && (
                                            <p className="success-text mt-2"><FiCheck /> Video marked as seen.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="waiting-text">Waiting for the client to upload their unboxing video...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="order-detail-grid">
                    <div className="detail-main-column">
                        <div className="order-items-card card-glass">
                            <h3>{t.orderItems || 'Order Items'}</h3>
                            <div className="items-list">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="order-item">
                                        <div className="item-info">
                                            <h4>{item.productName || 'Product'}</h4>
                                            <p>${item.unitPrice} × {item.quantity}</p>
                                        </div>
                                        <div className="item-price">${(item.unitPrice * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="total-row">
                                <span>{t.total || 'Total'}</span>
                                <span className="total-amount">${selectedOrder.totalPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="detail-sidebar-column">
                        <div className="shipment-proof-card card-glass">
                            <h3>{t.shipmentProof || 'Shipment Proof'}</h3>
                            {selectedOrder.shippingProove ? (
                                <div className="proof-content">
                                    <a href={selectedOrder.shippingProove} target="_blank" rel="noreferrer">
                                        <img src={selectedOrder.shippingProove} alt="Shipment Proof" className="proof-preview" />
                                    </a>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon"><FiPackage /></div>
                                    <p>No shipment proof uploaded yet.</p>
                                </div>
                            )}
                        </div>
                        <div className="actions-card card-glass">
                            <h3>{t.actionsCard || 'Actions'}</h3>
                            <button className="btn-action-animated full-width">
                                <FiMessageCircle /> {t.contactClient || 'Contact Client'}
                            </button>
                        </div>
                    </div>
                </div>
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
