import React from 'react';
import { Link } from 'react-router-dom';

const NavButton = ({ 
  children, 
  to, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "nav-btn";
  const variantClasses = variant === 'back' ? "back-btn" : "btn-primary";
  const disabledClasses = disabled ? "opacity-40 cursor-not-allowed transform-none" : "";
  
  const classes = `${baseClasses} ${variantClasses} ${disabledClasses} ${className}`;
  
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={classes} 
      {...props}
    >
      {children}
    </button>
  );
};

export default NavButton;