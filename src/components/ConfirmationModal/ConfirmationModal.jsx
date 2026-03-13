import React from 'react';
import './ConfirmationModal.css';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="conf-modal-overlay" onClick={onClose}>
            <div className="conf-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="conf-modal-header">
                    <div className={`conf-icon-circle ${type}`}>
                        <FiAlertTriangle size={24} />
                    </div>
                    <button className="conf-close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <div className="conf-modal-body">
                    <h3>{title || 'Are you sure?'}</h3>
                    <p>{message || 'This action cannot be undone.'}</p>
                </div>
                <div className="conf-modal-footer">
                    <button className="conf-btn-cancel" onClick={onClose}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button className={`conf-btn-confirm ${type}`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
