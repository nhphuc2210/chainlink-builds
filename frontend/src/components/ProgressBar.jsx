import React from 'react';
import { theme } from '../styles/theme.js';
import {
  progressContainerStyle,
  progressLabelStyle,
  progressBarBgStyle,
  progressBarFillStyle
} from '../styles/components.js';

export function ProgressBar({ currentDay, progressPercent }) {
  return (
    <div style={progressContainerStyle} className="animate-fade-in-up animate-delay-3">
      <div style={progressLabelStyle}>
        <span>Vesting Progress (Day {currentDay})</span>
        <span style={{ color: theme.accentBlue, fontWeight: 600 }}>{progressPercent}% unlocked</span>
      </div>
      <div style={progressBarBgStyle}>
        <div 
          className="progress-fill"
          style={{
            ...progressBarFillStyle,
            width: `${progressPercent}%`
          }}
        />
      </div>
    </div>
  );
}

