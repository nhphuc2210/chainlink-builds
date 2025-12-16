import { useMemo } from 'react';
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

export function ComparisonCards({ currentDay, rows, startDate }) {
  // O(1) lookup from precomputed data
  const currentMetrics = rows[currentDay];
  
  if (!currentMetrics) return null;

  // Calculate the target date (startDate + currentDay days)
  const calculatedDate = useMemo(() => {
    if (!startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + currentDay);
    return date.toISOString().split('T')[0];
  }, [startDate, currentDay]);

  return (
    <div style={comparisonContainerStyle} className="animate-fade-in-up animate-delay-3">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ ...comparisonTitleStyle, marginBottom: 0 }}>
          Day {currentDay} Claim Options
        </div>
        {calculatedDate && (
          <div style={comparisonSubtitleStyle}>
            {calculatedDate}
          </div>
        )}
      </div>
      <div style={comparisonGridStyle}>
        {/* Early Claim Card */}
        <div style={comparisonCardStyle}>
          <div style={comparisonCardHeaderStyle}>
            <span style={{ ...comparisonCardTitleStyle, color: theme.textPrimary }}>EARLY CLAIM</span>
          </div>
          <div style={comparisonCardBodyStyle}>
            <div style={comparisonRowStyle}>
              <span>Base (unlocked)</span>
              <span>{formatNumber(currentMetrics.base)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Locked ({Math.round((currentMetrics.locked / currentMetrics.bonus) * 100)}%)</span>
              <span>{formatNumber(currentMetrics.locked)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Vested ({Math.round((currentMetrics.vested / currentMetrics.bonus) * 100)}%)</span>
              <span>{formatNumber(currentMetrics.vested)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Early Vest Bonus ({Math.round(currentMetrics.earlyVestRatioPercent)}%)</span>
              <span>+{formatNumber(currentMetrics.earlyVestableBonus)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Estimated Loyalty Bonus</span>
              <span>+{formatNumber(0)}</span>
            </div>
            <div style={comparisonRowDividerStyle}></div>
            <div style={{ ...comparisonRowStyle, ...comparisonRowTotalStyle }}>
              <span>TOTAL RECEIVE</span>
              <span style={{ fontWeight: 700 }}>{formatNumber(currentMetrics.totalIfEarlyClaim)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span style={{ opacity: 0.6 }}>Forfeited to Loyalty</span>
              <span style={{ opacity: 0.6 }}>-{formatNumber(currentMetrics.forfeited)}</span>
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
              <span>Locked (0%)</span>
              <span>{formatNumber(0)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Vested (100%)</span>
              <span>{formatNumber(currentMetrics.bonus)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Early Vest Bonus</span>
              <span>+{formatNumber(0)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span>Estimated Loyalty Bonus</span>
              <span>+{formatNumber(currentMetrics.loyaltyBonus)}</span>
            </div>
            <div style={comparisonRowDividerStyle}></div>
            <div style={{ ...comparisonRowStyle, ...comparisonRowTotalStyle }}>
              <span>TOTAL RECEIVE</span>
              <span style={{ color: theme.accentBlue, fontWeight: 700 }}>{formatNumber(currentMetrics.totalIfWait)}</span>
            </div>
            <div style={comparisonRowStyle}>
              <span style={{ opacity: 0.6 }}>Forfeited to Loyalty</span>
              <span style={{ opacity: 0.6 }}>-{formatNumber(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const comparisonSubtitleStyle = {
  fontSize: 15,
  color: theme.textSecondary,
  marginTop: 4,
  marginLeft: 2,
  fontWeight: 400,
  letterSpacing: '0.3px',
};

