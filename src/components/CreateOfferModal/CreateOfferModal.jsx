import React, { useState } from 'react';
import './CreateOfferModal.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Checkbox from '../Checkbox/Checkbox';
import { FiX, FiCheckCircle, FiUpload, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const CreateOfferModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        productName: '',
        category: '',
        basePrice: '',
        quantity: '',
        isNegotiable: false,
        origin: '',
        images: []
    });

    if (!isOpen) return null;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderStepIndicator = () => (
        <div className="modal-steps">
            {[1, 2, 3].map(s => (
                <div key={s} className={`modal-step-item ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                    <div className="step-circle">{step > s ? <FiCheckCircle /> : s}</div>
                    <span className="step-label">{s === 1 ? 'Basic' : s === 2 ? 'Pricing' : 'Media'}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container glass-morphism" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="login-title" style={{ fontSize: '1.8rem', margin: 0 }}>create offer</h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                {renderStepIndicator()}

                <div className="modal-body">
                    {step === 1 && (
                        <div className="step-content animate-in">
                            <div className="step-section-header">
                                <h3 className="section-title">Product Details</h3>
                                <p className="section-subtitle">Basic information about your offer</p>
                            </div>
                           
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content animate-in">
                            <div className="inputs-grid">
                                <Input
                                    label="Base Price ($)"
                                    type="number"
                                    placeholder="00.00"
                                    value={formData.basePrice}
                                    onChange={e => handleChange('basePrice', e.target.value)}
                                />
                                <Input
                                    label="Available Quantity"
                                    type="number"
                                    placeholder="Enter units"
                                    value={formData.quantity}
                                    onChange={e => handleChange('quantity', e.target.value)}
                                />
                            </div>
                            <div className="negotiable-wrap">
                                <Checkbox
                                    label="Price is Negotiable"
                                    checked={formData.isNegotiable}
                                    onChange={e => handleChange('isNegotiable', e.target.checked)}
                                />
                                <p className="help-text">Allow buyers to send proposals with different prices.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content animate-in">
                            <div className="file-upload-zone">
                                <FiUpload className="upload-icon" />
                                <p>Drag and drop or <span>browse</span></p>
                                <span className="small-text">Support JPEG, PNG up to 10MB</span>
                            </div>
                            <Input
                                label="Product Origin"
                                placeholder="e.g. Italy, Brazil..."
                                value={formData.origin}
                                onChange={e => handleChange('origin', e.target.value)}
                            />

                            <div className="preview-summary">
                                <h3>Offer Preview</h3>
                                <div className="preview-card">
                                    <p><strong>Title:</strong> {formData.title || 'N/A'}</p>
                                    <p><strong>Price:</strong> ${formData.basePrice || '0.00'}</p>
                                    <p><strong>Qty:</strong> {formData.quantity || '0'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 1 && (
                        <Button variant="outline" onClick={handleBack}>
                            <FiArrowLeft /> Back
                        </Button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        {step < 3 ? (
                            <Button onClick={handleNext}>
                                Continue <FiArrowRight />
                            </Button>
                        ) : (
                            <Button onClick={onClose} variant="primary">
                                Publish Offer <FiCheckCircle />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOfferModal;
