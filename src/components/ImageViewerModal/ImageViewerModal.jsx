import React, { useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import './ImageViewerModal.css';

const ImageViewerModal = ({ images, initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialIndex]);

    const handleNext = useCallback((e) => {
        e?.stopPropagation();
        if (currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, images.length]);

    const handlePrev = useCallback((e) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, onClose]);

    if (!isOpen || !images || images.length === 0) return null;

    return (
        <div className="image-viewer-overlay" onClick={onClose}>
            <button className="image-viewer-close" onClick={onClose}>
                <FiX />
            </button>
            
            {images.length > 1 && (
                <button 
                    className="viewer-nav-btn prev" 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <FiChevronLeft />
                </button>
            )}

            <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
                <img 
                    key={currentIndex} // forces re-render/animation on change
                    src={images[currentIndex].url || images[currentIndex]} 
                    alt={`Preview ${currentIndex + 1}`} 
                    className="image-viewer-image" 
                />
            </div>

            {images.length > 1 && (
                <button 
                    className="viewer-nav-btn next" 
                    onClick={handleNext}
                    disabled={currentIndex === images.length - 1}
                >
                    <FiChevronRight />
                </button>
            )}

            {images.length > 1 && (
                <div className="viewer-counter">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageViewerModal;
