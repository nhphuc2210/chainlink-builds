import { useState, useEffect, memo } from 'react';
import {
  disclaimerBannerStyle,
  disclaimerContentStyle,
  disclaimerTextStyle,
  disclaimerLinkStyle,
  disclaimerToggleButtonStyle,
  disclaimerExpandedStyle,
  disclaimerOfficialTextStyle,
  closeButtonStyle,
  closeButtonHoverStyle,
  successPopupStyle,
  successPopupVisibleStyle
} from '../styles/components.js';

// Warning Icon SVG
const WarningIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Close Icon (X)
const CloseIcon = () => (
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

// Chevron Down Icon
const ChevronIcon = ({ isExpanded }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{
      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease'
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Auto-hide popup after 4 seconds with countdown
  useEffect(() => {
    if (showPopup) {
      setCountdown(4);
      
      // Fade in
      setTimeout(() => setPopupVisible(true), 10);
      
      // Countdown interval
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start fade out before hiding
      const fadeOutTimer = setTimeout(() => {
        setPopupVisible(false);
      }, 3600); // 4000ms - 400ms for fade out

      // Hide popup timer
      const hideTimer = setTimeout(() => {
        setShowPopup(false);
      }, 4000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showPopup]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setShowPopup(true);
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return (
      <>
        {showPopup && (
          <div 
            style={{
              ...successPopupStyle,
              ...(popupVisible ? successPopupVisibleStyle : {})
            }}
          >
            {/* English Section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, letterSpacing: '0.3px' }}>
                ✓ Thank you for reading and agreeing to the Important Notice
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.95, marginBottom: 8 }}>
                To view the notice again: <strong>scroll to the bottom of the page</strong> or <strong>reload the page</strong>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, fontStyle: 'italic' }}>
                Auto-closing in {countdown}s
              </div>
            </div>

            {/* Divider */}
            <div style={{ 
              height: 1, 
              background: 'rgba(255, 255, 255, 0.3)', 
              margin: '16px 0',
              width: '100%'
            }} />

            {/* Vietnamese Section */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, letterSpacing: '0.3px' }}>
                ✓ Cảm ơn bạn đã đọc và đồng ý với Thông Báo Quan Trọng
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.95, marginBottom: 8 }}>
                Để xem lại thông báo: <strong>cuộn xuống cuối trang</strong> hoặc <strong>tải lại trang</strong>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, fontStyle: 'italic' }}>
                Tự động đóng sau {countdown}s
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div 
        style={{
          ...disclaimerBannerStyle,
          opacity: isClosing ? 0 : 1,
          transform: isClosing ? 'translateY(-20px)' : 'translateY(0)',
          transition: 'all 0.3s ease-out',
          position: 'relative'
        }} 
        className="animate-fade-in-up animate-delay-1"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          onMouseEnter={() => setIsCloseButtonHovered(true)}
          onMouseLeave={() => setIsCloseButtonHovered(false)}
          style={{
            ...closeButtonStyle,
            ...(isCloseButtonHovered ? closeButtonHoverStyle : {})
          }}
          aria-label="Close disclaimer"
        >
          <CloseIcon />
        </button>

        <div style={disclaimerContentStyle}>
        <WarningIcon />
        <div style={{ flex: 1 }}>
          {/* English Disclaimer */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, marginBottom: 12, textAlign: 'justify' }}>
              Important Notice & Disclaimer
            </p>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, marginBottom: 14, textAlign: 'justify' }}>
              This tool does not recommend, suggest, endorse, or optimize any claiming strategy. It does not constitute investment, legal, or tax advice.
            </p>
            <div style={{ marginBottom: 14, paddingLeft: 20 }}>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Independence:</strong> Tunai.world is an independent community tool and is not part of the official Chainlink Rewards platform. 
                This tool is provided for informational and educational purposes only. It is an unofficial community-developed 
                calculator and is not affiliated with, endorsed by, or associated with Chainlink Labs or any official Chainlink entity.
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Data Source:</strong> All data is retrieved from Ethereum Mainnet via public blockchain APIs. Calculation algorithms are independently 
                interpreted from publicly available smart contract code. While we strive for accuracy, there can be no assurance 
                that results will not differ from actual on-chain outcomes.
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>User Responsibility:</strong> Do not rely on this tool as the sole or primary basis for making any financial decision. Always verify results directly on-chain or via 
                official Chainlink channels at{' '}
                <a 
                  href="https://rewards.chain.link/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={disclaimerLinkStyle}
                >
                  rewards.chain.link
                </a>
                .
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Jurisdiction:</strong> Availability of rewards depends on jurisdiction. This tool does not determine user eligibility.
              </p>
              <p style={{ ...disclaimerTextStyle, textAlign: 'justify' }}>
                • <strong>Privacy:</strong> Wallet addresses are used only for on-chain reads and are not stored or shared with third parties.
              </p>
            </div>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, textAlign: 'justify' }}>
              Use at your own risk. The operators of this tool assume no responsibility or liability for any decisions made based on its output.
            </p>
          </div>
          
          {/* Vietnamese Disclaimer */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, marginBottom: 12, textAlign: 'justify' }}>
              Thông Báo Quan Trọng & Miễn Trừ Trách Nhiệm
            </p>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, marginBottom: 14, textAlign: 'justify' }}>
              Công cụ này không khuyến nghị, gợi ý, xác nhận hay tối ưu hóa bất kỳ chiến lược claim nào. Công cụ này không cấu thành lời khuyên đầu tư, pháp lý hay thuế.
            </p>
            <div style={{ marginBottom: 14, paddingLeft: 20 }}>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Tính Độc Lập:</strong> Tunai.world là một công cụ cộng đồng độc lập và không phải là một phần của nền tảng Chainlink Rewards chính thức. 
                Công cụ này được cung cấp chỉ nhằm mục đích thông tin và giáo dục. Đây là công cụ tính toán do cộng đồng 
                phát triển không chính thức và không liên kết, được xác nhận hay liên quan đến Chainlink Labs hay bất kỳ 
                tổ chức Chainlink chính thức nào.
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Nguồn Dữ Liệu:</strong> Toàn bộ dữ liệu được truy xuất từ Ethereum Mainnet thông qua API blockchain công khai. 
                Các thuật toán tính toán được diễn giải độc lập từ mã nguồn smart contract công khai. 
                Mặc dù chúng tôi nỗ lực đảm bảo độ chính xác, không thể đảm bảo rằng kết quả sẽ không 
                khác biệt so với kết quả thực tế trên blockchain.
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Trách Nhiệm Người Dùng:</strong> Không dựa vào công cụ này làm cơ sở duy nhất hoặc chính để đưa ra bất kỳ quyết định tài chính nào. Luôn luôn xác minh kết quả trực tiếp 
                trên blockchain hoặc thông qua các kênh Chainlink chính thức tại{' '}
                <a 
                  href="https://rewards.chain.link/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={disclaimerLinkStyle}
                >
                  rewards.chain.link
                </a>
                .
              </p>
              <p style={{ ...disclaimerTextStyle, marginBottom: 8, textAlign: 'justify' }}>
                • <strong>Khu Vực Pháp Lý:</strong> Tính khả dụng của phần thưởng phụ thuộc vào khu vực pháp lý. Công cụ này không xác định tính đủ điều kiện của người dùng.
              </p>
              <p style={{ ...disclaimerTextStyle, textAlign: 'justify' }}>
                • <strong>Quyền Riêng Tư:</strong> Địa chỉ ví chỉ được sử dụng để đọc dữ liệu trên blockchain và không được lưu trữ hoặc chia sẻ với bên thứ ba.
              </p>
            </div>
            <p style={{ ...disclaimerTextStyle, fontWeight: 600, textAlign: 'justify' }}>
              Sử dụng với rủi ro của bạn. Những người vận hành công cụ này không chịu bất kỳ trách nhiệm hay nghĩa vụ nào đối với các quyết định được đưa ra dựa trên kết quả của nó.
            </p>
          </div>

          {/* Toggle for Official Chainlink Disclaimer */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={disclaimerToggleButtonStyle}
          >
            <span>View Chainlink Official Disclaimer</span>
            <ChevronIcon isExpanded={isExpanded} />
          </button>

          {/* Expanded Official Disclaimer */}
          {isExpanded && (
            <div style={disclaimerExpandedStyle}>
              <p style={{ ...disclaimerOfficialTextStyle, textAlign: 'justify' }}>
                This post is for informational purposes only and contains statements about the future, 
                including anticipated product features, development, and timelines for the rollout of these features. 
                These statements are only predictions and reflect current beliefs and expectations with respect to future events; 
                they are based on assumptions and are subject to risk, uncertainties, and changes at any time. 
                There can be no assurance that actual results will not differ materially from those expressed in these statements, 
                although we believe them to be based on reasonable assumptions. All statements are valid only as of the date first posted. 
                These statements may not reflect future developments due to user feedback or later events and we may not update this post in response. 
                Please review the{' '}
                <a 
                  href="https://chain.link/terms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={disclaimerLinkStyle}
                >
                  Chainlink Terms of Service
                </a>
                , which provides important information and disclosures. 
                The Chainlink Rewards program is being built to comply with the European Union's Markets in Crypto-Assets Regulation (MiCA) 
                and will not be available in certain regions, such as the United States, which could change in the future.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div 
          style={{
            ...successPopupStyle,
            ...(popupVisible ? successPopupVisibleStyle : {})
          }}
        >
          {/* English Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, letterSpacing: '0.3px' }}>
              ✓ Thank you for reading and agreeing to the Important Notice
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.95, marginBottom: 8 }}>
              To view the notice again: <strong>scroll to the bottom of the page</strong> or <strong>reload the page</strong>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, fontStyle: 'italic' }}>
              Auto-closing in {countdown}s
            </div>
          </div>

          {/* Divider */}
          <div style={{ 
            height: 1, 
            background: 'rgba(255, 255, 255, 0.3)', 
            margin: '16px 0',
            width: '100%'
          }} />

          {/* Vietnamese Section */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, letterSpacing: '0.3px' }}>
              ✓ Cảm ơn bạn đã đọc và đồng ý với Thông Báo Quan Trọng
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.95, marginBottom: 8 }}>
              Để xem lại thông báo: <strong>cuộn xuống cuối trang</strong> hoặc <strong>tải lại trang</strong>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, fontStyle: 'italic' }}>
              Tự động đóng sau {countdown}s
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(DisclaimerBanner);

