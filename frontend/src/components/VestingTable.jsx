import { theme } from '../styles/theme.js';
import { formatNumber, formatPercent, formatPercentDecimal } from '../utils/formatters.js';
import {
  tableSectionStyle,
  tableHeaderTitleStyle,
  dotStyle,
  emptyStateStyle,
  tableWrapperStyle,
  tableStyle,
  thStyle,
  tdStyle,
  tdStyleDate,
  tdStyleMuted,
  trEvenStyle,
  trOddStyle,
  trHighlightStyle
} from '../styles/components.js';

// Blue accent styles - chỉ dùng 1 màu xanh với các độ đậm nhạt
const thStyleAccent = {
  ...thStyle,
  background: '#eff6ff',
  color: theme.accentBlue,
};

const tdStyleAccent = {
  ...tdStyle,
  color: theme.accentBlue,
  fontWeight: 500,
};

const tdStyleAccentStrong = {
  ...tdStyle,
  color: theme.accentBlue,
  fontWeight: 600,
  background: '#f8faff',
};

export function VestingTable({ rows, currentDay, selectedProject, loading }) {
  return (
    <div style={tableSectionStyle} className="animate-fade-in-up animate-delay-4">
      <h3 style={tableHeaderTitleStyle}>
        Vesting Timeline - {selectedProject.ticker}
      </h3>
      {rows.length === 0 ? (
        <p style={emptyStateStyle}>
          {loading ? "Loading blockchain data..." : "Enter maxTokenAmount > 0 to see vesting schedule."}
        </p>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Day</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Vested</th>
                <th style={thStyle}>Unlocked</th>
                <th style={thStyle}>Locked</th>
                <th style={thStyle}>Early %</th>
                <th style={thStyle}>Early Bonus</th>
                <th style={thStyle}>If Early</th>
                <th style={thStyle}>Forfeited</th>
                <th style={thStyleAccent}>Loyalty</th>
                <th style={thStyleAccent}>If Wait</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const baseStyle = idx % 2 === 0 ? trEvenStyle : trOddStyle;
                const highlightStyle = row.t === currentDay ? trHighlightStyle : {};
                const rowStyle = {
                  ...baseStyle,
                  ...highlightStyle,
                  animationDelay: `${Math.min(idx * 0.02, 0.5)}s`
                };
                
                return (
                  <tr 
                    key={row.t} 
                    style={rowStyle}
                    className="table-row"
                  >
                    <td style={tdStyle}>{row.t}</td>
                    <td style={tdStyleDate}>{row.date}</td>
                    <td style={tdStyle}>{formatNumber(row.vested)}</td>
                    <td style={tdStyle}>{formatNumber(row.unlocked)}</td>
                    <td style={tdStyleMuted}>{formatNumber(row.locked)}</td>
                    <td style={tdStyle}>{formatPercentDecimal(row.earlyVestRatioPercent)}</td>
                    <td style={tdStyle}>{formatNumber(row.earlyVestableBonus)}</td>
                    <td style={tdStyle}>{formatNumber(row.totalIfEarlyClaim)}</td>
                    <td style={tdStyleMuted}>{formatNumber(row.forfeited)}</td>
                    <td style={tdStyleAccent}>{formatNumber(row.loyaltyBonus)}</td>
                    <td style={tdStyleAccentStrong}>{formatNumber(row.totalIfWait)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

