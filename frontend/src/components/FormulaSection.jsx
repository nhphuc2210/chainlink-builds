import React from 'react';
import {
  formulaNotesStyle,
  formulaNotesTitleStyle,
  formulaSectionStyle,
  formulaSectionTitleStyle,
  formulaItemStyle,
  formulaLabelStyle,
  formulaCodeStyle,
  formulaDescStyle
} from '../styles/components.js';

export function FormulaSection() {
  return (
    <div style={formulaNotesStyle} className="animate-fade-in-up animate-delay-4">
      <h4 style={formulaNotesTitleStyle}>Công Thức Tính Toán</h4>
      
      <div style={formulaSectionStyle}>
        <div style={formulaSectionTitleStyle}>1. Các Giá Trị Cơ Bản</div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Base (Tokens mở khóa ngay)</span>
          <code style={formulaCodeStyle}>= maxTokenAmount × baseClaimBps ÷ 10000</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Bonus (Tokens vesting)</span>
          <code style={formulaCodeStyle}>= maxTokenAmount - Base</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Vested (Đã mở khoá từng phần theo thời gian)</span>
          <code style={formulaCodeStyle}>= Bonus × dayT ÷ unlockDurationDays</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Unlocked (Tổng mở khóa)</span>
          <code style={formulaCodeStyle}>= Base + Vested</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Locked (Còn khóa)</span>
          <code style={formulaCodeStyle}>= maxTokenAmount - Unlocked</code>
        </div>
      </div>

      <div style={formulaSectionStyle}>
        <div style={formulaSectionTitleStyle}>2. Early Vest (Claim Sớm - Chỉ áp dụng trong thời gian vesting)</div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Early Vest Ratio (Tỷ lệ vest sớm)</span>
          <code style={formulaCodeStyle}>= earlyVestRatioMin + (earlyVestRatioMax - earlyVestRatioMin) × dayT ÷ unlockDurationDays</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Early Vestable Bonus (Bonus có thể claim sớm)</span>
          <code style={formulaCodeStyle}>= Locked × Early Vest Ratio</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Forfeited (Mất vào Loyalty Pool)</span>
          <code style={formulaCodeStyle}>= Locked - Early Vestable Bonus</code>
        </div>
      </div>

      <div style={formulaSectionStyle}>
        <div style={formulaSectionTitleStyle}>3. Loyalty Bonus (Phần thưởng trung thành)</div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Loyalty Bonus (Ước tính nếu đợi đến cuối)</span>
          <code style={formulaCodeStyle}>= maxTokenAmount × totalLoyalty ÷ (tokenAmount - totalLoyaltyIneligible)</code>
        </div>
        <div style={formulaDescStyle}>
          * totalLoyalty: Tổng tokens bị forfeited từ những người claim sớm<br/>
          * totalLoyaltyIneligible: Tổng maxTokenAmount của những người đã claim sớm (không đủ điều kiện nhận loyalty)
        </div>
      </div>

      <div style={formulaSectionStyle}>
        <div style={formulaSectionTitleStyle}>4. Tổng Kết</div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Total If Early Claim (Tổng nếu claim sớm)</span>
          <code style={formulaCodeStyle}>= Unlocked + Early Vestable Bonus</code>
        </div>
        <div style={formulaItemStyle}>
          <span style={formulaLabelStyle}>Total If Wait (Tổng nếu đợi đến cuối)</span>
          <code style={formulaCodeStyle}>= maxTokenAmount + Loyalty Bonus</code>
        </div>
        <div style={formulaDescStyle}>
          * Sau khi vesting kết thúc (dayT ≥ unlockDurationDays): Early Claim = Wait (không còn penalty)
        </div>
      </div>
    </div>
  );
}

