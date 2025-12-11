import React from 'react';
import { theme } from '../../styles/theme.js';
import { spinnerContainerStyle, spinnerStyle } from '../../styles/components.js';

export function LoadingSpinner() {
  return (
    <div style={spinnerContainerStyle}>
      <div style={spinnerStyle} className="spinner"></div>
      <span style={{ color: theme.textMuted, marginLeft: 12 }}>Loading blockchain data...</span>
    </div>
  );
}

