import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { theme } from '../styles/theme.js';
import { formatNumber, formatPercent } from '../utils/formatters.js';

const CHART_HEIGHT = 300;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

export function VestingChart({ 
  rows, 
  currentDay,
  setCurrentDay,
  durationDays,
  maxTokenAmount,
  simulatedConfig,
  simulatedGlobalState,
  startDate
}) {
  // Detect screen size for responsive layout
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);

  // Calculate metrics for current day - O(1) lookup from pre-computed rows
  const currentDayMetrics = useMemo(() => {
    if (currentDay === null || !rows[currentDay]) return null;
    return rows[currentDay]; // Metrics already pre-computed in generateVestingTimeline
  }, [currentDay, rows]);

  // Calculate date for current day
  const currentDayDate = useMemo(() => {
    if (currentDay === null || !startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + currentDay);
    return date.toISOString().split('T')[0];
  }, [currentDay, startDate]);

  // Chart dimensions
  const chartWidth = useMemo(() => {
    if (typeof window !== 'undefined') {
      return Math.min(800, window.innerWidth - 80);
    }
    return 800;
  }, []);

  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate max Y percentage based on totalIfWait at the end (includes loyalty bonus)
  const { maxYPercent, yGridLines } = useMemo(() => {
    if (!rows || rows.length === 0) return { maxYPercent: 100, yGridLines: [0, 20, 40, 60, 80, 100] };
    const lastRow = rows[rows.length - 1];
    const originalAllocation = lastRow.base + lastRow.bonus;
    const maxPercent = (lastRow.totalIfWait / originalAllocation) * 100;
    // Round up to nearest 10 for clean grid lines
    const roundedMax = Math.ceil(maxPercent / 10) * 10;
    // Generate grid lines from 0 to roundedMax
    const gridLines = [];
    for (let i = 0; i <= roundedMax; i += 20) {
      gridLines.push(i);
    }
    // Make sure 100% is included
    if (!gridLines.includes(100)) {
      gridLines.push(100);
      gridLines.sort((a, b) => a - b);
    }
    return { maxYPercent: roundedMax, yGridLines: gridLines };
  }, [rows]);

  // Scale functions
  const xScale = (day) => CHART_PADDING.left + (day / durationDays) * innerWidth;
  const yScale = (percent) => CHART_PADDING.top + innerHeight - (percent / maxYPercent) * innerHeight;

  // Helper to calculate total receive percent for a row
  const getTotalReceivePercent = (row) => {
    const originalAllocation = row.base + row.bonus;
    return (row.totalIfEarlyClaim / originalAllocation) * 100;
  };

  // Generate path data for Total Receive line (single line showing totalIfEarlyClaim)
  const totalReceivePath = useMemo(() => {
    if (!rows || rows.length === 0) return '';
    return rows.map((row, i) => {
      const percent = getTotalReceivePercent(row);
      const x = xScale(row.t);
      const y = yScale(percent);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [rows, innerWidth, innerHeight, maxYPercent]);

  // Generate filled area path for Total Receive
  const totalReceiveAreaPath = useMemo(() => {
    if (!rows || rows.length === 0) return '';
    const linePath = rows.map((row, i) => {
      const percent = getTotalReceivePercent(row);
      const x = xScale(row.t);
      const y = yScale(percent);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    const lastX = xScale(durationDays);
    const firstX = xScale(0);
    const bottomY = yScale(0);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [rows, innerWidth, innerHeight, durationDays, maxYPercent]);

  // Unified handler for tap + drag (works for both touch and mouse)
  const handleChartInteraction = useCallback((e) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    
    // Handle both touch and mouse events
    if (e.touches) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    
    // Transform screen coordinates to SVG viewBox coordinates
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    // Calculate day from position
    const dayFloat = ((svgP.x - CHART_PADDING.left) / innerWidth) * durationDays;
    const day = Math.max(0, Math.min(durationDays, Math.round(dayFloat)));
    
    // Update currentDay (syncs with slider via App.jsx)
    setCurrentDay(day);
  }, [innerWidth, durationDays, setCurrentDay]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleChartInteraction(e);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scroll while dragging
    handleChartInteraction(e);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // X-axis grid lines
  const xGridLines = Array.from({ length: 10 }, (_, i) => Math.round((i + 1) * durationDays / 10));

  if (!rows || rows.length === 0) return null;

  return (
    <div style={containerStyle} className="animate-fade-in-up animate-delay-4">
      <div style={titleStyle}>
        Vesting Progress Chart
      </div>
      
      {/* Flexbox container - responsive layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 32,
        alignItems: isMobile ? 'stretch' : 'flex-start',
      }}>
        {/* Chart - Left on desktop, bottom on mobile */}
        <div style={{
          flex: isMobile ? '0 0 auto' : '1 1 auto',
          order: isMobile ? 2 : 1,
          minWidth: 0, // Prevent flex item from overflowing
        }}>
          <svg
        ref={svgRef}
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer', touchAction: 'none' }}
        onClick={handleChartInteraction}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        {/* Grid lines */}
        {yGridLines.map(percent => (
          <g key={`y-${percent}`}>
            <line
              x1={CHART_PADDING.left}
              y1={yScale(percent)}
              x2={chartWidth - CHART_PADDING.right}
              y2={yScale(percent)}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray={percent === 0 ? "none" : "4,4"}
            />
            <text
              x={CHART_PADDING.left - 8}
              y={yScale(percent) + 4}
              textAnchor="end"
              fontSize={13}
              fill="#94a3b8"
            >
              {percent}%
            </text>
          </g>
        ))}

        {xGridLines.map(day => (
          <line
            key={`x-${day}`}
            x1={xScale(day)}
            y1={CHART_PADDING.top}
            x2={xScale(day)}
            y2={CHART_HEIGHT - CHART_PADDING.bottom}
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* X-axis labels */}
        <text
          x={CHART_PADDING.left}
          y={CHART_HEIGHT - 10}
          textAnchor="start"
          fontSize={13}
          fill="#94a3b8"
        >
          Day 0
        </text>
        <text
          x={chartWidth - CHART_PADDING.right}
          y={CHART_HEIGHT - 10}
          textAnchor="end"
          fontSize={13}
          fill="#94a3b8"
        >
          Day {durationDays}
        </text>

        {/* Filled area for Total Receive */}
        <path
          d={totalReceiveAreaPath}
          fill="rgba(55, 91, 210, 0.1)"
        />

        {/* Total Receive line */}
        <path
          d={totalReceivePath}
          fill="none"
          stroke={theme.accentBlue}
          strokeWidth={2.5}
        />

        {/* Draggable bullet point - ENLARGED for touch */}
        <g style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
          {/* Touch target - larger invisible circle */}
          <circle
            cx={xScale(currentDay)}
            cy={yScale(rows[currentDay] ? getTotalReceivePercent(rows[currentDay]) : 0)}
            r={20}
            fill="transparent"
            pointerEvents="all"
          />
          
          {/* Visible outer ring (when dragging) */}
          {isDragging && (
            <circle
              cx={xScale(currentDay)}
              cy={yScale(rows[currentDay] ? getTotalReceivePercent(rows[currentDay]) : 0)}
              r={12}
              fill="none"
              stroke={theme.accentBlue}
              strokeWidth={2}
              opacity={0.3}
            />
          )}
          
          {/* Main bullet */}
          <circle
            cx={xScale(currentDay)}
            cy={yScale(rows[currentDay] ? getTotalReceivePercent(rows[currentDay]) : 0)}
            r={isDragging ? 8 : 6}
            fill={theme.accentBlue}
            stroke="#fff"
            strokeWidth={2}
            style={{
              transition: isDragging ? 'none' : 'r 0.2s ease',
              filter: isDragging ? 'drop-shadow(0 4px 8px rgba(55, 91, 210, 0.4))' : 'none'
            }}
            />
          </g>
        </svg>

        {/* Legend */}
        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <div style={{ ...legendColorStyle, background: theme.accentBlue }}></div>
            <span>Total Receive (% of Original Allocation)</span>
          </div>
          <div style={legendItemStyle}>
            <div style={{ 
              ...legendColorStyle, 
              background: theme.accentBlue, 
              borderRadius: '50%', 
              width: 12, 
              height: 12 
            }}></div>
            <span>Current Day ({currentDay}) - Tap/Drag to change</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip - Right on desktop, top on mobile */}
      {currentDayMetrics && (
        <div 
          style={{
            ...tooltipStyle,
            flex: isMobile ? '0 0 auto' : '0 0 340px',
            order: isMobile ? 1 : 2,
          }}
        >
          <div style={tooltipTitleStyle}>
            {currentDayDate} (Day {currentDay})
            {isDragging && <span style={{ marginLeft: 8, fontSize: 11, color: theme.accentBlue }}>🔵 Dragging</span>}
          </div>
          
          <div style={tooltipSectionStyle}>
            <div style={tooltipRowStyle}>
              <span>Base (unlocked)</span>
              <span>{formatNumber(currentDayMetrics.base)}</span>
            </div>
            <div style={tooltipRowStyle}>
              <span>Vested ({formatPercent((currentDayMetrics.vested / currentDayMetrics.bonus) * 100)})</span>
              <span>{formatNumber(currentDayMetrics.vested)}</span>
            </div>
            <div style={tooltipRowStyle}>
              <span>Early Vest Bonus ({formatPercent(currentDayMetrics.earlyVestRatioPercent)})</span>
              <span>+{formatNumber(currentDayMetrics.earlyVestableBonus)}</span>
            </div>
            <div style={tooltipRowStyle}>
              <span>Estimated Loyalty Bonus</span>
              <span style={{ color: theme.accentBlue }}>+{formatNumber(currentDayMetrics.isUnlockComplete ? currentDayMetrics.loyaltyBonus : 0)}</span>
            </div>
            <div style={tooltipDividerStyle}></div>
            <div style={{ ...tooltipRowStyle, fontWeight: 600 }}>
              <span>TOTAL RECEIVE</span>
              <span style={{ color: theme.accentBlue }}>{formatNumber(currentDayMetrics.totalIfEarlyClaim)}</span>
            </div>
            <div style={{ ...tooltipRowStyle, fontWeight: 600, fontSize: 11 }}>
              <span>% of Original Allocation</span>
              <span style={{ color: theme.accentBlue }}>{formatPercent((currentDayMetrics.totalIfEarlyClaim / (currentDayMetrics.base + currentDayMetrics.bonus)) * 100)}</span>
            </div>
            <div style={{ ...tooltipRowStyle, opacity: 0.6, fontSize: 11 }}>
              <span>Forfeited to Loyalty Pool</span>
              <span>-{formatNumber(currentDayMetrics.forfeited)}</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Styles - Match FAQ styling
const containerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

const titleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
};

const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: theme.accentBlue,
};

const legendStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 24,
  marginTop: 20,
  paddingTop: 20,
  borderTop: '1px solid #DFE7FB',
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 14,
  color: '#6D7380',
};

const legendColorStyle = {
  width: 24,
  height: 4,
  borderRadius: 2,
};

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #DFE7FB',
  borderRadius: 8,
  padding: '16px 20px',
  boxShadow: '0 8px 40px -16px rgba(12, 22, 44, 0.32)',
  zIndex: 100,
};

const tooltipTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1A2B6B',
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: '1px solid #DFE7FB',
};

const tooltipSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const tooltipLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6D7380',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 6,
};

const tooltipRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  color: '#6D7380',
  lineHeight: 1.5,
};

const tooltipDividerStyle = {
  height: 1,
  background: '#DFE7FB',
  margin: '6px 0',
};

