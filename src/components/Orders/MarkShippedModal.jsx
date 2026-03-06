import React from 'react';
import './MarkShippedModal.css';
import { FiX, FiUpload, FiChevronDown } from 'react-icons/fi';
import Button from '../Button/Button';

const MarkShippedModal = ({ isOpen, onClose, orderId }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="shipment-modal-content animate-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Mark as Shipped - {orderId}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Tracking Number</label>
                        <input type="text" placeholder="Enter shipment tracking number" className="form-input" />
                    </div>

                    <div className="form-group">
                        <label>Shipping Provider</label>
                        <div className="select-wrapper">
                            <select className="form-select">
                                <option>DHL</option>
                                <option>FedEx</option>
                                <option>UPS</option>
                                <option>Other</option>
                            </select>
                            <FiChevronDown className="select-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Shipment Proof (Images/PDF)</label>
                        <div className="upload-area">
                            <FiUpload className="upload-icon" />
                            <p>Click to upload shipment proof</p>
                            <span>Supported: Images, PDF (Max 10MB)</span>
                            <input type="file" className="file-input" hidden />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea placeholder="Additional shipping information..." className="form-textarea"></textarea>
                    </div>
                </div>

                <div className="modal-footer">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={onClose}>Confirm Shipment</Button>
                </div>
            </div>
        </div>
    );
};

export default MarkShippedModal;
