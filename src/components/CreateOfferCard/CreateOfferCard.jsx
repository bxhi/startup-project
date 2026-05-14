import React from 'react';
import { FiPlus } from 'react-icons/fi';
import './CreateOfferCard.css';

const CreateOfferCard = ({ onClick, isPending, t }) => {
  return (
    <div 
      className={`create-offer-card ${isPending ? 'pending-disabled' : ''}`}
      onClick={!isPending ? onClick : null}
    >
      <div className="card-glass-bg"></div>
      <div className="card-content">
        <div className="icon-wrapper">
          <FiPlus className="plus-icon" />
        </div>
        <div className="text-content">
          <h3>{t.createOffer || "Create Offer"}</h3>
          <p>{t.createOfferDesc || "Publish a new product to the platform"}</p>
        </div>
        <div className="arrow-decoration">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="glowing-border"></div>
    </div>
  );
};

export default CreateOfferCard;
