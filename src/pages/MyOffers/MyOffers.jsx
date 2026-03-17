import React, { useState, useEffect } from 'react';
import './MyOffers.css';
import offerService from '../../api/offerService';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CreateOfferModal from '../../components/CreateOfferModal/CreateOfferModal';
import { FiPlus, FiEdit2, FiEyeOff, FiTrash2, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { useLanguage } from '../../context/LanguageContext';

const MyOffers = ({ onNavigate }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [editData, setEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const { t } = useLanguage();

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

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="offers" contentClassName="orders-layout">
            <div className="my-offers-container">
                <div className="my-offers-header">
                    <div className="header-left">
                        <h1>{t.myOffersTitle}</h1>
                        <p>{t.myOffersSubtitle}</p>
                    </div>
                    <button className="btn-create-offer" onClick={() => setShowCreateModal(true)}>
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
                                            <div className="image-stack">
                                                {(offer.productImages || []).slice(0, 3).map((img, idx) => (
                                                    <div key={idx} className="product-image-small" style={{ zIndex: 3 - idx }}>
                                                        <img src={img.url} alt={`${offer.title} ${idx + 1}`} />
                                                    </div>
                                                ))}
                                                {offer.productImages?.length > 3 && (
                                                    <div className="image-stack-more">+{offer.productImages.length - 3}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="cell-title">{offer.title}</td>
                                        <td className="cell-price">${offer.basePrice}</td>
                                        <td className="cell-qty">{offer.quantityAvailable} {t.units}</td>
                                        <td className="cell-origin">{offer.origin}</td>
                                        <td className="cell-negotiable">
                                            <label className="toggle-switch">
                                                <input type="checkbox" checked={!!offer.negociable} onChange={() => handleToggleNegotiable(offer.offerId, !!offer.negociable)} />
                                                <span className="slider round"></span>
                                            </label>
                                        </td>
                                        <td className="cell-status">
                                            {offer.offerStatus && (
                                                <span className={`status-badge-modern ${offer.offerStatus.toLowerCase()}`}>
                                                    {t[`status${offer.offerStatus}`] || offer.offerStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="cell-actions">
                                            <div className="actions-wrapper">
                                                <button className="action-btn edit" title={t.editOfferTitle} onClick={(e) => { e.stopPropagation(); handleEditOffer(offer); }}><FiEdit2 /></button>
                                                <button className="action-btn visibility" title={t.hide}><FiEyeOff /></button>
                                                <button className="action-btn delete" title={t.delete} onClick={(e) => { e.stopPropagation(); confirmDelete(offer.offerId); }}><FiTrash2 /></button>
                                            </div>
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
        </DashboardLayout>
    );
};

export default MyOffers;
