import React from 'react';
import { theme } from '../styles/theme.js';
import { formatNumber } from '../utils/formatters.js';
import {
  simulationHeaderStyle,
  simulationTitleStyle,
  simulationHintStyle,
  resetButtonStyle,
  inputGridStyle,
  inputGroupStyle,
  labelStyle,
  inputStyle,
  inputHintStyle,
  rangeStyle,
  configInfoStyle,
  configTitleStyle,
  configGridStyle,
  configItemStyle,
  configLabelStyle,
  configValueStyle
} from '../styles/components.js';

export function SimulationInputs({
  isChainConfigSet,
  config,
  globalState,
  maxTokenAmount,
  setMaxTokenAmount,
  currentDay,
  setCurrentDay,
  durationDays,
  simulateLoyaltyPool,
  setSimulateLoyaltyPool,
  simulateStartDate,
  simulateDurationDays,
  simulateBaseClaimBps,
  simulateEarlyVestMinBps,
  simulateEarlyVestMaxBps,
  DEFAULTS,
  onReset
}) {
  return (
    <>
      {/* Simulation Header */}
      <div style={{
        ...simulationHeaderStyle,
        background: isChainConfigSet 
          ? "#ecfdf5" 
          : "#eff6ff",
        borderColor: isChainConfigSet ? theme.accentGreen : theme.accentBlue,
      }} className="animate-fade-in-up animate-delay-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...simulationTitleStyle, color: isChainConfigSet ? theme.accentGreen : theme.accentBlue }}>
            {isChainConfigSet ? "✓ Chain Config Loaded" : "Simulation Mode"}
          </span>
          <button
            onClick={onReset}
            style={resetButtonStyle}
            title="Reset simulation values"
          >
            ↻ Reset
          </button>
        </div>
        <span style={simulationHintStyle}>
          {isChainConfigSet 
            ? `tokenAmount = ${formatNumber(config?.tokenAmount || 0)} → using all chain values` 
            : "tokenAmount = 0 on chain → using simulation defaults"}
        </span>
      </div>

      {/* Editable Simulation Inputs */}
      <div style={inputGridStyle} className="animate-fade-in-up animate-delay-2">
        <div style={inputGroupStyle} className="input-group">
          <label style={labelStyle} className="input-label">YOUR maxTokenAmount</label>
          <input
            type="text"
            value={formatNumber(Number(maxTokenAmount) || 0)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '');
              const num = parseInt(raw, 10);
              setMaxTokenAmount(isNaN(num) ? 0 : num);
            }}
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle} className="input-group">
          <label style={labelStyle} className="input-label">SIMULATE DAY</label>
          <input
            type="number"
            min="0"
            max={durationDays}
            value={currentDay}
            onChange={(e) => setCurrentDay(Math.max(0, Math.min(durationDays, Number(e.target.value) || 0)))}
            style={inputStyle}
          />
          <input
            type="range"
            min="0"
            max={durationDays}
            value={Math.min(currentDay, durationDays)}
            onChange={(e) => setCurrentDay(Number(e.target.value))}
            style={rangeStyle}
          />
          <div style={inputHintStyle}>
            Day {currentDay} of {durationDays} ({Math.round(currentDay / durationDays * 100)}% through vesting)
          </div>
        </div>

        <div style={inputGroupStyle} className="input-group">
          <label style={labelStyle} className="input-label">LOYALTY POOL (Total Forfeited)</label>
          <input
            type="text"
            value={isChainConfigSet ? formatNumber(globalState?.totalLoyalty || 0) : formatNumber(simulateLoyaltyPool)}
            onChange={(e) => {
              if (isChainConfigSet) return;
              const raw = e.target.value.replace(/\./g, '');
              const num = parseInt(raw, 10);
              setSimulateLoyaltyPool(isNaN(num) ? 0 : num);
            }}
            style={isChainConfigSet ? { ...inputStyle, background: theme.bgSecondary, color: theme.textMuted } : inputStyle}
            disabled={isChainConfigSet}
          />
          <div style={inputHintStyle}>
            {isChainConfigSet 
              ? `✓ Using chain: ${formatNumber(globalState?.totalLoyalty || 0)}` 
              : `Simulating ${formatNumber(simulateLoyaltyPool)} in loyalty pool`}
          </div>
        </div>
      </div>

      {/* Read-only Config Values */}
      <div style={{ ...configInfoStyle, marginTop: 16 }} className="animate-fade-in-up animate-delay-2">
        <div style={configTitleStyle}>
          🔒 Config Values (from blockchain)
        </div>
        <div style={configGridStyle}>
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Vesting Duration</span>
            <span style={configValueStyle}>{simulateDurationDays} days</span>
          </div>
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Start Date</span>
            <span style={configValueStyle}>{simulateStartDate}</span>
          </div>
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Base Claim %</span>
            <span style={configValueStyle}>{(simulateBaseClaimBps / 100).toFixed(1)}%</span>
          </div>
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Early Vest Ratio</span>
            <span style={configValueStyle}>{(simulateEarlyVestMinBps / 100).toFixed(1)}% → {(simulateEarlyVestMaxBps / 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </>
  );
}

