import React from 'react';
import { theme } from '../styles/theme.js';
import { formatNumber, formatPercent } from '../utils/formatters.js';
import {
  comparisonContainerStyle,
  comparisonTitleStyle,
  comparisonGridStyle,
  comparisonCardStyle,
  comparisonCardHighlightStyle,
  comparisonCardHeaderStyle,
  comparisonCardTitleStyle,
  comparisonCardBodyStyle,
  comparisonRowStyle,
  comparisonRowDividerStyle,
  comparisonRowTotalStyle,
  dotStyle
} from '../styles/components.js';

export function ComparisonCards({ currentDay, currentMetrics }) {
  if (!currentMetrics) return null;

  return (
    <div style={comparisonContainerStyle} className="animate-fade-in-up animate-delay-3">
      <div style={comparisonTitleStyle}>
        <span style={dotStyle} className="pulse-dot"></span>
        Day {currentDay} Claim Options
      </div>
      <div style={comparisonGridStyle}>
        {/* Early Claim Card */}
        <div style={comparisonCardStyle}>
          <div style={comparisonCardHeaderStyle}>
            <span style={{ ...comparisonCardTitleStyle, color: theme.accentOrange }}>EARLY CLAIM</span>
          </div>
          <div style={comparisonCardBodyStyle}>
            <div style={comparisonRowStyle}>
              <span>Base (unlocked)</span>
              <span>{formatNumber(currentMetrics.base)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Vested Bonus</span>
              <span>{formatNumber(currentMetrics.vested)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Early Vest Bonus ({formatPercent(currentMetrics.earlyVestRatioPercent)})</span>
              <span style={{ color: theme.accentGreen }}>+{formatNumber(currentMetrics.earlyVestableBonus)}</span>
            </div>
            <div style={comparisonRowDividerStyle}></div>
            <div style={{ ...comparisonRowStyle, ...comparisonRowTotalStyle }}>
              <span>TOTAL RECEIVE</span>
              <span style={{ color: theme.accentOrange, fontWeight: 700 }}>{formatNumber(currentMetrics.totalIfEarlyClaim)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span style={{ color: theme.accentRed }}>Forfeited to Loyalty</span>
              <span style={{ color: theme.accentRed }}>-{formatNumber(currentMetrics.forfeited)}</span>
            </div>
          </div>
        </div>

        {/* Wait Till End Card */}
        <div style={{ ...comparisonCardStyle, ...comparisonCardHighlightStyle }}>
          <div style={comparisonCardHeaderStyle}>
            <span style={{ ...comparisonCardTitleStyle, color: theme.accentBlue }}>WAIT TILL END</span>
          </div>
          <div style={comparisonCardBodyStyle}>
            <div style={comparisonRowStyle}>
              <span>Base (unlocked)</span>
              <span>{formatNumber(currentMetrics.base)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Full Bonus</span>
              <span>{formatNumber(currentMetrics.bonus)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Est. Loyalty Bonus</span>
              <span style={{ color: theme.accentGreen }}>+{formatNumber(currentMetrics.loyaltyBonus)}</span>
            </div>
            <div style={comparisonRowDividerStyle}></div>
            <div style={{ ...comparisonRowStyle, ...comparisonRowTotalStyle }}>
              <span>TOTAL RECEIVE</span>
              <span style={{ color: theme.accentBlue, fontWeight: 700 }}>{formatNumber(currentMetrics.totalIfWait)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span style={{ color: theme.accentGreen }}>Bonus vs Early</span>
              <span style={{ color: theme.accentGreen }}>+{formatNumber(currentMetrics.totalIfWait - currentMetrics.totalIfEarlyClaim)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

