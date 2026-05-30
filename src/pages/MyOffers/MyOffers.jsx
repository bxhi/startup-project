import React, { useState, useEffect } from 'react';
import './MyOffers.css';
import offerService from '../../api/offerService';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CreateOfferModal from '../../components/CreateOfferModal/CreateOfferModal';
import { FiPlus, FiEdit2, FiEyeOff, FiEye, FiTrash2, FiX, FiCheck, FiLoader, FiImage } from 'react-icons/fi';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ImageViewerModal from '../../components/ImageViewerModal/ImageViewerModal';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';
import { walletApi } from '../../api/api';

const MyOffers = ({ onNavigate }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [editData, setEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const { t, language } = useLanguage();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let vStatus = localStorage.getItem('verificationStatus') || user.status;
    if (vStatus === 'undefined' || vStatus === 'null') vStatus = null;
    const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);
    
    const [viewerState, setViewerState] = useState({ isOpen: false, images: [], index: 0 });

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr || '{}');
            if (user.userId) {
                const response = await offerService.getOffers({ importatorId: user.userId });
                setOffers(response.data || []);
            } else {
                setOffers([]);
            }
        } catch (error) {
            console.error('Failed to fetch offers error details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleToggleNegotiable = async (id, currentStatus) => {
        try {
            const data = new FormData();
            data.append('negociable', !currentStatus);
            await offerService.updateOffer(id, data);
            setOffers(offers.map(offer => offer.offerId === id ? { ...offer, negociable: !currentStatus } : offer));
        } catch (error) {
            console.error('Failed to toggle negotiable:', error);
            toast.error('Failed to toggle negotiable');
        }
    };

    const handleToggleVisibility = async (id, currentStatus) => {
        try {
            const normalizedCurrent = (currentStatus || 'ACTIVE').toUpperCase();
            const newStatus = normalizedCurrent === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
            const data = new FormData();
            data.append('offerStatus', newStatus);
            await offerService.updateOffer(id, data);
            setOffers(offers.map(offer => offer.offerId === id ? { ...offer, offerStatus: newStatus } : offer));
            toast.success(`Offer ${newStatus === 'ACTIVE' ? 'published' : 'hidden'} successfully`);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
            toast.error('Failed to update offer status');
        }
    };

    const handleDeleteOffer = async () => {
        if (!offerToDelete) return;
        try {
            await offerService.deleteOffer(offerToDelete);
            setOffers(offers.filter(offer => offer.offerId !== offerToDelete));
            setShowDeleteModal(false);
            setOfferToDelete(null);
        } catch (error) {
            console.error('Failed to delete offer:', error);
        }
    };

    const confirmDelete = (id) => { setOfferToDelete(id); setShowDeleteModal(true); };
    const handleEditOffer = (offer) => { setEditData(offer); setShowCreateModal(true); };

    const handleCreateOfferClick = async () => {
        if (isPending) {
            toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
            return;
        }
        if (!user.userId) return;
        const toastId = toast.loading(language === 'ar' ? 'جاري التحقق من الرصيد...' : 'Checking credit limits...');
        try {
            const res = await walletApi.get(`/wallet/can-create-offer?userId=${user.userId}`);
            if (res.data && res.data.allowed === false) {
                const errorMsg = language === 'ar'
                    ? 'يرجى ترقية اشتراكك بإحدى الباقات أو شراء نقاط للمتابعة.'
                    : 'Please upgrade with one of the packs or buy points to create a new offer.';
                toast.error(errorMsg, { id: toastId });
                return;
            }
            toast.dismiss(toastId);
            setShowCreateModal(true);
        } catch (err) {
            console.error('Credit limit check failed:', err);
            toast.error(language === 'ar' ? 'فشل التحقق من الرصيد. يرجى المحاولة مجدداً.' : 'Failed to verify credit limit. Please try again.', { id: toastId });
        }
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="offers" contentClassName="orders-layout">
            <div className="my-offers-container">
                <div className="my-offers-header">
                    <div className="header-left">
                        <h1>{t.myOffersTitle}</h1>
                        <p>{t.myOffersSubtitle}</p>
                    </div>
                    <button 
                        className={`btn-create-offer ${isPending ? 'pending-disabled' : ''}`} 
                        onClick={handleCreateOfferClick}
                    >
                        <div className="svg-wrapper"><FiPlus size={22} /></div>
                        <span>{t.createOffer}</span>
                    </button>
                </div>

                <div className="offers-table-card">
                    <table className="offers-table">
                        <thead>
                            <tr>
                                <th>{t.image}</th>
                                <th>{t.title}</th>
                                <th>{t.basePrice}</th>
                                <th>{t.availableQty}</th>
                                <th>{t.origin}</th>
                                <th>{t.negotiable}</th>
                                <th>{t.status}</th>
                                <th>{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <FiLoader className="animate-spin" size={24} />
                                        <p style={{ marginTop: '10px' }}>{t.loadingOffers}</p>
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <p>{t.noOffersFound}</p>
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer) => (
                                    <tr key={offer.offerId}>
                                        <td className="cell-image">
                                            <div 
                                                className="image-stack" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (offer.productImages && offer.productImages.length > 0) {
                                                        setViewerState({ isOpen: true, images: offer.productImages, index: 0 });
                                                    }
                                                }}
                                                style={{ cursor: offer.productImages?.length > 0 ? 'pointer' : 'default' }}
                                                title={offer.productImages?.length > 0 ? t.viewImages : ''}
                                            >
                                                {(offer.productImages || []).slice(0, 3).map((img, idx) => (
                                                    <div key={idx} className="product-image-small" style={{ zIndex: 3 - idx }}>
                                                        <img src={img.url} alt={`${offer.title} ${idx + 1}`} />
                                                    </div>
                                                ))}
                                                {offer.productImages?.length > 3 && (
                                                    <div className="image-stack-more">+{offer.productImages.length - 3}</div>
                                                )}
                                                {(!offer.productImages || offer.productImages.length === 0) && (
                                                    <div className="product-image-small empty"><FiImage /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="cell-title">{offer.title}</td>
                                        <td className="cell-price">${offer.basePrice}</td>
                                        <td className="cell-qty">{offer.quantityAvailable} {t.units}</td>
                                        <td className="cell-origin">{offer.origin}</td>
                                        <td className="cell-negotiable">
                                            <label className={`toggle-switch ${isPending ? 'pending-disabled' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!offer.negociable} 
                                                    onChange={() => !isPending && handleToggleNegotiable(offer.offerId, !!offer.negociable)} 
                                                    disabled={isPending}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </td>
                                        <td className="cell-status">
                                            {(() => {
                                                const rawStatus = offer.offerStatus || 'ACTIVE';
                                                const normalizedStatus = rawStatus.toUpperCase() === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE';
                                                return (
                                                    <span className={`status-badge-modern ${normalizedStatus.toLowerCase()}`}>
                                                        {t[`status${normalizedStatus}`] || normalizedStatus}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="cell-actions">
                                            {(() => {
                                                const rawStatus = offer.offerStatus || 'ACTIVE';
                                                const normalizedStatus = rawStatus.toUpperCase() === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE';
                                                return (
                                                    <div className={`actions-wrapper ${isPending ? 'pending-disabled' : ''}`}>
                                                        <button 
                                                            className="action-btn edit" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (isPending) {
                                                                    toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
                                                                    return;
                                                                }
                                                                handleEditOffer(offer); 
                                                            }}
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button 
                                                            className={`action-btn visibility ${normalizedStatus === 'HIDDEN' ? 'hidden-state' : ''}`} 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (isPending) {
                                                                    toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
                                                                    return;
                                                                }
                                                                handleToggleVisibility(offer.offerId, normalizedStatus); 
                                                            }}
                                                        >
                                                            {normalizedStatus === 'ACTIVE' ? <FiEyeOff /> : <FiEye />}
                                                        </button>
                                                        <button 
                                                            className="action-btn delete" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (isPending) {
                                                                    toast.error(t.pendingActionError || "Verification in progress. Please wait for account approval.");
                                                                    return;
                                                                }
                                                                confirmDelete(offer.offerId); 
                                                            }}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateOfferModal isOpen={showCreateModal} editData={editData} onClose={() => { setShowCreateModal(false); setEditData(null); fetchOffers(); }} />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setOfferToDelete(null); }}
                onConfirm={handleDeleteOffer}
                title={t.deleteOffer}
                message={t.deleteOfferMsg}
                confirmText={t.delete}
                cancelText={t.keepIt}
                type="danger"
            />

            <ImageViewerModal 
                isOpen={viewerState.isOpen}
                images={viewerState.images}
                initialIndex={viewerState.index}
                onClose={() => setViewerState({ isOpen: false, images: [], index: 0 })}
            />
        </DashboardLayout>
    );
};

export default MyOffers;
