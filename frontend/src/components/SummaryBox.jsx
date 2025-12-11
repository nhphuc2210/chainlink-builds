import React, { useState } from 'react';
import { theme } from '../styles/theme.js';
import { formatNumber } from '../utils/formatters.js';
import { CopyIcon, CheckIcon } from './icons/index.js';
import {
  summaryBoxStyle,
  summaryBoxHighlightStyle,
  summaryHeaderStyle,
  summaryLabelStyle,
  summaryValueStyle,
  summaryTickerStyle
} from '../styles/components.js';

export function SummaryBox({ label, value, color, highlight, ticker, isLast }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(Math.round(value).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className="summary-box"
      style={{
        ...summaryBoxStyle,
        ...(isLast ? { borderRight: "none" } : {}),
        ...(highlight ? summaryBoxHighlightStyle : {})
      }}
    >
      <div style={summaryHeaderStyle}>
        <div style={summaryLabelStyle}>
          {label}
        </div>
        <button 
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy value"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <div style={{
        ...summaryValueStyle,
        color: color || theme.textPrimary
      }}>
        {formatNumber(Math.round(value))}
      </div>
      <div style={summaryTickerStyle}>{ticker}</div>
    </div>
  );
}

