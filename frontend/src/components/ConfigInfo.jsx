import React from 'react';
import { formatNumber } from '../utils/formatters.js';
import {
  configInfoStyle,
  configTitleStyle,
  configGridStyle,
  configItemStyle,
  configLabelStyle,
  configValueStyle,
  chainTagStyle,
  simTagStyle
} from '../styles/components.js';

export function ConfigInfo({ simulatedConfig, selectedProject, globalState, dataSource }) {
  return (
    <div style={configInfoStyle} className="animate-fade-in-up animate-delay-2">
      <div style={configTitleStyle}>
        📡 Active Config
      </div>
      <div style={configGridStyle}>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>
            Token Pool <span style={dataSource.tokenAmount === 'chain' ? chainTagStyle : simTagStyle}>({dataSource.tokenAmount})</span>
          </span>
          <span style={configValueStyle}>{formatNumber(simulatedConfig.tokenAmount)} {selectedProject.ticker}</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>
            Base Claim % <span style={dataSource.baseClaimBps === 'chain' ? chainTagStyle : simTagStyle}>({dataSource.baseClaimBps})</span>
          </span>
          <span style={configValueStyle}>{(simulatedConfig.baseTokenClaimBps / 100).toFixed(1)}%</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>
            Vesting Duration <span style={dataSource.durationDays === 'chain' ? chainTagStyle : simTagStyle}>({dataSource.durationDays})</span>
          </span>
          <span style={configValueStyle}>{simulatedConfig.unlockDurationDays} days</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>
            Early Vest Ratio <span style={dataSource.earlyVestRatio === 'chain' ? chainTagStyle : simTagStyle}>({dataSource.earlyVestRatio})</span>
          </span>
          <span style={configValueStyle}>{(simulatedConfig.earlyVestRatioMinBps / 100).toFixed(1)}% → {(simulatedConfig.earlyVestRatioMaxBps / 100).toFixed(1)}%</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>
            Unlock Start <span style={dataSource.startDate === 'chain' ? chainTagStyle : simTagStyle}>({dataSource.startDate})</span>
          </span>
          <span style={configValueStyle}>{simulatedConfig.unlockStartDate || "Not set"}</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>Total Claimed <span style={chainTagStyle}>(chain)</span></span>
          <span style={configValueStyle}>{formatNumber(globalState?.totalClaimed || 0)}</span>
        </div>
      </div>
    </div>
  );
}

