import React from 'react';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-main bg-cover bg-fixed flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-violet/10 backdrop-blur-sm"></div>
      
      <div className="relative card w-full max-w-md mx-auto shadow-xl">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary-500 rounded-full p-2 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display text-secondary mb-2">{title}</h1>
            <div className="timeline-line mx-auto w-24 h-1.5 rounded-full"></div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;