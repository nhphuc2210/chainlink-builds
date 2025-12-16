import CountUp from 'react-countup';
import { DEFAULTS } from '../../../config/frontend/defaults.js';
import {
  globalStateInfoStyle,
  globalStateTitleStyle,
  globalStateGridStyle,
  globalStateItemStyle,
  globalStateLabelStyle,
  globalStateValueStyle,
  chainTagStyle,
  simTagStyle,
  chainTagTitleStyle,
  simTagTitleStyle,
  dotStyle
} from '../styles/components.js';

export function GlobalStateInfo({ 
  simulatedGlobalState, 
  selectedProject, 
  dataSource,
  simulatedConfig 
}) {
  return (
    <div style={globalStateInfoStyle} className="animate-fade-in-up animate-delay-2">
      <h4 style={globalStateTitleStyle}>
        <span style={dotStyle} className="pulse-dot"></span>
        Global Loyalty Pool{' '}
        <span style={dataSource.loyaltyPool === 'chain' ? chainTagStyle : simTagStyle}>
          ({dataSource.loyaltyPool === 'chain' ? 'on-chain data' : dataSource.loyaltyPool})
        </span>
      </h4>
      <div style={globalStateGridStyle}>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Token Pool</span>
          <span style={globalStateValueStyle}>
            <CountUp 
              end={simulatedConfig.tokenAmount} 
              duration={DEFAULTS.animationDuration}
              separator=","
              decimals={0}
              preserveValue={true}
            />{' '}{selectedProject.ticker}
          </span>
        </div>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Claimed</span>
          <span style={globalStateValueStyle}>
            <CountUp 
              end={simulatedGlobalState.totalClaimed} 
              duration={DEFAULTS.animationDuration}
              separator=","
              decimals={0}
              preserveValue={true}
            />{' '}{selectedProject.ticker}
          </span>
        </div>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Loyalty (Forfeited)</span>
          <span style={globalStateValueStyle}>
            <CountUp 
              end={simulatedGlobalState.totalLoyalty} 
              duration={DEFAULTS.animationDuration}
              separator=","
              decimals={0}
              preserveValue={true}
            />{' '}{selectedProject.ticker}
          </span>
        </div>
        <div style={globalStateItemStyle}>
          <span style={globalStateLabelStyle}>Total Ineligible (Early Claimers)</span>
          <span style={globalStateValueStyle}>
            <CountUp 
              end={simulatedGlobalState.totalLoyaltyIneligible} 
              duration={DEFAULTS.animationDuration}
              separator=","
              decimals={0}
              preserveValue={true}
            />{' '}{selectedProject.ticker}
          </span>
        </div>
      </div>
    </div>
  );
}

