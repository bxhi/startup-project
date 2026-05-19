import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Orders.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiShoppingCart, FiChevronLeft, FiBox, FiMessageCircle, FiUpload, FiPackage, FiPlay, FiChevronRight, FiLoader, FiAlertCircle, FiCheck, FiCamera, FiEye, FiVideo } from 'react-icons/fi';
import Button from '../../components/Button/Button';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../api/orderService';
import { negotiationService } from '../../api/negotiationService';
import { uploadToCloudinary } from '../../api/uploadService';
import { toast } from 'react-hot-toast';

const ORDER_STEPS = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = ({ onNavigate, preselectedOrderId, clearPreselectedOrder }) => {
    const [orders, setOrders] = useState([]);
    const [namingMap, setNamingMap] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState(null);
    const { t, dir } = useLanguage();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (preselectedOrderId) {
            setSelectedOrderId(preselectedOrderId);
            clearPreselectedOrder?.();
        }
    }, [preselectedOrderId, clearPreselectedOrder]);

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

            // Simultaneously fetch orders and negotiations to build a robust local username mapping
            const [ordersResponse, negsResponse] = await Promise.all([
                orderService.getOrders(params),
                negotiationService.getNegotiations(params).catch(err => {
                    console.warn("Failed to load negotiations for naming map:", err);
                    return { data: [] };
                })
            ]);

            const fetchedOrders = ordersResponse.data?.data || ordersResponse.data || [];
            const fetchedNegs = negsResponse?.data || negsResponse || [];

            // Build naming map using stored negotiations (where names are present)
            const namesMap = {};
            fetchedNegs.forEach(neg => {
                if (neg.clientId && neg.clientName) {
                    namesMap[neg.clientId] = neg.clientName;
                }
                if (neg.importatorId && neg.importatorName) {
                    namesMap[neg.importatorId] = neg.importatorName;
                }
            });

            // Add the current user's profile metadata
            if (currentUser?.userId) {
                namesMap[currentUser.userId] = currentUser.businessName || currentUser.username || currentUser.fullName || 'Me';
            }

            setNamingMap(namesMap);
            setOrders(fetchedOrders);
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
        return status ? status.toLowerCase() : 'unknown';
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
            toast.success("Shipment proof uploaded successfully!", { id: toastId });
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

    const handleRemoveShipmentProof = async () => {
        setIsUploading(true);
        const toastId = toast.loading("Removing shipment proof...");
        try {
            await orderService.uploadShipmentProof(selectedOrder.id, "");
            toast.success("Shipment proof removed.", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove shipment proof.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFinalizeShipment = async () => {
        setIsUploading(true);
        const toastId = toast.loading("Finalizing shipment...");
        try {
            await orderService.updateStatus(selectedOrder.id, 'ship');
            toast.success("Order status updated to SHIPPED!", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to finalize shipment status.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleMarkAsDelivered = async () => {
        setIsUploading(true);
        const toastId = toast.loading("Marking order as delivered...");
        try {
            await orderService.updateStatus(selectedOrder.id, 'deliver');
            toast.success("Order marked as DELIVERED!", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to mark order as delivered.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadDepositReceipt = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading("Uploading deposit receipt...");
        try {
            const secureUrl = await uploadToCloudinary(file);
            await orderService.updateOrder(selectedOrder.id, { depositReceiptUrl: secureUrl });
            toast.success("Deposit receipt uploaded successfully!", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload deposit receipt.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadUnboxingVideo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading("Uploading unboxing video...");
        try {
            const secureUrl = await uploadToCloudinary(file);
            await orderService.updateOrder(selectedOrder.id, { clientVideoUrl: secureUrl });
            toast.success("Unboxing video uploaded successfully!", { id: toastId });
            const response = await orderService.getOrder(selectedOrderId);
            setSelectedOrder(response.data);
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload unboxing video.", { id: toastId });
        } finally {
            setIsUploading(false);
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

    const getUserDisplayName = (id) => {
        if (!id) return '—';
        if (namingMap[id]) return namingMap[id];
        if (id === currentUser?.userId) {
            return currentUser.businessName || currentUser.username || currentUser.fullName || 'Me';
        }
        return `User (${id.slice(0, 8)})`;
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
                    <p>{t.noOrdersMsg || "No orders found yet. Start browsing deals to make your first trade!"}</p>
                    <button className="btn-discover" onClick={() => onNavigate('negotiations')}>
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
                                        <td className="party-name-td">{getUserDisplayName(currentUser?.role === 'client' ? order.importatorId : order.clientId)}</td>
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
    ); const renderTimeline = (currentStatus) => {
        if (currentStatus === 'CANCELLED') {
            return (
                <div className="order-timeline-vertical cancelled animate-in">
                    <div className="cancelled-pulse-ring">
                        <FiAlertCircle size={28} />
                    </div>
                    <div className="cancelled-text-block">
                        <h4>{dir === 'rtl' ? 'الطلب ملغي' : 'Order System Offline'}</h4>
                        <p>{dir === 'rtl' ? 'تم إلغاء معالجة هذا الطلب' : 'This order logistics flow has been terminated.'}</p>
                    </div>
                </div>
            );
        }

        let currentIndex = ORDER_STEPS.indexOf(currentStatus);
        if (currentIndex === -1) currentIndex = 0;

        const stepMeta = {
            CREATED: {
                label_en: 'Logistics Core Initialized',
                label_ar: 'بدء النظام اللوجستي',
                desc_en: 'Contract created, waiting for client deposit receipt verification.',
                desc_ar: 'تم إنشاء العقد، بانتظار إيصال الإيداع الخاص بالعميل.',
                icon: FiShoppingCart
            },
            CONFIRMED: {
                label_en: 'Escrow Vault Secured',
                label_ar: 'تأمين حساب الضمان',
                desc_en: 'Platform escrow shielding active. Vendor preparing shipment.',
                desc_ar: 'تم تأمين الضمان المالي. المورد يجهز الشحنة الآن.',
                icon: FiCheck
            },
            SHIPPED: {
                label_en: 'Customs & Transit Protocol',
                label_ar: 'المرور الجمركي والشحن',
                desc_en: 'Cargo processed through checkpoints. Active dispatch tracking.',
                desc_ar: 'تمت معالجة الشحنة. الشحنة قيد النقل والتتبع المباشر.',
                icon: FiPackage
            },
            DELIVERED: {
                label_en: 'Secure Delivery Confirmed',
                label_ar: 'تأكيد التسليم الآمن',
                desc_en: 'Cargo received. Escrow released to vendor vault.',
                desc_ar: 'تم استلام الشحنة وتفريغها. تم تحرير الضمان للبائع.',
                icon: FiBox
            }
        };

        return (
            <div className="vertical-timeline-hud animate-in">
                <div className="hud-title-bar">
                    <div className="radar-ping"></div>
                    <h3>SYSTEM DIAGNOSTICS & LOGS</h3>
                </div>
                <div className="vertical-steps-list">
                    {ORDER_STEPS.map((step, index) => {
                        const isActive = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const meta = stepMeta[step];
                        const displayLabel = dir === 'rtl' ? meta.label_ar : meta.label_en;
                        const displayDesc = dir === 'rtl' ? meta.desc_ar : meta.desc_en;
                        const StepIcon = meta.icon;

                        return (
                            <div key={step} className={`vertical-timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                                <div className="step-left-lane">
                                    <div className="step-icon-wrapper-hud">
                                        <StepIcon size={18} />
                                        {isCurrent && <div className="orbital-ping-glow" />}
                                    </div>
                                    {index < ORDER_STEPS.length - 1 && (
                                        <div className={`vertical-connector-line ${index < currentIndex ? 'completed' : ''}`} />
                                    )}
                                </div>
                                <div className="step-right-lane">
                                    <div className="step-hud-header">
                                        <h4>{displayLabel}</h4>
                                        <span className="step-hud-status-badge">{step}</span>
                                    </div>
                                    <p className="step-hud-desc">{displayDesc}</p>
                                </div>
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
                {/* Holographic Mission Control Header */}
                <div className="holographic-status-hud card-glass">
                    <div className="hud-orbital-ring">
                        <svg className="orbital-svg" viewBox="0 0 100 100">
                            <circle className="orbital-bg" cx="50" cy="50" r="45" />
                            <circle className={`orbital-progress ${selectedOrder.status.toLowerCase()}`} cx="50" cy="50" r="45" />
                        </svg>
                        <div className="orbital-label">
                            <span className="orbital-stage">{dir === 'rtl' ? 'مرحلة النظام' : 'SYSTEM STATE'}</span>
                            <span className="orbital-status-text">{selectedOrder.status === 'CREATED' ? (dir === 'rtl' ? 'تم الإنشاء' : 'CREATED') : selectedOrder.status === 'CONFIRMED' ? (dir === 'rtl' ? 'مؤكد' : 'CONFIRMED') : selectedOrder.status === 'SHIPPED' ? (dir === 'rtl' ? 'تم الشحن' : 'SHIPPED') : selectedOrder.status === 'DELIVERED' ? (dir === 'rtl' ? 'تم التوصيل' : 'DELIVERED') : selectedOrder.status}</span>
                        </div>
                    </div>
                    <div className="hud-details-main">
                        <div className="hud-order-title">
                            <h1>{dir === 'rtl' ? 'معرف الطلب' : 'ORDER_ID'} // {selectedOrder.id.slice(0, 8).toUpperCase()}</h1>
                            <div className="hud-meta-row">
                                <span>{dir === 'rtl' ? 'تاريخ الإنشاء:' : 'SYS_INIT:'} {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                <span>•</span>
                                <span className="secure-channel-tag">{dir === 'rtl' ? 'ضمان آمن' : 'ESCROW PROTECTED'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', direction: dir }}>
                            <button className="back-btn-hud contact" onClick={() => onNavigate('negotiations')}>
                                <FiMessageCircle /> <span>{dir === 'rtl' ? 'التواصل مع ' + (isImporter ? 'العميل' : 'المستورد') : 'Contact ' + (isImporter ? 'Client' : 'Importer')}</span>
                            </button>
                            <button className="back-btn-hud back-deck" onClick={() => setSelectedOrderId(null)}>
                                <BackIcon /> <span>{t.backToOrders || (dir === 'rtl' ? 'الرجوع للوحة' : 'BACK TO DECK')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Action Block based on Status */}
                {selectedOrder.status === 'CREATED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon"><FiBox /></div>
                            <div className="action-box-text">
                                {isImporter ? (
                                    <>
                                        <h3>{dir === 'rtl' ? 'التحقق من إيصال الدفع' : 'Deposit Receipt Verification'}</h3>
                                        {selectedOrder.depositReceiptUrl ? (
                                            <div className="receipt-viewer">
                                                <p className="success-text">{dir === 'rtl' ? 'قام العميل برفع إيصال الدفع.' : 'Client has uploaded a deposit receipt.'}</p>
                                                <img src={selectedOrder.depositReceiptUrl} alt="Deposit Receipt" className="proof-preview" />
                                                <Button variant="primary" onClick={() => handleConfirmOrder(true)} disabled={isConfirming}>
                                                    {isConfirming ? <FiLoader className="animate-spin" /> : (dir === 'rtl' ? 'تأكيد الطلب' : 'Confirm Order')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="receipt-missing">
                                                <p className="warning-text">{dir === 'rtl' ? 'لم يقم العميل بإرسال إيصال الدفع بعد.' : 'The client still hasn\'t sent the deposit receipt yet.'}</p>
                                                <p>{dir === 'rtl' ? 'هل تريد المتابعة وتأكيد الطلب على أي حال؟' : 'Do you want to continue and confirm the order anyway?'}</p>
                                                <div className="action-buttons-row">
                                                    <Button variant="primary" onClick={() => handleConfirmOrder(false)} disabled={isConfirming}>
                                                        {isConfirming ? <FiLoader className="animate-spin" /> : (dir === 'rtl' ? 'تأكيد بدون إيصال' : 'Confirm Without Receipt')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h3>{dir === 'rtl' ? 'تحميل إيصال الإيداع' : 'Upload Deposit Receipt'}</h3>
                                        <p>{dir === 'rtl' ? 'الرجاء تحميل إيصال الدفع الخاص بك لبدء المعاملة.' : 'Please upload your deposit payment receipt to initialize the trade escrow.'}</p>
                                        {selectedOrder.depositReceiptUrl ? (
                                            <div className="receipt-viewer">
                                                <p className="success-text">{dir === 'rtl' ? 'تم رفع الإيصال بنجاح. بانتظار التحقق من المورد.' : 'Deposit receipt uploaded successfully. Waiting for vendor confirmation.'}</p>
                                                <img src={selectedOrder.depositReceiptUrl} alt="Deposit Receipt" className="proof-preview" />
                                            </div>
                                        ) : (
                                            <div className="upload-zone-premium" onClick={() => !isUploading && fileInputRef.current?.click()}>
                                                {isUploading ? (
                                                    <div className="uploading-state">
                                                        <FiLoader className="animate-spin icon-large" />
                                                        <span>Uploading receipt...</span>
                                                    </div>
                                                ) : (
                                                    <div className="upload-prompt">
                                                        <FiUpload className="icon-main" />
                                                        <span>Click to upload deposit receipt</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleUploadDepositReceipt}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon primary"><FiPackage /></div>
                            <div className="action-box-text">
                                {isImporter ? (
                                    <>
                                        <h3>{dir === 'rtl' ? 'إثبات شحن البضائع' : 'Transit & Shipment Proof'}</h3>
                                        <p>{dir === 'rtl' ? 'يرجى تقديم إثبات الشحن لتأكيد إرسال الطلب.' : 'Please provide proof that the cargo has been dispatched. You can view, remove, or change it before final shipment confirmation.'}</p>
                                        
                                        {selectedOrder.shippingProove ? (
                                            <div className="shipment-proof-uploaded-section">
                                                <div className="uploaded-proof-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <img src={selectedOrder.shippingProove} alt="Shipping Proof Preview" className="proof-preview" style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                                                    <div className="uploaded-actions-row" style={{ display: 'flex', gap: '12px' }}>
                                                        <Button variant="secondary" onClick={handleRemoveShipmentProof} disabled={isUploading}>
                                                            {dir === 'rtl' ? 'حذف / إعادة الرفع' : 'Remove Proof'}
                                                        </Button>
                                                        <Button variant="primary" onClick={handleFinalizeShipment} disabled={isUploading}>
                                                            <FiPackage /> {dir === 'rtl' ? 'تأكيد الشحن الفعلي' : 'Finalize & Ship Order'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
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
                                                        <span>Click to upload shipment document</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleUploadShipmentProof}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h3>{dir === 'rtl' ? 'الطلب قيد التحضير للشحن' : 'Shipment Preparation'}</h3>
                                        <p>{dir === 'rtl' ? 'المورد يقوم بتجهيز وتحضير شحنتك حالياً.' : 'The importer is preparing packaging and customs logistics for your shipment.'}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon success"><FiPackage /></div>
                            <div className="action-box-text">
                                {isImporter ? (
                                    <>
                                        <h3>{dir === 'rtl' ? 'تأكيد تسليم الشحنة' : 'Confirm Order Delivery'}</h3>
                                        <p>{dir === 'rtl' ? 'إذا تم تسليم الشحنة بنجاح إلى العميل، يرجى وضع علامة "تم التوصيل" لبدء عملية التحقق بالفيديو.' : 'If the shipment has safely reached the client, please mark the order as delivered to initiate video verification.'}</p>
                                        <Button variant="primary" onClick={handleMarkAsDelivered} disabled={isUploading}>
                                            <FiCheck /> {dir === 'rtl' ? 'تحديد كـ تم التوصيل' : 'Mark as Delivered'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <h3>{dir === 'rtl' ? 'شحنتك في الطريق إليك' : 'Your Shipment is in Transit'}</h3>
                                        <p>{dir === 'rtl' ? 'شحنتك قيد النقل والعبور الآن. بمجرد استلامها، يرجى توثيق فيديو فك التغليف.' : 'The shipment has been dispatched. Please prepare to film an unboxing video once received to claim released escrow.'}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                    <div className="action-box-container card-glass gradient-border animate-in">
                        <div className="action-box-content">
                            <div className="action-box-icon success"><FiVideo /></div>
                            <div className="action-box-text">
                                {isImporter ? (
                                    <>
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
                                                    <p className="success-text mt-2"><FiCheck /> Video marked as seen. Order complete.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="waiting-text">Waiting for the client to upload their unboxing video...</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h3>{dir === 'rtl' ? 'فيديو فك التغليف' : 'Unboxing Video Verification'}</h3>
                                        <p>{dir === 'rtl' ? 'يرجى تحميل فيديو فك التغليف لتأكيد حالة الشحنة المفرغة بنجاح.' : 'Please upload an unboxing video verifying the package contents to close the logistics circle.'}</p>
                                        
                                        {selectedOrder.clientVideoUrl ? (
                                            <div className="video-viewer">
                                                <p className="success-text">{dir === 'rtl' ? 'تم رفع فيديو فك التغليف الخاص بك بنجاح.' : 'Your unboxing video has been submitted successfully.'}</p>
                                                <div className="video-player-mock">
                                                    <FiPlay className="play-icon" />
                                                    <span>{selectedOrder.clientVideoUrl}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-zone-premium" onClick={() => !isUploading && fileInputRef.current?.click()}>
                                                {isUploading ? (
                                                    <div className="uploading-state">
                                                        <FiLoader className="animate-spin icon-large" />
                                                        <span>Uploading video...</span>
                                                    </div>
                                                ) : (
                                                    <div className="upload-prompt">
                                                        <FiVideo className="icon-main" />
                                                        <span>Click to upload unboxing video</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleUploadUnboxingVideo}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mission-control-grid">
                    <div className="control-left-sector">
                        {renderTimeline(selectedOrder.status)}

                        <div className="order-cargo-workspace card-glass animate-in">
                            <h3 className="section-title-premium">
                                {dir === 'rtl' ? 'بيان الشحنة والمخزون' : 'CARGO MANIFEST & INVENTORY'}
                            </h3>
                            <div className="cargo-grid">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="cargo-item-card modular-block animate-zoom-in">
                                        <div className="cargo-card-header">
                                            <span className="cargo-index">
                                                {dir === 'rtl' ? `شحنة #${String(idx + 1).padStart(2, '0')}` : `MANIFEST_ITEM_${String(idx + 1).padStart(2, '0')}`}
                                            </span>
                                            <span className="cargo-badge">
                                                {dir === 'rtl' ? 'مؤمن' : 'SECURED'}
                                            </span>
                                        </div>
                                        <div className="cargo-card-body">
                                            <FiPackage className="cargo-card-icon" />
                                            <div className="cargo-card-details">
                                                <h4>{item.productName || 'Product Name'}</h4>
                                                <div className="cargo-card-meta">
                                                    <span className="meta-price">{item.unitPrice?.toLocaleString()} DZD / {dir === 'rtl' ? 'وحدة' : 'unit'}</span>
                                                    <span className="meta-qty">{dir === 'rtl' ? 'الكمية' : 'QTY'}: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="cargo-card-footer">
                                            <span className="footer-label">{dir === 'rtl' ? 'المجموع الفرعي' : 'SUBTOTAL'}</span>
                                            <span className="footer-price">{(item.unitPrice * item.quantity).toLocaleString()} DZD</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cargo-total-summary card-glass">
                                <div className="summary-left">
                                    <span>{dir === 'rtl' ? 'المجموع المالي الكلي' : 'LOGISTICS GRAND TOTAL'}</span>
                                    <p>{dir === 'rtl' ? 'جميع العناصر تم التحقق منها ومعالجتها بموجب الاتفاقية' : 'All payload assets verified and compiled under platform regulations.'}</p>
                                </div>
                                <div className="summary-right">
                                    <span className="summary-price">{selectedOrder.totalPrice?.toLocaleString()} DZD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="control-right-sector">
                        <div className="order-parties-card card-glass">
                            <h3>{t.orderParties || 'CONTRACT PARTIES'}</h3>
                            <div className="party-details">
                                <div className="party-row">
                                    <span className="party-label">{t.client || 'Client'}</span>
                                    <span className="party-value">{getUserDisplayName(selectedOrder.clientId)}</span>
                                </div>
                                <div className="party-row">
                                    <span className="party-label">{t.vendor || 'Vendor'}</span>
                                    <span className="party-value">{getUserDisplayName(selectedOrder.importatorId)}</span>
                                </div>
                                <div className="party-row-full">
                                    <span className="party-label">{t.deliveryAddress || 'Delivery Address'}</span>
                                    <span className="party-value-address">{selectedOrder.deliveryAddress || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.depositReceiptUrl && (
                            <div className="shipment-proof-card card-glass" style={{ marginBottom: '20px' }}>
                                <h3>{dir === 'rtl' ? 'إيصال الإيداع' : 'DEPOSIT RECEIPT'}</h3>
                                <div className="proof-content">
                                    <a href={selectedOrder.depositReceiptUrl} target="_blank" rel="noreferrer" className="proof-image-link">
                                        <img src={selectedOrder.depositReceiptUrl} alt="Deposit Receipt" className="proof-preview" />
                                        <div className="proof-overlay-hud">
                                            <span>VIEW DOCUMENT</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="shipment-proof-card card-glass">
                            <h3>{t.shipmentProof || 'TRANSIT PROOF'}</h3>
                            {selectedOrder.shippingProove ? (
                                <div className="proof-content">
                                    <a href={selectedOrder.shippingProove} target="_blank" rel="noreferrer" className="proof-image-link">
                                        <img src={selectedOrder.shippingProove} alt="Shipment Proof" className="proof-preview" />
                                        <div className="proof-overlay-hud">
                                            <span>VIEW DOCUMENT</span>
                                        </div>
                                    </a>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon"><FiPackage /></div>
                                    <p>No transit documentation uploaded yet.</p>
                                </div>
                            )}
                        </div>
                        <div className="actions-card card-glass">
                            <h3>{t.actionsCard || 'SYSTEM COMMANDS'}</h3>
                            <button className="btn-action-animated full-width">
                                <FiMessageCircle /> {t.contactClient || 'SECURE COMMS LINK'}
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
