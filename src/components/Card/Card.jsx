import React from 'react';
import './Card.css';

const Card = ({ children, className = '', accentBorder = false, ...props }) => {
    return (
        <div
            className={`card ${accentBorder ? 'card--accent-border' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
