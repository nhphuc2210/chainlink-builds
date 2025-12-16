import { useState, useEffect } from 'react';

const rateLimitBannerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
  color: '#ffffff',
  padding: '16px 24px',
  zIndex: 10000,
  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
  border: 'none',
  borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
  animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

const contentWrapperStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
};

const textContainerStyle = {
  flex: 1,
  minWidth: '250px',
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  letterSpacing: '0.3px',
};

const messageStyle = {
  fontSize: '14px',
  opacity: 0.95,
  lineHeight: '1.6',
};

const countdownContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'rgba(0, 0, 0, 0.25)',
  padding: '12px 20px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const countdownNumberStyle = {
  fontSize: '28px',
  fontWeight: 700,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  minWidth: '50px',
  textAlign: 'center',
  background: 'linear-gradient(180deg, #ffffff 0%, #fca5a5 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

const countdownLabelStyle = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: 600,
  opacity: 0.9,
};

const iconStyle = {
  fontSize: '20px',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 640px) {
    .rate-limit-banner-content {
      flex-direction: column;
      align-items: flex-start;
    }
    .rate-limit-countdown {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(styleSheet);

export function RateLimitBanner({ retryAfter, onExpire }) {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    setCountdown(retryAfter);
  }, [retryAfter]);

  useEffect(() => {
    if (countdown <= 0) {
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) {
            setTimeout(onExpire, 500); // Small delay before hiding
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onExpire]);

  if (countdown <= 0) {
    return null;
  }

  return (
    <div style={rateLimitBannerStyle}>
      <div style={contentWrapperStyle} className="rate-limit-banner-content">
        <div style={textContainerStyle}>
          <div style={titleStyle}>
            <span style={iconStyle}>⚠️</span>
            <span>Rate Limit Exceeded / Vượt Quá Giới Hạn Yêu Cầu</span>
          </div>
          <div style={messageStyle}>
            You have been temporarily blocked. Please wait for the countdown to finish.
            <br />
            Bạn đã tạm thời bị chặn. Vui lòng đợi đếm ngược kết thúc.
          </div>
        </div>
        <div style={countdownContainerStyle} className="rate-limit-countdown">
          <div>
            <div style={countdownNumberStyle}>{countdown}</div>
            <div style={countdownLabelStyle}>seconds / giây</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateLimitBanner;

