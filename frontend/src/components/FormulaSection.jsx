import { memo } from 'react';
import {
  formulaNotesStyle,
  formulaNotesTitleStyle,
  formulaNotesToggleStyle,
  formulaNotesContentStyle,
  formulaSectionTitleStyle,
  walletExplanationItemStyle,
  walletExplanationMetricStyle,
  walletExplanationFormulaStyle,
  walletExplanationDescStyle
} from '../styles/components.js';

function FormulaSectionComponent() {
  const isExpanded = true; // Always expanded, no toggle

  return (
    <div style={formulaNotesStyle} className="animate-fade-in-up animate-delay-4">
      <div style={formulaNotesTitleStyle}>
        <span>Giải Thích Các Metrics</span>
      </div>

      {isExpanded && (
        <div style={formulaNotesContentStyle}>
      
      {/* Section 1: Thông tin người dùng */}
      <div style={formulaSectionTitleStyle}>1. Thông Tin Cá Nhân (User Input)</div>
      
      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          maxTokenAmount — Người dùng nhập
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng số tokens bạn được allocation trong chương trình BUILD reward. Đây là con số bạn nhập vào để tính toán, tương ứng với số tokens bạn được phân bổ dựa trên contribution của bạn. Ví dụ: nếu bạn được allocation 10,000 tokens thì nhập 10000.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Current Day — Người dùng chọn (slider)
        </div>
        <div style={walletExplanationDescStyle}>
          Ngày hiện tại trong vesting period (từ 0 đến Vesting Duration). Dùng để mô phỏng xem bạn sẽ nhận được bao nhiêu nếu claim vào ngày đó. Day 0 = ngày bắt đầu vesting.
        </div>
      </div>

      {/* Section 2: Config từ Chainlink */}
      <div style={formulaSectionTitleStyle}>2. Cấu Hình On-Chain (Chainlink Set)</div>
      
      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Cấu hình On-Chain
        </div>
        <div style={walletExplanationDescStyle}>
          Các thông số này được Chainlink team cấu hình trực tiếp trong smart contract trên blockchain. Không thể thay đổi bởi người dùng.
        </div>
      </div>
      
      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Vesting Duration <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain config)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng thời gian của vesting period (tính bằng ngày), được set bởi Chainlink trong smart contract. Ví dụ: 90 ngày nghĩa là tokens sẽ được mở khóa dần trong 90 ngày.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Unlock Start Date <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain config)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Ngày bắt đầu của vesting period, được ghi trên blockchain. Từ ngày này, tokens bắt đầu được vest theo linear schedule. Không thể thay đổi sau khi đã deploy.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Base Claim % (baseTokenClaimBps) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain config)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tỷ lệ phần trăm tokens được mở khóa ngay lập tức (không cần chờ vesting), được Chainlink set trong contract. Ví dụ: 20% (2000 bps) nghĩa là bạn có thể claim 20% số tokens ngay từ Day 0 mà không bị penalty.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Early Vest Ratio Min/Max <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain config)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tỷ lệ early vest bonus được Chainlink cấu hình. Min = tỷ lệ ở đầu vesting, Max = tỷ lệ ở cuối vesting. Ví dụ: 50% → 50% nghĩa là nếu claim sớm, bạn luôn nhận được 50% phần locked (và mất 50% còn lại vào Loyalty Pool).
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Token Pool (tokenAmount) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain state)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng số tokens trong toàn bộ chương trình BUILD, được đọc từ smart contract. Đây là tổng allocation của tất cả participants.
        </div>
      </div>

      {/* Section 3: Các chỉ số tổng hợp */}
      <div style={formulaSectionTitleStyle}>3. Các Chỉ Số Tổng Hợp</div>
      
      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Locked — phần tokens còn bị khóa
        </div>
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Locked = maxTokenAmount - Base - Vested
        </div>
        <div style={walletExplanationDescStyle}>
          Phần tokens còn bị khóa, chưa được vest. Con số này giảm dần theo thời gian và = 0 khi vesting kết thúc.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          TOTAL RECEIVE — tổng số tokens nhận được
        </div>
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          TOTAL = Base + Vested + Early Vest Bonus + Loyalty Bonus
        </div>
        <div style={walletExplanationDescStyle}>
          <strong>Tổng số tokens bạn sẽ nhận được tại thời điểm claim.</strong>
          <br />
          <br />
          <strong>Nếu claim sớm (trước khi vesting kết thúc):</strong>
          <br />
          • TOTAL = Base + Vested + Early Vest Bonus
          <br />
          • Loyalty Bonus = 0 (không đủ điều kiện)
          <br />
          <br />
          <strong>Nếu đợi đến cuối vesting:</strong>
          <br />
          • TOTAL = maxTokenAmount + Loyalty Bonus
          <br />
          • Nhận 100% allocation + phần chia từ Loyalty Pool
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Forfeited to Loyalty Pool — phần tokens bị mất khi early claim
        </div>
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Forfeited = Locked - Early Vest Bonus
        </div>
        <div style={walletExplanationDescStyle}>
          <strong>Số tokens bạn sẽ mất nếu claim sớm.</strong>
          <br />
          <br />
          • Locked = Phần tokens còn bị khóa tại thời điểm claim
          <br />
          • Early Vest Bonus = Phần bạn được nhận từ locked (dựa trên Early Vest Ratio)
          <br />
          <br />
          Phần forfeited này sẽ được chuyển vào Loyalty Pool để thưởng cho những người kiên nhẫn đợi đến cuối.
        </div>
      </div>

      {/* Section 4: Loyalty Pool */}
      <div style={formulaSectionTitleStyle}>4. Loyalty Pool (On-Chain State)</div>
      
      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          totalLoyalty (Token Pool) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain state)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng số tokens hiện có trong Loyalty Pool, được đọc trực tiếp từ smart contract. Pool này tích lũy từ những tokens bị forfeited khi người dùng claim sớm. Con số này tăng dần theo thời gian.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          totalLoyaltyIneligible <span style={{ color: '#9ca3af', fontWeight: 400 }}>(on-chain state)</span>
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng maxTokenAmount của những người đã claim sớm (không đủ điều kiện nhận loyalty). Dùng để tính Eligible Pool.
        </div>
      </div>

      <div style={walletExplanationItemStyle}>
        <div style={walletExplanationMetricStyle}>
          Eligible Pool — tổng tokens đủ điều kiện nhận loyalty
        </div>
        <div style={walletExplanationFormulaStyle}>
          <strong>Công thức:</strong>
          <br />
          Eligible Pool = tokenAmount - totalLoyaltyIneligible
        </div>
        <div style={walletExplanationDescStyle}>
          Tổng số tokens của những người còn đủ điều kiện nhận Loyalty Bonus (chưa claim sớm). Loyalty Bonus của bạn = phần chia theo tỷ lệ allocation của bạn trong pool này.
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent re-renders (static content)
export const FormulaSection = memo(FormulaSectionComponent);

