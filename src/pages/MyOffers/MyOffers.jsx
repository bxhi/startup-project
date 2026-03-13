import React, { useState, useEffect } from 'react';
import './MyOffers.css';
import offerService from '../../api/offerService';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CreateOfferModal from '../../components/CreateOfferModal/CreateOfferModal';
import { FiPlus, FiEdit2, FiEyeOff, FiTrash2, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const MyOffers = ({ onNavigate }) => {
    console.log('MyOffers component rendering');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [editData, setEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);

    const fetchOffers = async () => {
        console.log('fetchOffers called');
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            console.log('User from localStorage:', userStr);
            const user = JSON.parse(userStr || '{}');
            if (user.userId) {
                console.log('Fetching offers for userId:', user.userId);
                const response = await offerService.getOffers({ importatorId: user.userId });
                console.log('API Response:', response);
                setOffers(response.data || []);
            } else {
                console.warn('No userId found in localStorage user object');
                setOffers([]);
            }
        } catch (error) {
            console.error('Failed to fetch offers error details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleToggleNegotiable = async (id, currentStatus) => {
        try {
            const data = new FormData();
            data.append('negociable', !currentStatus);
            await offerService.updateOffer(id, data);
            
            setOffers(offers.map(offer =>
                offer.offerId === id ? { ...offer, negociable: !currentStatus } : offer
            ));
        } catch (error) {
            console.error('Failed to toggle negotiable:', error);
            alert('Failed to update negotiable status. Please try again.');
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
            alert('Failed to delete offer. Please try again.');
        }
    };

    const confirmDelete = (id) => {
        setOfferToDelete(id);
        setShowDeleteModal(true);
    };

    const handleEditOffer = (offer) => {
        setEditData(offer);
        setShowCreateModal(true);
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="offers" contentClassName="orders-layout">
            <div className="my-offers-container">
                {/* Header outside the card */}
                <div className="my-offers-header">
                    <div className="header-left">
                        <h1>My Offers</h1>
                        <p>Manage your product offerings</p>
                    </div>
                    <button className="btn-create-offer" onClick={() => setShowCreateModal(true)}>
                        <div className="svg-wrapper">
                            <FiPlus size={22} />
                        </div>
                        <span>Create Offer</span>
                    </button>
                </div>

                {/* Table inside its own card */}
                <div className="offers-table-card">
                    <table className="offers-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Base Price</th>
                                <th>Available Qty</th>
                                <th>Origin</th>
                                <th>Negotiable</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <FiLoader className="animate-spin" size={24} />
                                        <p style={{ marginTop: '10px' }}>Loading offers...</p>
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <p>No offers found. Create your first offer!</p>
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
                                        <td className="cell-qty">{offer.quantityAvailable} units</td>
                                        <td className="cell-origin">{offer.origin}</td>
                                        <td className="cell-negotiable">
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={!!offer.negociable}
                                                    onChange={() => handleToggleNegotiable(offer.offerId, !!offer.negociable)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </td>
                                        <td className="cell-status">
                                            {offer.offerStatus && (
                                                <span className={`status-badge-modern ${offer.offerStatus.toLowerCase()}`}>
                                                    {offer.offerStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="cell-actions">
                                            <div className="actions-wrapper">
                                                <button 
                                                    className="action-btn edit" 
                                                    title="Edit"
                                                    onClick={(e) => { e.stopPropagation(); handleEditOffer(offer); }}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button className="action-btn visibility" title="Hide"><FiEyeOff /></button>
                                                <button 
                                                    className="action-btn delete" 
                                                    title="Delete"
                                                    onClick={(e) => { e.stopPropagation(); confirmDelete(offer.offerId); }}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateOfferModal
                isOpen={showCreateModal}
                editData={editData}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditData(null);
                    fetchOffers(); // Refresh list after closing modal
                }}
            />

            <ConfirmationModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setOfferToDelete(null);
                }}
                onConfirm={handleDeleteOffer}
                title="Delete Offer"
                message="Are you sure you want to delete this offer? this action cannot be undone."
                confirmText="Delete"
                cancelText="Keep it"
                type="danger"
            />
        </DashboardLayout>
    );
};

export default MyOffers;
