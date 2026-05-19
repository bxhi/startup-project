import React from 'react';
import './AuthHeader.css';

/**
 * AuthHeader component used on Login and SignUp pages.
 * Displays a logo, a horizontal separator, and a title.
 * The logo size and primary colour are based on the project's theme.
 */
const AuthHeader = ({ title, logoSrc = '/SILA-LOGO.png' }) => {
  return (
    <div className="auth-header">
      <img src={logoSrc} alt="logo" className="auth-header-logo" />
      <div className="auth-header-separator" />
      {title && <h1 className="auth-header-title">{title}</h1>}
    </div>
  );
};

export default AuthHeader;
