import { memo } from 'react';
import { 
  headerStyle, 
  logoStyle, 
  titleStyle, 
  badgeStyle, 
  howToUseContainerStyle,
  howToUseTitleStyle,
  howToUseListStyle,
  howToUseItemStyle
} from '../styles/components.js';

function HeaderComponent() {
  return (
    <>
      <div style={headerStyle} className="animate-fade-in-up">
        <div style={logoStyle} className="logo">
          <img src="/hexagon.svg" alt="Chainlink" width="32" height="32" />
        </div>
        <h1 style={titleStyle} className="title">BUILD Reward Calculator</h1>
        <span style={badgeStyle} className="badge">On-chain Logic</span>
      </div>
      
      <div style={howToUseContainerStyle} className="animate-fade-in-up animate-delay-1">
        <div style={howToUseTitleStyle}>How to use:</div>
        <div style={howToUseListStyle}>
          <div style={howToUseItemStyle}>• Step 1: Select build project to load config</div>
          <div style={howToUseItemStyle}>• Step 2: Input max token amount (your expected reward allocation)</div>
          <div style={howToUseItemStyle}>• Step 3: Choose simulate day and view results below</div>
        </div>
      </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const Header = memo(HeaderComponent);

