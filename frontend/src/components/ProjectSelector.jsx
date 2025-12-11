import React from 'react';
import {
  projectSelectorStyle,
  selectWrapperStyle,
  selectContainerStyle,
  selectStyle,
  selectChevronStyle,
  refreshButtonStyle,
  labelStyle,
  inlineStatusStyle,
  inlineLoadingStyle,
  inlineSuccessStyle,
  inlineErrorStyle
} from '../styles/components.js';

// Chevron Down SVG Icon
const ChevronDownIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Refresh/Reload SVG Icon
const RefreshIcon = ({ spinning }) => (
  <svg 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{
      animation: spinning ? 'spin 1s linear infinite' : 'none',
    }}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export function ProjectSelector({
  projects,
  selectedIndex,
  onSelect,
  onRefresh,
  loading,
  error,
  config
}) {
  return (
    <div style={projectSelectorStyle} className="animate-fade-in-up animate-delay-2">
      <label style={labelStyle}>SELECT PROJECT</label>
      <div style={selectWrapperStyle}>
        {/* Custom Select Container */}
        <div style={selectContainerStyle} className="custom-select">
          <select
            value={selectedIndex}
            onChange={(e) => onSelect(Number(e.target.value))}
            style={selectStyle}
            className="project-select"
          >
            {projects.map((project, idx) => (
              <option key={project.projectId} value={idx}>
                {project.ticker} - {project.name}
              </option>
            ))}
          </select>
          <div style={selectChevronStyle} className="select-chevron">
            <ChevronDownIcon />
          </div>
        </div>
        
        {/* Refresh Button */}
        <button 
          onClick={onRefresh} 
          style={refreshButtonStyle}
          className="refresh-btn"
          title="Refresh blockchain data"
          disabled={loading}
        >
          <RefreshIcon spinning={loading} />
        </button>
        
        {/* Inline status indicator */}
        <div style={inlineStatusStyle}>
          {loading && <span style={inlineLoadingStyle}>Fetching...</span>}
          {!loading && !error && config && <span style={inlineSuccessStyle}>✓ Loaded</span>}
          {error && <span style={inlineErrorStyle}>⚠️ Error</span>}
        </div>
      </div>
    </div>
  );
}

