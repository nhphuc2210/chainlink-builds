import { memo } from 'react';
import {
  walletExplanationsContainerStyle,
  walletExplanationsTitleStyle,
  walletExplanationsContentStyle,
  walletExplanationItemStyle,
  walletExplanationMetricStyle,
  walletExplanationFormulaStyle,
  walletExplanationDescStyle
} from '../styles/components.js';

function WalletMetricExplanationsComponent() {
  const isExpanded = true; // Always expanded, no toggle

  return (
    <div style={walletExplanationsContainerStyle} className="animate-fade-in-up animate-delay-5">
      <div style={walletExplanationsTitleStyle}>
        <span>Giải Thích Các Chỉ Số User Wallet</span>
      </div>

      {isExpanded && (
        <div style={walletExplanationsContentStyle}>
          {/* Base */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              base — số token được mở khóa ngay lập tức
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức (on-chain):</strong>
              <br />
              base = maxTokenAmount × baseTokenClaimBps ÷ 10000
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • không bị vest theo thời gian
              <br />
              • claim được ngay khi unlockDelay kết thúc
              <br />
              • không liên quan đến early claim
              <br />
              <br />
              Giống như "tiền trả trước" hoặc "upfront reward".
            </div>
          </div>

          {/* Bonus */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              bonus — phần token bị vest theo thời gian
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức:</strong>
              <br />
              bonus = maxTokenAmount - base
            </div>
            <div style={walletExplanationDescStyle}>
              Đây là phần lớn của allocation, vest tuyến tính theo thời gian unlockDuration.
              <br />
              Đây là "phần thưởng bị khóa", mở dần theo từng giây.
            </div>
          </div>

          {/* Vested */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              vested — phần bonus đã mở khóa theo thời gian
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức on-chain:</strong>
              <br />
              vested = bonus × unlockElapsedDuration ÷ unlockDuration
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • Đây là phần bonus đã được vest, bạn có quyền nhận (nếu không early)
              <br />
              • Tăng tuyến tính theo thời gian
              <br />
              • Sau 100% vest → vested = bonus
              <br />
              <br />
              Đây là phần "đã trưởng thành", không bị mất nếu bạn claim.
            </div>
          </div>

          {/* Claimable */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              claimable — phần bạn có thể claim NGAY tại thời điểm này
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức:</strong>
              <br />
              <br />
              Nếu trong thời gian vesting:
              <br />
              claimable = base + vested - claimed
              <br />
              <br />
              Nếu vesting đã hoàn tất:
              <br />
              claimable = maxTokenAmount + loyaltyBonus - claimed
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • Đây là số token còn lại bạn được nhận, sau khi trừ đi token bạn đã claim trước đó
              <br />
              • Hỗ trợ claim nhiều lần
              <br />
              • Nếu bạn early claim → logic thay đổi, nhưng claimable vẫn chính xác tại thời điểm đó
            </div>
          </div>

          {/* Early Vestable Bonus */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              earlyVestableBonus — phần bonus chưa vest nhưng được phép claim sớm
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức:</strong>
              <br />
              earlyVestableBonus = (bonus - vested) × ratio(timeElapsed)
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • Đây là phần trong bonus CHƯA VEST mà bạn được phép nhận khi early
              <br />
              • Tỷ lệ này phụ thuộc:
              <br />
              &nbsp;&nbsp;- earlyVestRatioMinBps
              <br />
              &nbsp;&nbsp;- earlyVestRatioMaxBps
              <br />
              &nbsp;&nbsp;- % thời gian đã vest
              <br />
              <br />
              Không bao giờ = toàn bộ bonus. Phần còn lại → loyalty pool.
            </div>
          </div>

          {/* Loyalty Bonus */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              loyaltyBonus — phần bạn được chia từ những người early claim
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Công thức:</strong>
              <br />
              loyaltyBonus = maxTokenAmount × totalLoyalty ÷ (config.tokenAmount - totalLoyaltyIneligible)
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • Khi người khác early claim, họ bỏ lại token bonus chưa vest → loyalty pool
              <br />
              • Người "không early" sẽ được chia loyalty pool khi vest kết thúc
              <br />
              • Loyalty chỉ claim được khi vest 100%
              <br />
              <br />
              Nếu bạn early claim → loyaltyBonus luôn = 0.
            </div>
          </div>

          {/* Claimed */}
          <div style={walletExplanationItemStyle}>
            <div style={walletExplanationMetricStyle}>
              claimed — số token bạn đã nhận trước đó
            </div>
            <div style={walletExplanationFormulaStyle}>
              <strong>Giá trị này lấy từ:</strong>
              <br />
              s_userStates[user][seasonId].claimed
            </div>
            <div style={walletExplanationDescStyle}>
              <strong>Ý nghĩa:</strong>
              <br />
              • Số token bạn đã claim trong những lần trước
              <br />
              • Để contract tính được claimable còn lại
              <br />
              • Nếu bạn early → claimed = tất cả những gì bạn đã nhận tại thời điểm đó
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent re-renders (static content)
export const WalletMetricExplanations = memo(WalletMetricExplanationsComponent);

