import React from 'react';
import { formatNumber, formatPercent } from '../utils/formatters.js';
import {
  tableSectionStyle,
  tableHeaderTitleStyle,
  dotStyle,
  emptyStateStyle,
  tableWrapperStyle,
  tableStyle,
  thStyle,
  thStyleHighlight,
  thStyleBlue,
  tdStyle,
  tdStyleDate,
  tdStyleMuted,
  tdStyleHighlight,
  tdStyleGreen,
  tdStyleOrange,
  tdStyleRed,
  tdStyleBlue,
  trEvenStyle,
  trOddStyle,
  trHighlightStyle
} from '../styles/components.js';

export function VestingTable({ rows, currentDay, selectedProject, loading }) {
  return (
    <div style={tableSectionStyle} className="animate-fade-in-up animate-delay-4">
      <h3 style={tableHeaderTitleStyle}>
        <span style={dotStyle} className="pulse-dot"></span>
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
                <th style={thStyleHighlight}>Early %</th>
                <th style={thStyleHighlight}>Early Bonus</th>
                <th style={thStyleHighlight}>If Early</th>
                <th style={thStyle}>Forfeited</th>
                <th style={thStyleBlue}>Loyalty</th>
                <th style={thStyleBlue}>If Wait</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr 
                  key={row.t} 
                  style={{
                    ...(idx % 2 === 0 ? trEvenStyle : trOddStyle),
                    ...(row.t === currentDay ? trHighlightStyle : {}),
                    animationDelay: `${Math.min(idx * 0.02, 0.5)}s`
                  }} 
                  className="table-row"
                >
                  <td style={tdStyle}>{row.t}</td>
                  <td style={tdStyleDate}>{row.date}</td>
                  <td style={tdStyle}>{formatNumber(row.vested)}</td>
                  <td style={tdStyle}>{formatNumber(row.unlocked)}</td>
                  <td style={tdStyleMuted}>{formatNumber(row.locked)}</td>
                  <td style={tdStyleHighlight}>{formatPercent(row.earlyVestRatioPercent)}</td>
                  <td style={tdStyleGreen}>{formatNumber(row.earlyVestableBonus)}</td>
                  <td style={tdStyleOrange}>{formatNumber(row.totalIfEarlyClaim)}</td>
                  <td style={tdStyleRed}>{formatNumber(row.forfeited)}</td>
                  <td style={tdStyleGreen}>{formatNumber(row.loyaltyBonus)}</td>
                  <td style={tdStyleBlue}>{formatNumber(row.totalIfWait)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

