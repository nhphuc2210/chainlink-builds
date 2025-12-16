import { useState, memo } from 'react';
import {
  faqContainerStyle,
  faqTitleStyle,
  faqContentStyle,
  walletExplanationItemStyle,
  walletExplanationMetricStyle,
  walletExplanationFormulaStyle,
  walletExplanationDescStyle
} from '../styles/components.js';

// Chevron Icon for accordion
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
      transition: 'transform 0.3s ease',
      flexShrink: 0,
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Individual FAQ Item Component
function FAQItem({ question, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Container style with click handlers - EXPANDED CLICK AREA
  const containerStyle = {
    ...walletExplanationItemStyle,
    cursor: 'pointer',
  };

  // Question visual style - vertical alignment fixed
  const questionStyle = {
    ...walletExplanationMetricStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '14px 16px',
    minHeight: 56,
    lineHeight: 1.4,
    background: isOpen ? 'linear-gradient(90deg, #eff6ff 0%, transparent 100%)' : 'transparent',
    borderRadius: 6,
    transition: 'all 0.2s ease',
    userSelect: 'none',
  };

  // Answer wrapper with smooth animation
  const answerWrapperStyle = {
    maxHeight: isOpen ? '2000px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isOpen ? 1 : 0,
  };

  return (
    <div 
      style={containerStyle}
      onClick={() => setIsOpen(!isOpen)}
      onMouseEnter={(e) => {
        if (!isOpen) {
          const questionDiv = e.currentTarget.querySelector('[data-question]');
          if (questionDiv) questionDiv.style.background = 'rgba(239, 246, 255, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          const questionDiv = e.currentTarget.querySelector('[data-question]');
          if (questionDiv) questionDiv.style.background = 'transparent';
        }
      }}
    >
      <div style={questionStyle} data-question>
        <span>{question}</span>
        <ChevronIcon isExpanded={isOpen} />
      </div>
      <div style={answerWrapperStyle}>
        <div style={{ paddingTop: 12 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FAQComponent() {
  return (
    <div style={faqContainerStyle} className="animate-fade-in-up animate-delay-4">
      <div style={faqTitleStyle}>
        <span>Câu Hỏi Thường Gặp (FAQ)</span>
      </div>

      <div style={faqContentStyle}>
      
      <FAQItem question="Q1: Có được claim nhiều lần không?">
        <div style={walletExplanationDescStyle}>
          <strong>Regular claim (không early):</strong> CÓ - bạn có thể claim nhiều lần khi tokens dần dần vest theo thời gian. Mỗi lần claim sẽ nhận: Base + Vested - đã claimed. Base được mở khóa ngay từ đầu, Vested tăng dần theo thời gian.
          <br />
          <br />
          <strong>Early claim:</strong> Là một <strong>lựa chọn riêng</strong> khi claim - user phải chọn option "Early Claim" khi submit transaction. CHỈ ĐƯỢC 1 LẦN - sau khi early claim, trạng thái hasEarlyClaimed = true và bạn không thể claim thêm nữa. Phần locked còn lại (forfeited) sẽ vào Loyalty Pool.
          <br />
          <br />
          <em>* Lưu ý: Claim trong 90 ngày KHÔNG tự động là early claim. Early claim là option riêng biệt, cho phép nhận thêm Early Bonus từ phần locked, nhưng đổi lại mất quyền nhận Loyalty Bonus.</em>
        </div>
      </FAQItem>

      <FAQItem question="Q2: Early Bonus là gì? Được tính như thế nào?">
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Early Vestable Bonus = Locked × Early Vest Ratio
        </div>
        <div style={walletExplanationDescStyle}>
          Early Bonus (Early Vestable Bonus) là phần thưởng cho phép bạn claim một phần tokens đang bị lock trước thời hạn.
          <br />
          <br />
          Early Vest Ratio tăng dần theo thời gian từ earlyVestRatioMin đến earlyVestRatioMax. Càng gần cuối vesting, Early Bonus càng cao.
        </div>
      </FAQItem>

      <FAQItem question="Q3: Early claim rồi có được nhận Loyalty Bonus không?">
        <div style={walletExplanationDescStyle}>
          <strong>KHÔNG.</strong> Khi bạn early claim, maxTokenAmount của bạn được thêm vào totalLoyaltyIneligible.
          <br />
          <br />
          Điều này loại bạn ra khỏi pool chia Loyalty Bonus. Chỉ những người đợi đến cuối vesting mới được nhận Loyalty Bonus.
        </div>
      </FAQItem>

      <FAQItem question="Q4: Loyalty Pool từ đâu mà có?">
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Forfeited = Locked - Early Vestable Bonus
        </div>
        <div style={walletExplanationDescStyle}>
          Loyalty Pool được hình thành từ phần tokens bị <strong>forfeited</strong> của những người early claim.
          <br />
          <br />
          Phần forfeited này được cộng vào totalLoyalty và chia đều cho những người đợi đến cuối theo tỷ lệ maxTokenAmount của họ.
        </div>
      </FAQItem>

      <FAQItem question="Q5: Loyalty Pool là chia đều hay chia theo công thức như thế nào?">
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Loyalty Bonus = (maxTokenAmount / eligiblePool) × totalLoyalty
          <br />
          <br />
          Trong đó: eligiblePool = tokenAmount - totalLoyaltyIneligible
        </div>
        <div style={walletExplanationDescStyle}>
          <strong>KHÔNG chia đều.</strong> Loyalty Pool được chia theo <strong>tỷ lệ maxTokenAmount</strong> của mỗi user so với tổng eligible pool.
          <br />
          <br />
          <strong>Ví dụ thực tế với SXT:</strong>
          <br />
          • Token Pool (chain) = <strong>76,880,160 SXT</strong>
          <br />
          • Loyalty Pool = <strong>10,000,000 SXT</strong> (từ những người early claim bỏ lại)
          <br />
          • maxTokenAmount của bạn = <strong>10,000 SXT</strong>
          <br />
          • Loyalty Bonus của bạn = (10,000 / 76,880,160) × 10,000,000 = <strong>~1,300.7 SXT</strong>
          <br />
          <br />
          <em>* Người có nhiều tokens hơn sẽ nhận Loyalty Bonus nhiều hơn (theo tỷ lệ). Đây là phần thưởng cho lòng trung thành - bạn hold bao nhiêu, bạn được thưởng theo tỷ lệ đó.</em>
        </div>
      </FAQItem>

      <FAQItem question="Q6: Sau khi vesting kết thúc thì sao?">
        <div style={walletExplanationDescStyle}>
          <strong>Khi vesting kết thúc (dayT ≥ unlockDurationDays):</strong>
          <br />
          • Tất cả tokens đều <strong>unlocked</strong>, không còn penalty
          <br />
          • Early Claim = Wait (cùng số lượng nhận được)
          <br />
          • Bạn nhận được full maxTokenAmount + Loyalty Bonus
          <br />
          • Không còn khái niệm Early Vest Bonus nữa (locked = 0)
        </div>
      </FAQItem>

      <FAQItem question="Q7: Kết quả 'Estimated Loyalty Bonus' có chính xác không? Sai số đến từ đâu?">
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức Loyalty Bonus:</strong>
          <br />
          Loyalty Bonus = (maxTokenAmount / eligiblePool) × totalLoyalty
        </div>
        <div style={walletExplanationDescStyle}>
          <strong>Estimated Loyalty Bonus là ƯỚC TÍNH</strong> dựa trên snapshot thời điểm bạn load data.
          <br />
          <br />
          <strong>Nguồn gốc sai số:</strong>
          <br />
          • <strong>totalLoyalty thay đổi liên tục:</strong> Khi có người early claim mới, totalLoyalty tăng lên → Loyalty Bonus của bạn tăng
          <br />
          • <strong>eligiblePool thay đổi:</strong> Khi có người early claim, họ bị loại khỏi eligible pool → Loyalty Bonus cho những người còn lại tăng
          <br />
          • <strong>Thời điểm snapshot:</strong> Dữ liệu được lấy tại thời điểm bạn load page, không update real-time
          <br />
          <br />
          <strong>Độ chính xác:</strong>
          <br />
          • <strong>Càng gần deadline vesting (ngày 90):</strong> Loyalty Bonus càng chính xác vì ít người early claim nữa
          <br />
          • <strong>Hiện tại (ngày đầu/giữa):</strong> Con số chỉ mang tính tham khảo, có thể thay đổi đáng kể
          <br />
          <br />
          <em>* Để có số liệu mới nhất, reload page hoặc click nút refresh ở mục wallet data.</em>
        </div>
      </FAQItem>

      <FAQItem question="Q8: Khi nào số Loyalty Bonus mới 'chốt' và không thay đổi nữa?">
        <div style={walletExplanationDescStyle}>
          <strong>Loyalty Bonus "chốt" khi:</strong>
          <br />
          • <strong>Vesting period kết thúc:</strong> Hết 90 ngày vesting (kể từ 16/12/2024 → 15/3/2025)
          <br />
          • Sau thời điểm này, <strong>không ai có thể early claim nữa</strong> → totalLoyalty và eligiblePool không thay đổi
          <br />
          • Con số Loyalty Bonus của bạn được <strong>xác định cuối cùng</strong>
          <br />
          <br />
          <strong>Timeline:</strong>
          <br />
          • <strong>Unlock Start:</strong> 16/12/2024 (ngày 0)
          <br />
          • <strong>Vesting Duration:</strong> 90 ngày
          <br />
          • <strong>Chốt Loyalty Bonus:</strong> 15/3/2025 (ngày 90)
          <br />
          <br />
          <strong>Sau ngày 90:</strong>
          <br />
          • Bạn có thể claim <strong>maxTokenAmount + Loyalty Bonus</strong> đầy đủ
          <br />
          • Con số này không thay đổi nữa (đã chốt)
          <br />
          • Không còn khái niệm "Early Claim" (tất cả đã vest 100%)
        </div>
      </FAQItem>

      <FAQItem question="Q9: Nếu tôi đã claim một phần trước đó, tool xử lý như thế nào?">
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức Claimable (Regular Claim):</strong>
          <br />
          <br />
          <strong>Trong thời gian vesting:</strong>
          <br />
          claimable = base + vested - claimed
          <br />
          <br />
          <strong>Sau khi vesting hoàn tất:</strong>
          <br />
          claimable = maxTokenAmount + loyaltyBonus - claimed
        </div>
        <div style={walletExplanationDescStyle}>
          <strong>Tool hỗ trợ logic claim nhiều lần (multiple claims).</strong>
          <br />
          <br />
          <strong>Cách tool xử lý:</strong>
          <br />
          1. Tool hiển thị <strong>reward vested tại thời điểm/giai đoạn bạn chọn</strong> (dayT)
          <br />
          2. Nếu bạn đã load wallet data (on-chain), tool sẽ lấy <strong>claimed</strong> từ blockchain
          <br />
          3. Số tokens bạn còn có thể claim = <strong>claimable</strong> (đã trừ claimed tự động)
          <br />
          <br />
          <strong>Nếu bạn đang dùng simulation mode (không nhập ví):</strong>
          <br />
          • Tool giả định <strong>claimed = 0</strong> (chưa claim lần nào)
          <br />
          • Bạn cần <strong>tự tính toán:</strong> Lấy số claimable từ tool - số token đã claim thực tế
          <br />
          <br />
          <strong>Ví dụ:</strong>
          <br />
          • Ngày 30: Tool hiển thị claimable = 5,000 tokens
          <br />
          • Bạn đã claim 2,000 tokens trước đó
          <br />
          • Số còn lại bạn có thể claim = 5,000 - 2,000 = <strong>3,000 tokens</strong>
          <br />
          <br />
          <em>* Trong simulation mode, tool giả định claimed = 0. Bạn cần tự trừ đi số token đã claim để biết số còn lại có thể claim.</em>
        </div>
      </FAQItem>

      <FAQItem question="Q10: Tool có hỗ trợ nhập wallet address không? Những gì tôi có thể tra cứu được?">
        <div style={walletExplanationDescStyle}>
          <strong>CÓ - tool hỗ trợ tra cứu on-chain data của wallet.</strong>
          <br />
          <br />
          <strong>✅ Data có thể tra cứu (on-chain):</strong>
          <br />
          • <strong>Claimed:</strong> Tổng số token bạn đã claim
          <br />
          • <strong>Has Early Claimed:</strong> Bạn đã early claim hay chưa
          <br />
          <br />
          <strong>❌ Data KHÔNG thể tra cứu (off-chain only):</strong>
          <br />
          • <strong>Max Token Allocation:</strong> Tổng reward của bạn (phải xem trên <a href="https://rewards.chain.link/" target="_blank" rel="noopener noreferrer" style={{ color: '#0847F7', textDecoration: 'underline', fontWeight: 600 }}>rewards.chain.link</a>)
          <br />
          • <strong>Merkle Proof:</strong> Chứng minh để claim (do Chainlink quản lý)
          <br />
          • <strong>Base / Bonus breakdown:</strong> Chỉ biết nếu đã claim ít nhất 1 lần
          <br />
          <br />
          <strong>Tại sao không tra được Max Allocation?</strong>
          <br />
          Smart contract sử dụng <strong>Merkle Tree</strong> để verify allocation. Dữ liệu allocation (maxTokenAmount cho mỗi user) được lưu off-chain bởi Chainlink, không public trên blockchain. Contract chỉ lưu merkleRoot (hash) và UserState (claimed, hasEarlyClaimed) sau khi user đã claim.
          <br />
          <br />
          <strong>Cách sử dụng tool:</strong>
          <br />
          1. Nhập wallet address để xem đã claim bao nhiêu
          <br />
          2. Vào <a href="https://rewards.chain.link/" target="_blank" rel="noopener noreferrer" style={{ color: '#0847F7', textDecoration: 'underline', fontWeight: 600 }}>rewards.chain.link</a> để biết maxTokenAmount của bạn
          <br />
          3. Nhập maxTokenAmount vào <strong>Step 2: INPUT MAX TOKEN AMOUNT</strong> để mô phỏng vesting schedule
          <br />
          <br />
          <em>* Tool này phục vụ mục đích giáo dục và mô phỏng. Luôn verify kết quả cuối cùng trên rewards.chain.link trước khi thực hiện claim.</em>
        </div>
      </FAQItem>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders (static content)
export const FAQ = memo(FAQComponent);
