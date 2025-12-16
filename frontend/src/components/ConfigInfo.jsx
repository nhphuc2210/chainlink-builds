import CountUp from 'react-countup';
import { DEFAULTS } from '../../../config/frontend/defaults.js';
import {
  configInfoStyle,
  configTitleStyle,
  configGridStyle,
  configItemStyle,
  configLabelStyle,
  configValueStyle,
  chainTagStyle,
  simTagStyle,
  dotStyle
} from '../styles/components.js';

export function ConfigInfo({ 
  simulatedConfig, 
  selectedProject, 
  dataSource
}) {
  return (
    <div style={configInfoStyle} className="animate-fade-in-up animate-delay-2">
      <h4 style={configTitleStyle}>
        <span style={dotStyle} className="pulse-dot"></span>
        {selectedProject.ticker} Config Claim Reward{' '}
        <span style={dataSource.mode === 'chain' ? chainTagStyle : simTagStyle}>
          ({dataSource.mode === 'chain' ? 'on-chain data' : dataSource.mode})
        </span>
      </h4>
      <div style={configGridStyle}>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>Base Claim %</span>
          <span style={configValueStyle}>
            <CountUp 
              end={simulatedConfig.baseTokenClaimBps / 100} 
              duration={DEFAULTS.animationDuration}
              decimals={0}
              preserveValue={true}
            />%
          </span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>Early Vest Ratio</span>
          <span style={configValueStyle}>
            <CountUp 
              end={simulatedConfig.earlyVestRatioMinBps / 100} 
              duration={DEFAULTS.animationDuration}
              decimals={0}
              preserveValue={true}
            />% → <CountUp 
              end={simulatedConfig.earlyVestRatioMaxBps / 100} 
              duration={DEFAULTS.animationDuration}
              decimals={0}
              preserveValue={true}
            />%
          </span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>Unlock Start</span>
          <span style={configValueStyle}>{simulatedConfig.unlockStartDate || "Not set"}</span>
        </div>
        <div style={configItemStyle}>
          <span style={configLabelStyle}>Vesting Duration</span>
          <span style={configValueStyle}>
            <CountUp 
              end={simulatedConfig.unlockDurationDays} 
              duration={DEFAULTS.animationDuration}
              decimals={0}
              preserveValue={true}
            />{' '}days
          </span>
        </div>
      </div>
    </div>
  );
}


