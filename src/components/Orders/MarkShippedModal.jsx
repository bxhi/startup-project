import React, { useState } from 'react';
import './MarkShippedModal.css';
import { FiX, FiUpload, FiChevronDown, FiLoader } from 'react-icons/fi';
import Button from '../Button/Button';
import { orderService } from '../../api/orderService';
import { useLanguage } from '../../context/LanguageContext';

const MarkShippedModal = ({ isOpen, onClose, orderId }) => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingProvider, setShippingProvider] = useState('DHL');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!trackingNumber) {
            setError('Tracking number is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Update status to SHIPPED
            await orderService.updateStatus(orderId, 'ship');
            
            // 2. Save tracking details
            await orderService.updateOrder(orderId, {
                trackingNumber,
                shippingProvider,
                // notes could be added to entity later if needed
            });

            onClose();
        } catch (err) {
            console.error('Error confirming shipment:', err);
            setError('Failed to confirm shipment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="shipment-modal-content animate-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t.markAsShipped} - {orderId?.slice(0, 8)}</h3>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="modal-error-message">{error}</div>}
                    
                    <div className="form-group">
                        <label>{t.trackingNumber || 'Tracking Number'}</label>
                        <input 
                            type="text" 
                            placeholder="Enter shipment tracking number" 
                            className="form-input" 
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t.shippingProvider || 'Shipping Provider'}</label>
                        <div className="select-wrapper">
                            <select 
                                className="form-select" 
                                value={shippingProvider}
                                onChange={(e) => setShippingProvider(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option>DHL</option>
                                <option>FedEx</option>
                                <option>UPS</option>
                                <option>Other</option>
                            </select>
                            <FiChevronDown className="select-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t.shipmentProof || 'Shipment Proof'} (Images/PDF)</label>
                        <div className="upload-area">
                            <FiUpload className="upload-icon" />
                            <p>{t.uploadShipmentProof || 'Click to upload shipment proof'}</p>
                            <span>Supported: Images, PDF (Max 10MB)</span>
                            <input type="file" className="file-input" hidden />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t.notes || 'Notes'} ({t.optional || 'Optional'})</label>
                        <textarea 
                            placeholder="Additional shipping information..." 
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isSubmitting}
                        ></textarea>
                    </div>
                </div>

                <div className="modal-footer">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t.cancel}</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <><FiLoader className="animate-spin" /> {t.processing}...</> : t.confirmShipment || 'Confirm Shipment'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MarkShippedModal;
