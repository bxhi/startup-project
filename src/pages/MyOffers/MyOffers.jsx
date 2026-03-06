import React, { useState } from 'react';
import './MyOffers.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiPlus, FiEdit2, FiEyeOff, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';
import leatherJacketsImg from '../../assets/leather_jackets.png';
import electronicComponentsImg from '../../assets/electronic_components.png';

const MyOffers = ({ onNavigate }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [priceNegotiable, setPriceNegotiable] = useState(false);
    const [offers, setOffers] = useState([
        {
            id: 1,
            image: leatherJacketsImg,
            title: 'Premium Leather Jackets',
            basePrice: '€85',
            availableQty: '500 units',
            origin: 'Italy',
            negotiable: true,
            status: 'active'
        },
        {
            id: 2,
            image: electronicComponentsImg,
            title: 'Electronic Components Kit',
            basePrice: '€45',
            availableQty: '1000 units',
            origin: 'China',
            negotiable: false,
            status: 'active'
        }
    ]);

    const handleToggleNegotiable = (id) => {
        setOffers(offers.map(offer =>
            offer.id === id ? { ...offer, negotiable: !offer.negotiable } : offer
        ));
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
                        <FiPlus size={22} /> Create Offer
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
                            {offers.map((offer) => (
                                <tr key={offer.id}>
                                    <td className="cell-image">
                                        <div className="product-image-small">
                                            <img src={offer.image} alt={offer.title} />
                                        </div>
                                    </td>
                                    <td className="cell-title">{offer.title}</td>
                                    <td className="cell-price">{offer.basePrice}</td>
                                    <td className="cell-qty">{offer.availableQty}</td>
                                    <td className="cell-origin">{offer.origin}</td>
                                    <td className="cell-negotiable">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={offer.negotiable}
                                                onChange={() => handleToggleNegotiable(offer.id)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </td>
                                    <td className="cell-status">
                                        <span className={`status-badge-modern ${offer.status}`}>
                                            {offer.status}
                                        </span>
                                    </td>
                                    <td className="cell-actions">
                                        <button className="action-btn edit" title="Edit"><FiEdit2 /></button>
                                        <button className="action-btn visibility" title="Hide"><FiEyeOff /></button>
                                        <button className="action-btn delete" title="Delete"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Offer Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Offer</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Progress Steps */}
                            <div className="step-indicator">
                                {[1, 2, 3].map((s) => {
                                    const labels = ['Product Details', 'Pricing & Quantity', 'Images & Origin'];
                                    const isActive = currentStep === s;
                                    const isCompleted = currentStep > s;
                                    return (
                                        <div key={s} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                            <div className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                                {isCompleted ? <FiCheck /> : s}
                                            </div>
                                            <div className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                                {labels[s - 1]}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Step Content */}
                            {currentStep === 1 && (
                                <div className="step-content">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" placeholder="e.g., Premium Leather Jackets Offer" />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea placeholder="Detailed product description..."></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input type="text" placeholder="e.g., Leather Jacket model X" />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <div className="select-wrapper">
                                            <select>
                                                <option value="" disabled selected>Select category</option>
                                                <option value="fashion">Fashion</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="home">Home & Garden</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="step-content">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Base Price (€)</label>
                                            <input type="text" className="price-input-primary" placeholder="0.00" />
                                        </div>
                                        <div className="form-group">
                                            <label>Available Quantity</label>
                                            <input type="number" placeholder="0" />
                                        </div>
                                    </div>

                                    <div className="negotiable-item" style={{ marginTop: '20px' }}>
                                        <input
                                            type="checkbox"
                                            id="price-negotiable"
                                            checked={priceNegotiable}
                                            onChange={(e) => setPriceNegotiable(e.target.checked)}
                                        />
                                        <label htmlFor="price-negotiable">Price is negotiable</label>
                                    </div>
                                    {priceNegotiable && (
                                        <p className="negotiable-warning">
                                            By selecting this, you agree to receive negotiation requests for this offer.
                                        </p>
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="step-content">
                                    <div className="form-group">
                                        <label>Product Images</label>
                                        <div className="image-upload-wrapper">
                                            <input type="file" multiple accept="image/*" className="file-input" />
                                            <div className="upload-placeholder">
                                                <LuUpload size={24} />
                                                <span>Upload</span>
                                            </div>
                                        </div>
                                        <p className="upload-hint">Upload up to 8 images (120x90 thumbnails)</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Origin Country</label>
                                        <input type="text" placeholder="e.g., Italy, China" />
                                    </div>

                                    <div className="preview-section">
                                        <label className="section-label">Preview</label>
                                        <div className="preview-card">
                                            <div className="preview-image-box">
                                                {/* Placeholder for preview image */}
                                            </div>
                                            <div className="preview-info">
                                                <h4 className="preview-title">Product Name</h4>
                                                <p className="preview-desc">No description</p>
                                                <div className="preview-meta">
                                                    <span className="preview-price">€0.00</span>
                                                    <span className="preview-qty">Min: 0 units</span>
                                                    <span className="preview-origin">Unknown origin</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {currentStep > 1 && (
                                <button className="btn-back" onClick={() => setCurrentStep(prev => prev - 1)}>
                                    Back
                                </button>
                            )}
                            <button
                                className="btn-continue"
                                onClick={() => {
                                    if (currentStep < 3) {
                                        setCurrentStep(prev => prev + 1);
                                    } else {
                                        // Handle publish logic
                                        setShowCreateModal(false);
                                        setCurrentStep(1);
                                    }
                                }}
                            >
                                {currentStep === 3 ? 'Publish offer' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyOffers;
