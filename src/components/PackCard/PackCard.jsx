import React from 'react';
import { FiCheck, FiStar, FiZap, FiBriefcase } from 'react-icons/fi';
import './PackCard.css';

const PackCard = ({ pack, index, isSelected, onSelect, onPurchase, t }) => {
  const getPackType = (pack, idx) => {
    if (pack.type) return pack.type;
    const name = (pack.name || '').toUpperCase();
    if (name.includes('PRO') || name.includes('احتراف') || name.includes('الاحترافية')) return 'pro';
    if (name.includes('BUSINESS') || name.includes('أعمال') || name.includes('العمل') || name.includes('شركة')) return 'business';
    if (pack.points === 400 || pack.priceDzd === 2500) return 'pro';
    if (pack.points === 700 || pack.priceDzd === 4000) return 'business';
    if (idx !== undefined && idx !== null) {
      if (idx === 0) return 'basic';
      if (idx === 1) return 'pro';
      return 'business';
    }
    return 'basic';
  };

  const packType = getPackType(pack, index);

  const getIcon = (type) => {
    switch (type) {
      case 'basic': return <FiStar className="pack-icon basic" />;
      case 'pro': return <FiZap className="pack-icon pro" />;
      case 'business': return <FiBriefcase className="pack-icon business" />;
      default: return <FiStar className="pack-icon" />;
    }
  };

  return (
    <div 
      className={`pack-card ${isSelected ? 'selected' : ''} ${packType} ${pack.isBestOffer ? 'best-offer' : ''}`}
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
          {getIcon(packType)}
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
