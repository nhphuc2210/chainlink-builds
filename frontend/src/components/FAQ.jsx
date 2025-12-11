import React from 'react';
import { theme } from '../styles/theme.js';
import {
  faqContainerStyle,
  faqTitleStyle,
  faqItemStyle,
  faqQuestionStyle,
  faqAnswerStyle,
  faqCodeStyle,
  faqListStyle
} from '../styles/components.js';

export function FAQ() {
  return (
    <div style={faqContainerStyle} className="animate-fade-in-up animate-delay-4">
      <h4 style={faqTitleStyle}>❓ Câu Hỏi Thường Gặp (FAQ)</h4>
      
      <div style={faqItemStyle}>
        <div style={faqQuestionStyle}>Q1: Có được claim nhiều lần không?</div>
        <div style={faqAnswerStyle}>
          <p><strong style={{ color: theme.accentGreen }}>Regular claim (không early):</strong> CÓ - bạn có thể claim nhiều lần khi tokens dần dần vest theo thời gian. Mỗi lần claim sẽ nhận: <code style={faqCodeStyle}>Base + Vested - đã claimed</code>. Base được mở khóa ngay từ đầu, Vested tăng dần theo thời gian.</p>
          <p><strong style={{ color: theme.accentOrange }}>Early claim:</strong> Là một <strong>lựa chọn riêng</strong> khi claim - user phải chọn option "Early Claim" khi submit transaction. CHỈ ĐƯỢC 1 LẦN - sau khi early claim, trạng thái <code style={faqCodeStyle}>hasEarlyClaimed = true</code> và bạn không thể claim thêm nữa. Phần locked còn lại (forfeited) sẽ vào Loyalty Pool.</p>
          <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}><em>* Lưu ý: Claim trong 90 ngày KHÔNG tự động là early claim. Early claim là option riêng biệt, cho phép nhận thêm Early Bonus từ phần locked, nhưng đổi lại mất quyền nhận Loyalty Bonus.</em></p>
        </div>
      </div>

      <div style={faqItemStyle}>
        <div style={faqQuestionStyle}>Q2: Early Bonus là gì? Được tính như thế nào?</div>
        <div style={faqAnswerStyle}>
          <p>Early Bonus (Early Vestable Bonus) là phần thưởng cho phép bạn claim một phần tokens đang bị lock trước thời hạn.</p>
          <p><strong>Công thức:</strong> <code style={faqCodeStyle}>Early Vestable Bonus = Locked × Early Vest Ratio</code></p>
          <p>Early Vest Ratio tăng dần theo thời gian từ <code style={faqCodeStyle}>earlyVestRatioMin</code> đến <code style={faqCodeStyle}>earlyVestRatioMax</code>. Càng gần cuối vesting, Early Bonus càng cao.</p>
        </div>
      </div>

      <div style={faqItemStyle}>
        <div style={faqQuestionStyle}>Q3: Early claim rồi có được nhận Loyalty Bonus không?</div>
        <div style={faqAnswerStyle}>
          <p><strong style={{ color: theme.accentRed }}>KHÔNG.</strong> Khi bạn early claim, <code style={faqCodeStyle}>maxTokenAmount</code> của bạn được thêm vào <code style={faqCodeStyle}>totalLoyaltyIneligible</code>.</p>
          <p>Điều này loại bạn ra khỏi pool chia Loyalty Bonus. Chỉ những người đợi đến cuối vesting mới được nhận Loyalty Bonus.</p>
        </div>
      </div>

      <div style={faqItemStyle}>
        <div style={faqQuestionStyle}>Q4: Loyalty Pool từ đâu mà có?</div>
        <div style={faqAnswerStyle}>
          <p>Loyalty Pool được hình thành từ phần tokens bị <strong>forfeited</strong> của những người early claim.</p>
          <p><strong>Công thức:</strong> <code style={faqCodeStyle}>Forfeited = Locked - Early Vestable Bonus</code></p>
          <p>Phần forfeited này được cộng vào <code style={faqCodeStyle}>totalLoyalty</code> và chia đều cho những người đợi đến cuối theo tỷ lệ maxTokenAmount của họ.</p>
        </div>
      </div>

      <div style={faqItemStyle}>
        <div style={faqQuestionStyle}>Q5: Sau khi vesting kết thúc thì sao?</div>
        <div style={faqAnswerStyle}>
          <p>Khi vesting kết thúc (dayT ≥ unlockDurationDays):</p>
          <ul style={faqListStyle}>
            <li>Tất cả tokens đều <strong>unlocked</strong>, không còn penalty</li>
            <li>Early Claim = Wait (cùng số lượng nhận được)</li>
            <li>Bạn nhận được full <code style={faqCodeStyle}>maxTokenAmount + Loyalty Bonus</code></li>
            <li>Không còn khái niệm Early Vest Bonus nữa (locked = 0)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

