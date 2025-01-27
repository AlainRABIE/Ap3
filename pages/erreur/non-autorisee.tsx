// pages/non-autorisee.tsx

import React from 'react';

const NonAutorisee = () => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column', 
        textAlign: 'center' 
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
        Bien essayé! <span role="img" aria-label="emoji">😉</span>
      </h1>
      <p style={{ fontSize: '1.2rem' }}>Tu n'as pas accès à cette page.</p>
    </div>
  );
};

export default NonAutorisee;
