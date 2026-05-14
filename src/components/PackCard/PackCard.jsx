import React from 'react';
import { FiCheck, FiStar, FiZap, FiBriefcase } from 'react-icons/fi';
import './PackCard.css';

const PackCard = ({ pack, isSelected, onSelect, onPurchase, t }) => {
  const getIcon = (name) => {
    switch (name.toUpperCase()) {
      case 'BASIC': return <FiStar className="pack-icon basic" />;
      case 'PRO': return <FiZap className="pack-icon pro" />;
      case 'BUSINESS': return <FiBriefcase className="pack-icon business" />;
      default: return <FiStar className="pack-icon" />;
    }
  };

  return (
    <div 
      className={`pack-card ${isSelected ? 'selected' : ''} ${pack.type} ${pack.isBestOffer ? 'best-offer' : ''}`}
      onClick={() => onSelect(pack.id)}
    >
      {pack.isBestOffer && (
        <div className="best-offer-badge">
          <FiStar className="badge-icon" />
          <span>{t.bestOffer || 'Best Offer'}</span>
        </div>
      )}
      
      <div className="pack-header">
        <div className="icon-container">
          <div className="icon-glow"></div>
          {getIcon(pack.name)}
        </div>
        <h3 className="pack-name">
          {pack.name}
          {isSelected && <FiCheck className="name-check-icon" />}
        </h3>
        <div className="pack-price">
          <span className="amount">{pack.priceDzd}</span>
          <span className="currency">{t.dzd || 'DZD'}</span>
        </div>
      </div>

      <div className="pack-stats">
        <div className="stat-item">
          <span className="stat-value">{pack.points}</span>
          <span className="stat-label">{t.pts || 'Points'}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-value">{pack.highlightedOffers}</span>
          <span className="stat-label">{t.featured || 'Featured'}</span>
        </div>
      </div>

      <ul className="pack-benefits">
        {pack.otherBenefits.map((benefit, index) => (
          <li key={index}>
            <FiCheck className="check-icon" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {isSelected && (
        <div className="selected-indicator">
          <FiCheck /> {t.selected || 'Selected'}
        </div>
      )}

      <button 
        className="purchase-btn"
        onClick={(e) => {
          e.stopPropagation();
          onPurchase(pack);
        }}
      >
        {t.purchasePack || 'Purchase Pack'}
      </button>
    </div>
  );
};

export default PackCard;
