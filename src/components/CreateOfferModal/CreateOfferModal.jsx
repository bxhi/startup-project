import React, { useState, useRef, useEffect } from 'react';
import LoadingPage from '../LoadingPage/LoadingPage';
import './CreateOfferModal.css';
import { FiX, FiCheck, FiPlus, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { LuUpload } from 'react-icons/lu';
import offerService from '../../api/offerService';
import Checkbox from '../Checkbox/Checkbox';
import { useLanguage } from '../../context/LanguageContext';


const CreateOfferModal = ({ isOpen, onClose, onSuccess, editData }) => {
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        productName: '',
        category: '',
        basePrice: '',
        quantityAvailable: '',
        negociable: false,
        origin: '',
        productImages: [] // Array of File objects or existing image objects
    });

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setCurrentStep(1);
            setShowSuccess(false);

            if (editData) {
                setFormData({
                    title: editData.title || '',
                    description: editData.description || '',
                    productName: editData.productName || '',
                    category: (editData.category || '').toLowerCase(),
                    basePrice: editData.basePrice || '',
                    quantityAvailable: editData.quantityAvailable || '',
                    negociable: editData.negociable || false,
                    origin: editData.origin || '',
                    productImages: [] // We'll handle existing images via previews for now
                });
                if (editData.productImages) {
                    setPreviews(editData.productImages.map(img => img.url));
                }
            } else {
                setFormData({
                    title: '',
                    description: '',
                    productName: '',
                    category: '',
                    basePrice: '',
                    quantityAvailable: '',
                    negociable: false,
                    origin: '',
                    productImages: []
                });
                setPreviews([]);
            }
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const labels = ['Product Details', 'Pricing & Quantity', 'Images & Origin'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setError(null);
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError(null);
        if (files.length + formData.productImages.length > 8) {
            setError(t.errMaxImages);
            return;
        }

        const newFiles = [...formData.productImages, ...files];
        setFormData(prev => ({ ...prev, productImages: newFiles }));

        // Create previews for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.title.trim()) return t.errReqTitle;
            if (!formData.description.trim()) return t.errReqDesc;
            if (!formData.productName.trim()) return t.errReqProdName;
            if (!formData.category) return t.errReqCat;
        } else if (step === 2) {
            if (!formData.basePrice || formData.basePrice <= 0) return t.errReqPrice;
            if (!formData.quantityAvailable || formData.quantityAvailable <= 0) return t.errReqQty;
        } else if (step === 3) {
            // In edit mode, we might already have images even if productImages (new files) is empty
            if (!editData && formData.productImages.length === 0 && previews.length === 0) return t.errReqImages;
            if (!formData.origin.trim()) return t.errReqOrigin;
        }
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        } else {
            handlePublish();
        }
    };

    const handlePublish = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const data = new FormData();

            // Append basic fields
            data.append('importatorId', user.userId || '');
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('productName', formData.productName);
            data.append('category', formData.category.toUpperCase());

            const formattedPrice = parseFloat(formData.basePrice).toFixed(2);
            data.append('basePrice', formattedPrice);
            data.append('quantityAvailable', formData.quantityAvailable);
            data.append('negociable', formData.negociable ? 'true' : 'false');
            data.append('origin', formData.origin);

            // Append new images if any
            formData.productImages.forEach(file => {
                data.append('productImages', file);
            });

            if (editData) {
                await offerService.updateOffer(editData.offerId, data);
            } else {
                await offerService.createOffer(data);
            }

            setShowSuccess(true);
            // Reset state happens in useEffect on next open or close
        } catch (error) {
            console.error('Failed to publish offer:', error);
            const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
            const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
            setError(finalMessage || t.errPublishOfferGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
        setFormData(prev => ({
            ...prev,
            productImages: prev.productImages.filter((_, i) => i !== indexToRemove)
        }));
    };

    return (
        <>
            {isLoading && <LoadingPage message={editData ? t.updatingOffer : t.publishingOffer} />}
            <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>{editData ? t.editOfferTitle : t.createNewOffer}</h2>
                    <button className="close-btn" onClick={onClose} disabled={isLoading}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {showSuccess ? (
                        <div className="success-view">
                            <div className="success-icon-circle">
                                <FiCheck size={40} />
                            </div>
                            <h3>{editData ? t.offerUpdatedSuccess : t.offerPublishedSuccess}</h3>
                            <p>{editData ? t.offerUpdatedSuccessMsg : t.offerPublishedSuccessMsg}</p>
                            <button className="btn-success-close" onClick={onClose}>
                                {t.done}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Progress Steps */}
                            <div className="step-indicator">
                                {[1, 2, 3].map((s) => {
                                    const stepLabels = [t.basicInfo, t.pricingQuantity, t.mediaOrigin];
                                    const isActive = currentStep === s;
                                    const isCompleted = currentStep > s;
                                    const hasError = !!error && currentStep === s;
                                    return (
                                        <div key={s} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`}>
                                            <div className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'error' : ''}`}>
                                                {hasError ? (
                                                    <FiAlertCircle />
                                                ) : isCompleted ? (
                                                    <FiCheck />
                                                ) : (
                                                    s
                                                )}
                                            </div>
                                            <div className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${hasError ? 'error' : ''}`}>
                                                {stepLabels[s - 1]}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Step Content */}
                            {currentStep === 1 && (
                                <div className="step-content">
                                    <div className="form-group">
                                        <label>{t.titleLabel}</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder={t.titlePlaceholder}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.descriptionLabel}</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder={t.descriptionPlaceholder}
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>{t.productNameLabel}</label>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleInputChange}
                                            placeholder={t.productNamePlaceholder}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t.categoryLabel}</label>
                                        <div className="select-wrapper">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            >
                                                <option value="" disabled>{t.selectCategory}</option>
                                                <option value="fashion">{t.fashion}</option>
                                                <option value="electronics">{t.electronicsCat}</option>
                                                <option value="home">{t.homeGarden}</option>
                                                <option value="automotive">{t.automotive}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="step-content">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{t.basePriceLabel}</label>
                                            <input
                                                type="number"
                                                name="basePrice"
                                                value={formData.basePrice}
                                                onChange={handleInputChange}
                                                className="price-input-black"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>{t.availableQtyLabel}</label>
                                            <input
                                                type="number"
                                                name="quantityAvailable"
                                                value={formData.quantityAvailable}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="negotiable-item" style={{ marginTop: '20px' }}>
                                        <Checkbox
                                            id="modal-price-negotiable"
                                            label={t.priceNegotiable}
                                            name="negociable"
                                            checked={formData.negociable}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formData.negociable && (
                                        <p className="negotiable-warning" style={{ marginTop: '10px', color: '#64748b', fontSize: '0.85rem' }}>
                                            {t.negotiableAgreeMsg}
                                        </p>
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="step-content">
                                    <div className="form-group">
                                        <label>{t.productImages}</label>
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <div className="image-upload-wrapper" onClick={() => fileInputRef.current?.click()}>
                                            <div className="upload-placeholder">
                                                <LuUpload size={24} />
                                                <span>{t.upload}</span>
                                            </div>
                                        </div>
                                        <p className="upload-hint">{t.uploadHint} ({formData.productImages.length} {t.selected})</p>

                                        {previews.length > 0 && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                                                {previews.map((src, i) => (
                                                    <div key={i} style={{ position: 'relative' }}>
                                                        <img src={src} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: -5,
                                                                right: -5,
                                                                background: 'rgba(0,0,0,0.6)',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                width: '20px',
                                                                height: '20px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            <FiX size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>{t.originCountry}</label>
                                        <input
                                            type="text"
                                            name="origin"
                                            value={formData.origin}
                                            onChange={handleInputChange}
                                            placeholder={t.originPlaceholder}
                                        />
                                    </div>

                                    <div className="preview-section">
                                        <label className="section-label" style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>{t.preview}</label>
                                        <div className="preview-card">
                                            <div className="preview-image-box" style={{ overflow: 'hidden' }}>
                                                {previews[0] ? <img src={previews[0]} alt="main-preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                            </div>
                                            <div className="preview-info">
                                                <h4 className="preview-title">{formData.productName || t.productNameLabel}</h4>
                                                <p className="preview-desc" style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>{formData.description ? formData.description.substring(0, 40) + '...' : t.noDescription}</p>
                                                <div className="preview-meta" style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    <span className="preview-price" style={{ color: '#000', fontWeight: '700' }}>${formData.basePrice || '0.00'}</span>
                                                    <span className="preview-qty">{t.qty}: {formData.quantityAvailable || '0'}</span>
                                                    <span className="preview-origin">{formData.origin || t.origin}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {error && (
                    <div className="modal-error-alert">
                        <FiAlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {!showSuccess && (
                    <div className="modal-footer">
                        {currentStep > 1 && (
                            <button className="btn-back" onClick={() => {
                                setError(null);
                                setCurrentStep(prev => prev - 1);
                            }} disabled={isLoading}>
                                {t.backButton}
                            </button>
                        )}
                        <button
                            className={currentStep === 3 ? "btn-fly" : "btn-continue"}
                            disabled={isLoading}
                            onClick={handleNext}
                        >
                            {isLoading ? (
                                <div className="premium-spinner" />
                            ) : currentStep === 3 ? (
                                <>
                                    <div className="svg-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                            <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                                        </svg>
                                    </div>
                                    <span>{editData ? t.updateOffer : t.publishOffer}</span>
                                </>
                            ) : (
                                t.continue
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );

};

export default CreateOfferModal;
