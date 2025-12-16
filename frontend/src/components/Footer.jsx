import { memo } from 'react';

// Add CSS for hover effect
const footerStyles = `
  .footer-link:hover {
    color: #375BD2 !important;
  }
`;

const footerContainerStyle = {
  marginTop: 48,
  marginLeft: -24,
  marginRight: -24,
  padding: '40px 24px 32px',
  background: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
};

const footerGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 32,
  maxWidth: 1200,
  margin: '0 auto',
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const sectionTitleStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: 4,
};

const textStyle = {
  fontSize: 13,
  color: '#64748b',
  lineHeight: 1.7,
};

const linkStyle = {
  color: '#475569',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.2s',
};

const dividerStyle = {
  height: 1,
  background: '#e2e8f0',
  margin: '32px 0 24px',
  maxWidth: 1200,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const creditStyle = {
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 12,
  maxWidth: 1200,
  margin: '0 auto',
};

export function Footer() {
  return (
    <>
      <style>{footerStyles}</style>
      <div style={footerContainerStyle} className="animate-fade-in-up animate-delay-5">
        <div style={footerGridStyle}>
          {/* Disclaimer - English */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Important Notice & Disclaimer</div>
            <p style={{ ...textStyle, fontWeight: 600, marginBottom: 14, textAlign: 'justify' }}>
              This tool does not recommend, suggest, endorse, or optimize any claiming strategy. It does not constitute investment, legal, or tax advice.
            </p>
            <div style={{ marginBottom: 14, paddingLeft: 16 }}>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Independence:</strong> Tunai.world is an independent community tool and is not part of the official Chainlink Rewards platform. 
                This tool is provided for informational and educational purposes only. It is an unofficial 
                community-developed calculator and is not affiliated with, endorsed by, or associated with 
                Chainlink Labs or any official Chainlink entity.
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Data Source:</strong> All data is retrieved from Ethereum Mainnet via public blockchain APIs. Calculation algorithms 
                are independently interpreted from publicly available smart contract code. While we strive for 
                accuracy, there can be no assurance that results will not differ from actual on-chain outcomes.
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>User Responsibility:</strong> Do not rely on this tool as the sole or primary basis for making any financial decision. Always verify results directly on-chain 
                or via official Chainlink channels at{' '}
                <a 
                  href="https://rewards.chain.link/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={linkStyle}
                  className="footer-link"
                >
                  rewards.chain.link
                </a>
                .
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Jurisdiction:</strong> Availability of rewards depends on jurisdiction. This tool does not determine user eligibility.
              </p>
              <p style={{ ...textStyle, textAlign: 'justify' }}>
                • <strong>Privacy:</strong> Wallet addresses are used only for on-chain reads and are not stored or shared with third parties.
              </p>
            </div>
            <p style={{ ...textStyle, fontWeight: 600, textAlign: 'justify' }}>
              Use at your own risk. The operators of this tool assume no responsibility or liability for any decisions made based on its output.
            </p>
          </div>

          {/* Disclaimer - Vietnamese */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Thông Báo Quan Trọng & Miễn Trừ Trách Nhiệm</div>
            <p style={{ ...textStyle, fontWeight: 600, marginBottom: 14, textAlign: 'justify' }}>
              Công cụ này không khuyến nghị, gợi ý, xác nhận hay tối ưu hóa bất kỳ chiến lược claim nào. Công cụ này không cấu thành lời khuyên đầu tư, pháp lý hay thuế.
            </p>
            <div style={{ marginBottom: 14, paddingLeft: 16 }}>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Tính Độc Lập:</strong> Tunai.world là một công cụ cộng đồng độc lập và không phải là một phần của nền tảng Chainlink Rewards chính thức. 
                Công cụ này được cung cấp chỉ nhằm mục đích thông tin và giáo dục. Đây là công cụ tính toán 
                do cộng đồng phát triển không chính thức và không liên kết, được xác nhận hay liên quan đến 
                Chainlink Labs hay bất kỳ tổ chức Chainlink chính thức nào.
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Nguồn Dữ Liệu:</strong> Toàn bộ dữ liệu được truy xuất từ Ethereum Mainnet thông qua API blockchain công khai. 
                Các thuật toán tính toán được diễn giải độc lập từ mã nguồn smart contract công khai. 
                Mặc dù chúng tôi nỗ lực đảm bảo độ chính xác, không thể đảm bảo rằng kết quả sẽ không 
                khác biệt so với kết quả thực tế trên blockchain.
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Trách Nhiệm Người Dùng:</strong> Không dựa vào công cụ này làm cơ sở duy nhất hoặc chính để đưa ra bất kỳ quyết định tài chính nào. Luôn luôn xác minh kết quả 
                trực tiếp trên blockchain hoặc thông qua các kênh Chainlink chính thức tại{' '}
                <a 
                  href="https://rewards.chain.link/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={linkStyle}
                  className="footer-link"
                >
                  rewards.chain.link
                </a>
                .
              </p>
              <p style={{ ...textStyle, marginBottom: 10, textAlign: 'justify' }}>
                • <strong>Khu Vực Pháp Lý:</strong> Tính khả dụng của phần thưởng phụ thuộc vào khu vực pháp lý. Công cụ này không xác định tính đủ điều kiện của người dùng.
              </p>
              <p style={{ ...textStyle, textAlign: 'justify' }}>
                • <strong>Quyền Riêng Tư:</strong> Địa chỉ ví chỉ được sử dụng để đọc dữ liệu trên blockchain và không được lưu trữ hoặc chia sẻ với bên thứ ba.
              </p>
            </div>
            <p style={{ ...textStyle, fontWeight: 600, textAlign: 'justify' }}>
              Sử dụng với rủi ro của bạn. Những người vận hành công cụ này không chịu bất kỳ trách nhiệm hay nghĩa vụ nào đối với các quyết định được đưa ra dựa trên kết quả của nó.
            </p>
          </div>

          {/* Resources */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Resources</div>
            <p style={textStyle}>
              <a 
                href="https://rewards.chain.link/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={linkStyle}
                className="footer-link"
              >
                Official Rewards Portal
              </a>
            </p>
            <p style={textStyle}>
              <a 
                href="https://chain.link/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={linkStyle}
                className="footer-link"
              >
                Chainlink Website
              </a>
            </p>
            <p style={textStyle}>
              <a 
                href="https://etherscan.io/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={linkStyle}
                className="footer-link"
              >
                Etherscan
              </a>
            </p>
          </div>
        </div>

        <div style={dividerStyle}></div>

        {/* Official Chainlink Disclaimer */}
        <div style={{ maxWidth: 1200, margin: '0 auto 24px', padding: '0 0' }}>
          <div style={{ ...sectionTitleStyle, marginBottom: 12 }}>Chainlink Official Disclaimer</div>
          <p style={{ ...textStyle, fontSize: 11, lineHeight: 1.8, color: '#94a3b8', textAlign: 'justify' }}>
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
              style={{ ...linkStyle, fontSize: 11 }}
              className="footer-link"
            >
              Chainlink Terms of Service
            </a>
            , which provides important information and disclosures. 
            The Chainlink Rewards program is being built to comply with the European Union's Markets in Crypto-Assets Regulation (MiCA) 
            and will not be available in certain regions, such as the United States, which could change in the future.
          </p>
        </div>

        <div style={{ ...dividerStyle, margin: '24px auto' }}></div>

        <div style={creditStyle}>
          Built by VN Chainlink Community • Data from Ethereum Mainnet
        </div>
      </div>
    </>
  );
}

// Memoize Footer to prevent re-renders (static content)
export default memo(Footer);

