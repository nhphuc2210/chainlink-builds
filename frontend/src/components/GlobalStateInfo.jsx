import React from 'react';
import { formatNumber } from '../utils/formatters.js';
import {
  globalStateInfoStyle,
  globalStateTitleStyle,
  globalStateGridStyle,
  globalStateItemStyle,
  globalStateLabelStyle,
  globalStateValueStyle,
  chainTagStyle,
  simTagStyle
} from '../styles/components.js';

export function GlobalStateInfo({ simulatedGlobalState, selectedProject, dataSource }) {
  return (
    <div style={globalStateInfoStyle} className="animate-fade-in-up animate-delay-2">
      <h4 style={globalStateTitleStyle}>
        Global Loyalty Pool 
        <span style={dataSource.loyaltyPool === 'chain' ? chainTagStyle : simTagStyle}> ({dataSource.loyaltyPool})</span>
      </h4>
      <div style={globalStateGridStyle}>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Loyalty (Forfeited)</span>
          <span style={globalStateValueStyle}>{formatNumber(simulatedGlobalState.totalLoyalty)} {selectedProject.ticker}</span>
        </div>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Ineligible (Early Claimers)</span>
          <span style={globalStateValueStyle}>{formatNumber(simulatedGlobalState.totalLoyaltyIneligible)} {selectedProject.ticker}</span>
        </div>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Claimed</span>
          <span style={globalStateValueStyle}>{formatNumber(simulatedGlobalState.totalClaimed)} {selectedProject.ticker}</span>
        </div>
      </div>
    </div>
  );
}

