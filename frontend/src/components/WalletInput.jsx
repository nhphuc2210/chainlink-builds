import { useState, useEffect, useRef, useMemo } from 'react';
import { theme } from '../styles/theme.js';
import { formatNumber } from '../utils/formatters.js';
import { useWalletHistory } from '../hooks/useWalletHistory.js';
import {
  walletInputContainerStyle,
  walletInputFieldStyle,
  walletErrorStyle,
  configGridStyle,
  configItemStyle,
  configLabelStyle,
  configValueStyle,
  configTitleStyle,
  labelStyle,
  selectWrapperStyle,
  selectContainerStyle,
  refreshButtonStyle,
  inlineStatusStyle,
  inlineLoadingStyle,
  inlineSuccessStyle,
  inlineErrorStyle,
  chainTagStyle
} from '../styles/components.js';

// Metric explanations - Only for on-chain data
const METRIC_EXPLANATIONS = {
  walletOnChainData: {
    title: "Wallet On-Chain Data — Dữ liệu tra cứu được từ blockchain",
    description: "✅ CÓ THỂ TRA CỨU:\n• Claimed: Số token đã claim\n• Has Early Claimed: Đã early claim chưa\n\n❌ KHÔNG THỂ TRA CỨU:\n• Max Allocation, Base, Bonus (cần data off-chain từ Chainlink)\n\nSmart contract dùng Merkle Tree nên chỉ lưu UserState (claimed, hasEarlyClaimed) sau khi user claim. Allocation data được lưu off-chain.\n\nXem FAQ Q10 để biết thêm chi tiết."
  },
  claimed: {
    title: "claimed — số token bạn đã nhận trước đó",
    formula: "s_userStates[user][seasonId].claimed",
    description: "• Số token bạn đã claim trong những lần trước\n• Được lưu trữ on-chain trong smart contract\n• Nếu bạn chưa claim lần nào → claimed = 0\n\nĐây là dữ liệu có thể tra cứu công khai trên blockchain."
  },
  hasEarlyClaimed: {
    title: "hasEarlyClaimed — đã early claim hay chưa",
    formula: "s_userStates[user][seasonId].hasEarlyClaimed",
    description: "• true: Bạn đã early claim và không thể claim thêm nữa\n• false: Bạn chưa early claim, có thể claim nhiều lần theo vesting schedule\n\nKhi early claim, bạn nhận một phần bonus sớm nhưng mất quyền nhận Loyalty Bonus."
  }
};

// Info icon component that shows modal on click
function InfoIcon({ explanation }) {
  const [isVisible, setIsVisible] = useState(false);

  const infoIconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#cbd5e1',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    flexShrink: 0,
    marginLeft: '6px',
  };

  const tooltipContentStyle = {
    visibility: isVisible ? 'visible' : 'hidden',
    opacity: isVisible ? 1 : 0,
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    width: '400px',
    maxWidth: '90vw',
    fontSize: '13px',
    lineHeight: '1.6',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    whiteSpace: 'pre-line',
  };

  const overlayStyle = {
    display: isVisible ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px',
    transition: 'color 0.2s ease',
  };

  const handleIconClick = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        style={infoIconStyle}
        onClick={handleIconClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#60a5fa';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#cbd5e1';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        !
      </div>

      {/* Overlay */}
      <div style={overlayStyle} onClick={handleClose}></div>

      {/* Modal */}
      <div style={tooltipContentStyle}>
        <button 
          style={closeButtonStyle}
          onClick={handleClose}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          ×
        </button>
        
        <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '12px', fontSize: '15px', paddingRight: '24px' }}>
          {explanation.title}
        </div>
        
        {explanation.formula && (
          <div style={{ 
            backgroundColor: 'rgba(96, 165, 250, 0.15)', 
            padding: '12px', 
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '12px',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            color: '#93c5fd',
            border: '1px solid rgba(96, 165, 250, 0.3)'
          }}>
            <strong>Công thức:</strong>
            <br />
            {explanation.formula}
          </div>
        )}
        
        <div style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.7' }}>
          {explanation.description}
        </div>
      </div>
    </>
  );
}

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

// Clear/X Icon
const ClearIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Small X icon for history items
const SmallXIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// History Dropdown Component
function HistoryDropdown({ 
  history, 
  onSelect, 
  onRemove, 
  onClearAll,
  isOpen 
}) {
  if (!isOpen || history.length === 0) {
    return null;
  }

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 2000,
    background: `linear-gradient(135deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)`,
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${theme.borderSubtle}`,
    maxHeight: '300px',
    overflowY: 'auto',
    animation: 'fadeIn 0.15s ease-out',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.borderSubtle}`,
    fontSize: '12px',
    fontWeight: 600,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const clearAllButtonStyle = {
    background: 'none',
    border: 'none',
    color: theme.accentBlue,
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    fontSize: '13px',
    color: theme.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    borderBottom: `1px solid ${theme.borderSubtle}`,
  };

  const removeButtonStyle = {
    background: 'none',
    border: 'none',
    color: theme.textSecondary,
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginLeft: '8px',
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div style={dropdownStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span>Recent Addresses</span>
        <button
          style={clearAllButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onClearAll();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.color = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.accentBlue;
          }}
        >
          Clear All
        </button>
      </div>

      {/* History Items */}
      {history.map((address, index) => (
        <div
          key={address}
          style={{
            ...itemStyle,
            borderBottom: index === history.length - 1 ? 'none' : itemStyle.borderBottom,
          }}
          onClick={() => onSelect(address)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.color = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.textPrimary;
          }}
        >
          <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
            {truncateAddress(address)}
          </span>
          <button
            style={removeButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(address);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.textSecondary;
            }}
            title="Remove from history"
          >
            <SmallXIcon />
          </button>
        </div>
      ))}
    </div>
  );
}

export function WalletInput({ 
  walletAddress, 
  setWalletAddress, 
  loading,
  error,
  claimData,
  rateLimitActive,
  onRefresh
}) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Use wallet history hook
  const { history, addToHistory, removeFromHistory, clearHistory } = useWalletHistory();

  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const canLoad = walletAddress && isValidAddress(walletAddress) && !loading;

  // Note: Auto-fetch is now handled by SWR hook in App.jsx
  // The useEffect below is removed since SWR automatically refetches when walletAddress changes

  // Reset lastFetchedAddress when claimData changes (handles external fetches from project change)
  // AND save to history when fetch is successful
  useEffect(() => {
    if (claimData && walletAddress && isValidAddress(walletAddress)) {
      setLastFetchedAddress(walletAddress);
      // Save to history only on successful fetch
      addToHistory(walletAddress);
      // Close dropdown after successful fetch
      setShowHistory(false);
    }
  }, [claimData, walletAddress, addToHistory]);

  // Click outside detection to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        showHistory
      ) {
        setShowHistory(false);
        setIsInputFocused(false);
      }
    };

    // ESC key to close dropdown
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showHistory) {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showHistory]);

  // Blur input when user leaves the tab/window
  useEffect(() => {
    const handleWindowBlur = () => {
      // Blur the input and close dropdown when switching tabs
      if (inputRef.current) {
        inputRef.current.blur();
      }
      setIsInputFocused(false);
      setShowHistory(false);
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Truncate wallet address for display in title
  const truncatedAddress = walletAddress && claimData
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  // Manual refresh handler
  const handleRefresh = () => {
    if (onRefresh && canLoad) {
      onRefresh();
    }
  };

  // Clear wallet input
  const handleClearAddress = () => {
    setWalletAddress('');
    setLastFetchedAddress('');
    setShowHistory(false);
  };

  // Handle input focus - show history if available
  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (history.length > 0 && filteredHistory.length > 0) {
      setShowHistory(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  // Handle selecting an address from history
  const handleSelectHistory = (address) => {
    setWalletAddress(address);
    setShowHistory(false);
    // Trigger fetch by calling onRefresh
    if (onRefresh) {
      // Small delay to ensure walletAddress state is updated
      setTimeout(() => {
        onRefresh();
      }, 50);
    }
  };

  // Handle removing an address from history
  const handleRemoveFromHistory = (address) => {
    removeFromHistory(address);
    // If no more history, close dropdown
    if (history.length <= 1) {
      setShowHistory(false);
    }
  };

  // Handle clear all history
  const handleClearAllHistory = () => {
    clearHistory();
    setShowHistory(false);
  };

  // Filter history based on input text
  const filteredHistory = useMemo(() => {
    if (!walletAddress || walletAddress.trim() === '') {
      return history;
    }
    const searchTerm = walletAddress.toLowerCase();
    return history.filter(addr => addr.toLowerCase().includes(searchTerm));
  }, [history, walletAddress]);

  // Auto-close dropdown if no matches found
  useEffect(() => {
    if (showHistory && walletAddress && walletAddress.trim() !== '' && filteredHistory.length === 0) {
      setShowHistory(false);
    }
  }, [showHistory, walletAddress, filteredHistory]);

  // Auto-open dropdown when input is focused and there are matches
  // But don't reopen if we have valid address with claim data (just fetched successfully)
  useEffect(() => {
    const hasValidDataLoaded = claimData && walletAddress && isValidAddress(walletAddress);
    if (isInputFocused && history.length > 0 && filteredHistory.length > 0 && !showHistory && !hasValidDataLoaded) {
      setShowHistory(true);
    }
  }, [isInputFocused, history.length, filteredHistory.length, showHistory, claimData, walletAddress]);

  return (
    <div style={walletInputContainerStyle} className="animate-fade-in-up animate-delay-1">
      <label style={labelStyle}>WALLET ON-CHAIN DATA (Optional)</label>
      <div style={{ ...selectWrapperStyle, position: 'relative' }} ref={containerRef}>
        {/* Input Container */}
        <div style={selectContainerStyle}>
          <input
            ref={inputRef}
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              // Handle Cmd+A / Ctrl+A explicitly
              if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                e.preventDefault();
                e.currentTarget.select();
              }
              // Close history on ESC
              if (e.key === 'Escape' && showHistory) {
                setShowHistory(false);
              }
            }}
            placeholder="Enter wallet address (0x...)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            readOnly={false}
            style={{
              ...walletInputFieldStyle,
              width: "100%",
              padding: "14px 16px",
              borderRadius: 4,
              border: walletAddress && !isValidAddress(walletAddress) 
                ? `2px solid ${theme.error}` 
                : `2px solid ${theme.borderSubtle}`,
              background: `linear-gradient(135deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)`,
              color: theme.textPrimary,
              fontSize: 14,
              fontWeight: 500,
              outline: "none",
              transition: "all 0.25s ease",
              boxShadow: theme.cardShadow,
              userSelect: "text",
              WebkitUserSelect: "text",
              MozUserSelect: "text",
              msUserSelect: "text",
              cursor: "text",
            }}
          />
        </div>

        {/* History Dropdown */}
        <HistoryDropdown
          history={filteredHistory}
          isOpen={showHistory}
          onSelect={handleSelectHistory}
          onRemove={handleRemoveFromHistory}
          onClearAll={handleClearAllHistory}
        />
        
        {/* Manual refresh button removed - SWR auto-fetches when wallet address changes */}

        {/* Reload Button - Manual refresh */}
        <button 
          onClick={handleRefresh}
          disabled={!canLoad}
          style={{
            ...refreshButtonStyle,
            background: canLoad
              ? `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
              : `linear-gradient(135deg, #6b7280 0%, #4b5563 100%)`,
            boxShadow: canLoad
              ? "0 4px 12px rgba(59, 130, 246, 0.3)"
              : "0 4px 12px rgba(107, 114, 128, 0.3)",
            opacity: canLoad ? 1 : 0.5,
            cursor: canLoad ? 'pointer' : 'not-allowed',
          }}
          title={canLoad ? "Reload wallet data" : "Enter valid address to reload"}
        >
          <RefreshIcon spinning={loading} />
        </button>

        {/* Clear Button - Only show when there's text */}
        {walletAddress && (
          <button 
            onClick={handleClearAddress} 
            style={{
              ...refreshButtonStyle,
              background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
            title="Clear input"
          >
            <ClearIcon />
          </button>
        )}
        
        {/* Inline status indicator */}
        <div style={inlineStatusStyle}>
          {loading && <span style={inlineLoadingStyle}>Fetching...</span>}
          {!loading && !error && claimData && isValidAddress(walletAddress) && <span style={inlineSuccessStyle}>✓ Loaded</span>}
          {error && <span style={inlineErrorStyle}>⚠️ Error</span>}
        </div>
      </div>

      {/* Validation error message */}
      {walletAddress && !isValidAddress(walletAddress) && (
        <div style={{ fontSize: 12, color: theme.error, marginTop: 8 }}>
          Invalid Ethereum address format
        </div>
      )}

      {/* Error message - Hide rate limit errors when banner is active */}
      {error && !rateLimitActive && (
        <div style={walletErrorStyle}>
          {error}
        </div>
      )}

      {/* Expanded claim data section - Only show on-chain data */}
      {claimData && walletAddress && isValidAddress(walletAddress) && (
        <div style={{ 
          marginTop: 24, 
          paddingTop: 24, 
          borderTop: `1px solid ${theme.borderSubtle}` 
        }}>
          {/* Header */}
          <div style={configTitleStyle}>
            Wallet On-Chain Data
            <InfoIcon explanation={METRIC_EXPLANATIONS.walletOnChainData} />
            {' '}
            <span style={chainTagStyle}>
              (queryable from blockchain)
            </span>
          </div>
          
          <div style={configGridStyle}>
            <div style={configItemStyle}>
              <span style={configLabelStyle}>
                Claimed
                <InfoIcon explanation={METRIC_EXPLANATIONS.claimed} />
              </span>
              <span style={{ ...configValueStyle, color: theme.accentBlue }}>
                {formatNumber(claimData.claimed || 0)}
              </span>
            </div>

            <div style={configItemStyle}>
              <span style={configLabelStyle}>
                Has Early Claimed
                <InfoIcon explanation={METRIC_EXPLANATIONS.hasEarlyClaimed} />
              </span>
              <span style={{ 
                ...configValueStyle, 
                color: claimData.hasEarlyClaimed ? theme.error : theme.accentGreen 
              }}>
                {claimData.hasEarlyClaimed ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

