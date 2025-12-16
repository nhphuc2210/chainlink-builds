import { useRef, useCallback } from "react";
import { formatNumber } from "../utils/formatters.js";
import { theme } from "../styles/theme.js"; 
import {
  inputGridStyle,
  labelStyle,
  inputStyle,
  inputHintStyle,
  rangeStyle,
} from "../styles/components.js";

// Reset/Refresh Icon (same as ProjectSelector)
const ResetIcon = ({ spinning }) => (
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

const resetButtonStyle = {
  width: 48,
  height: 48,
  padding: 0,
  borderRadius: 4,
  border: "none",
  background: `linear-gradient(135deg, #0847F7 0%, #3366ff 100%)`,
  color: "#ffffff",
  fontSize: 20,
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(8, 71, 247, 0.3)",
  flexShrink: 0,
};

const simulationWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const simulationHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 4,
};

const headerTitleStyle = {
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
  margin: 0,
};

const customInputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export function SimulationInputs({
  maxTokenAmount,
  setMaxTokenAmount,
  currentDay,
  setCurrentDay,
  durationDays,
  progressPercent,
  onReset
}) {
  // Ref for slider container to calculate touch position
  const sliderContainerRef = useRef(null);

  // Touch handler for tap-to-jump on mobile (similar to chart's handleChartInteraction)
  const handleSliderTouch = useCallback((e) => {
    if (!sliderContainerRef.current) return;
    
    const container = sliderContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get touch/click X position
    const touchX = e.touches ? e.touches[0].clientX : e.clientX;
    
    // Calculate percentage along slider
    const relativeX = touchX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    
    // Calculate day value
    const day = Math.round(percentage * durationDays);
    
    // Update state immediately - thumb will jump to this position
    setCurrentDay(day);
  }, [durationDays, setCurrentDay]);

  return (
    <div style={simulationWrapperStyle} className="animate-fade-in-up animate-delay-2">
      {/* Header with Reset Button */}
      <div style={simulationHeaderStyle}>
        <div style={headerTitleStyle}>Simulation</div>
        <button
          onClick={onReset}
          style={resetButtonStyle}
          className="refresh-btn"
          title="Reset simulation values"
        >
          <ResetIcon spinning={false} />
        </button>
      </div>

      {/* Input Grid */}
      <div style={inputGridStyle}>
        <div style={customInputGroupStyle} className="input-group">
          <label style={labelStyle} className="input-label">STEP 2: INPUT MAX TOKEN AMOUNT</label>
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

        <div style={customInputGroupStyle} className="input-group">
          <label style={labelStyle} className="input-label">STEP 3: CHOOSE SIMULATE DAY</label>
          <input
            type="number"
            min="0"
            max={durationDays}
            step="1"
            value={currentDay}
            onChange={(e) => setCurrentDay(Math.max(0, Math.min(durationDays, Number(e.target.value) || 0)))}
            style={inputStyle}
          />
          <div 
            ref={sliderContainerRef}
            style={{ 
              touchAction: 'pan-y', 
              WebkitUserSelect: 'none', 
              userSelect: 'none',
              position: 'relative',
              cursor: 'pointer'
            }}
            onTouchStart={handleSliderTouch}
            onClick={handleSliderTouch}
          >
            <input
              type="range"
              min="0"
              max={durationDays}
              step="1"
              value={Math.min(currentDay, durationDays)}
              onChange={(e) => setCurrentDay(Number(e.target.value))}
              className="touch-slider"
              style={{
                ...rangeStyle,
                '--progress': `${(Math.min(currentDay, durationDays) / durationDays) * 100}%`
              }}
            />
          </div>
          <div style={inputHintStyle}>
            Day {currentDay} of {durationDays} |{" "}
            <span style={{ color: theme.accentBlue, fontWeight: 600 }}>
              {progressPercent}% unlocked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

