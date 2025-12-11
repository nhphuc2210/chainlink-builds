import React from 'react';
import { theme } from '../styles/theme.js';
import { headerStyle, logoStyle, titleStyle, badgeStyle, descriptionStyle } from '../styles/components.js';

export function Header() {
  return (
    <>
      <div style={headerStyle} className="animate-fade-in-up">
        <div style={logoStyle} className="logo">
          <img src="/hexagon.svg" alt="Chainlink" width="32" height="32" />
        </div>
        <h1 style={titleStyle} className="title">BUILD Reward Calculator</h1>
        <span style={badgeStyle} className="badge">On-chain Logic</span>
      </div>
      
      <p style={descriptionStyle} className="animate-fade-in-up animate-delay-1">
        Calculate your BUILD reward claim options: <span style={{ color: theme.accentGreen, fontWeight: 600 }}>Early Claim</span> with penalty 
        or <span style={{ color: theme.accentBlue, fontWeight: 600 }}>Wait</span> for full vesting + loyalty bonus.
      </p>
    </>
  );
}

