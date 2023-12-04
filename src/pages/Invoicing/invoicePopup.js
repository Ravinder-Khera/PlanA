import React from 'react'
import PropTypes from 'prop-types';

function InvoicePopup({ isOpen, onClose, animation, children }) {
    const popupStyle = {
        display: isOpen ? 'block' : 'none',
    };
    
    const overlayStyle = {
        display: isOpen ? 'block' : 'none',
    };
  return (<>
    <div className="overlay" style={overlayStyle} onClick={onClose}></div>
      <div className={`popup ${animation}`} style={popupStyle}>
        {children}
      </div>
  </>)
}

InvoicePopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

export default InvoicePopup;