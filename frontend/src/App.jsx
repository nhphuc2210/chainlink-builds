import React, { useMemo, useState, useEffect } from "react";
import { BUILD_PROJECTS } from "../../shared/constants/contracts.js";
import { useBlockchainData, generateVestingTimeline, calculateVestingMetrics } from "./hooks/useBlockchainData.js";
import { theme } from "./styles/theme.js";
import { containerStyle, footerStyle } from "./styles/components.js";
import "./styles/animations.css";

// Components
import {
  BlockchainOverlay,
  Header,
  ProjectSelector,
  ConfigInfo,
  GlobalStateInfo,
  SimulationInputs,
  ProgressBar,
  ComparisonCards,
  VestingTable,
  FormulaSection,
  FAQ
} from "./components/index.js";

// Default simulation values
const DEFAULTS = {
  baseTokenClaimBps: 2000, // 20%
  unlockDurationDays: 90,
  earlyVestRatioMinBps: 5000, // 50%
  earlyVestRatioMaxBps: 5000, // 50%
  tokenAmount: 1000000, // 1M tokens
  loyaltyPool: 10000000, // 10M tokens in loyalty pool for simulation
};

export default function App() {
  // Project selection
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const selectedProject = BUILD_PROJECTS[selectedProjectIndex];

  // Fetch blockchain data for selected project
  const { config, globalState, loading, error, refetch } = useBlockchainData(selectedProject);

  // User inputs for simulation (editable freely)
  const [maxTokenAmount, setMaxTokenAmount] = useState(10000);
  const [currentDay, setCurrentDay] = useState(0);
  const [simulateDurationDays, setSimulateDurationDays] = useState(DEFAULTS.unlockDurationDays);
  const [simulateStartDate, setSimulateStartDate] = useState("2025-12-16");
  const [simulateBaseClaimBps, setSimulateBaseClaimBps] = useState(DEFAULTS.baseTokenClaimBps);
  const [simulateEarlyVestMinBps, setSimulateEarlyVestMinBps] = useState(DEFAULTS.earlyVestRatioMinBps);
  const [simulateEarlyVestMaxBps, setSimulateEarlyVestMaxBps] = useState(DEFAULTS.earlyVestRatioMaxBps);
  const [simulateLoyaltyPool, setSimulateLoyaltyPool] = useState(DEFAULTS.loyaltyPool);

  // Detect if on-chain config is set (tokenAmount > 0 means config is properly set)
  const isChainConfigSet = config?.tokenAmount > 0;

  // Track data sources (chain vs simulation) - ALL from chain if config is set, ALL simulation if not
  const dataSource = useMemo(() => {
    if (isChainConfigSet) {
      return {
        mode: 'chain',
        durationDays: 'chain',
        startDate: 'chain',
        baseClaimBps: 'chain',
        earlyVestRatio: 'chain',
        tokenAmount: 'chain',
        loyaltyPool: 'chain',
      };
    }
    return {
      mode: 'simulation',
      durationDays: 'simulation',
      startDate: config?.unlockStartDate ? 'chain' : 'simulation',
      baseClaimBps: 'simulation',
      earlyVestRatio: 'simulation',
      tokenAmount: config?.totalDeposited > 0 ? 'chain' : 'simulation',
      loyaltyPool: 'simulation',
    };
  }, [isChainConfigSet, config]);

  // Use simulated values (user can override blockchain config for simulation)
  const durationDays = simulateDurationDays;
  const startDate = simulateStartDate;
  
  // Sync simulation values when blockchain config loads (only if config is properly set)
  useEffect(() => {
    if (config && isChainConfigSet) {
      // Config is set on-chain, use ALL chain values
      setSimulateDurationDays(config.unlockDurationDays);
      setSimulateBaseClaimBps(config.baseTokenClaimBps);
      setSimulateEarlyVestMinBps(config.earlyVestRatioMinBps);
      setSimulateEarlyVestMaxBps(config.earlyVestRatioMaxBps);
      if (config.unlockStartDate) {
        setSimulateStartDate(config.unlockStartDate);
        // Calculate current day based on today vs unlock start date
        const today = new Date();
        const unlockStart = new Date(config.unlockStartDate);
        const diffTime = today.getTime() - unlockStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        // Set currentDay to calculated value, but not less than 0 and not more than duration
        setCurrentDay(Math.max(0, Math.min(diffDays, config.unlockDurationDays)));
      }
    } else if (config) {
      // Config not set, only sync start date if available
      if (config.unlockStartDate) {
        setSimulateStartDate(config.unlockStartDate);
        // Calculate current day based on today vs unlock start date
        const today = new Date();
        const unlockStart = new Date(config.unlockStartDate);
        const diffTime = today.getTime() - unlockStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        // Set currentDay to calculated value, but not less than 0
        setCurrentDay(Math.max(0, diffDays));
      }
    }
  }, [config, isChainConfigSet]);

  // Create simulated config
  const simulatedConfig = useMemo(() => {
    if (isChainConfigSet) {
      // Config is set on-chain: use ALL chain values (even if some are 0)
      return {
        tokenAmount: config.tokenAmount,
        totalDeposited: config.totalDeposited || 0,
        baseTokenClaimBps: config.baseTokenClaimBps,
        unlockDurationDays: config.unlockDurationDays,
        earlyVestRatioMinBps: config.earlyVestRatioMinBps,
        earlyVestRatioMaxBps: config.earlyVestRatioMaxBps,
        unlockStartDate: config.unlockStartDate || startDate,
      };
    }
    
    // Config NOT set: use simulation values
    const tokenAmount = config?.totalDeposited > 0 
      ? config.totalDeposited 
      : DEFAULTS.tokenAmount;

    return {
      tokenAmount,
      totalDeposited: config?.totalDeposited || 0,
      baseTokenClaimBps: simulateBaseClaimBps,
      unlockDurationDays: durationDays,
      earlyVestRatioMinBps: simulateEarlyVestMinBps,
      earlyVestRatioMaxBps: simulateEarlyVestMaxBps,
      unlockStartDate: startDate,
    };
  }, [config, isChainConfigSet, durationDays, startDate, simulateBaseClaimBps, simulateEarlyVestMinBps, simulateEarlyVestMaxBps]);

  // Create simulated global state (use chain if set, simulation if not)
  const simulatedGlobalState = useMemo(() => {
    if (isChainConfigSet) {
      // Use chain values
      return {
        totalLoyalty: globalState?.totalLoyalty || 0,
        totalLoyaltyIneligible: globalState?.totalLoyaltyIneligible || 0,
        totalClaimed: globalState?.totalClaimed || 0,
      };
    }
    // Use simulated values
    return {
      totalLoyalty: simulateLoyaltyPool,
      totalLoyaltyIneligible: 0, // Assume no one has early claimed yet in simulation
      totalClaimed: globalState?.totalClaimed || 0,
    };
  }, [isChainConfigSet, globalState, simulateLoyaltyPool]);

  // Generate vesting timeline
  const rows = useMemo(() => {
    return generateVestingTimeline({
      maxTokenAmount: Number(maxTokenAmount) || 0,
      config: simulatedConfig,
      globalState: simulatedGlobalState,
      startDate,
    });
  }, [maxTokenAmount, simulatedConfig, simulatedGlobalState, startDate]);

  // Current day metrics
  const currentMetrics = useMemo(() => {
    if (!maxTokenAmount) return null;
    return calculateVestingMetrics({
      maxTokenAmount: Number(maxTokenAmount),
      baseTokenClaimBps: simulatedConfig.baseTokenClaimBps,
      unlockDurationDays: durationDays,
      earlyVestRatioMinBps: simulatedConfig.earlyVestRatioMinBps,
      earlyVestRatioMaxBps: simulatedConfig.earlyVestRatioMaxBps,
      dayT: currentDay,
      totalLoyalty: simulatedGlobalState.totalLoyalty,
      totalLoyaltyIneligible: simulatedGlobalState.totalLoyaltyIneligible,
      tokenAmount: simulatedConfig.tokenAmount,
    });
  }, [maxTokenAmount, simulatedConfig, simulatedGlobalState, currentDay, durationDays]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    const max = Number(maxTokenAmount) || 0;
    if (max === 0 || !currentMetrics) return 0;
    return Math.round((currentMetrics.unlocked / max) * 100);
  }, [currentMetrics, maxTokenAmount]);

  // Reset handler
  const handleReset = () => {
    setMaxTokenAmount(10000);
    // Reset to today's day relative to unlock start
    const today = new Date();
    const unlockStart = new Date(simulateStartDate);
    const diffTime = today.getTime() - unlockStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    setCurrentDay(Math.max(0, Math.min(diffDays, durationDays)));
    setSimulateLoyaltyPool(DEFAULTS.loyaltyPool);
  };

  return (
    <>
      {/* Blockchain Network Overlay */}
      <BlockchainOverlay />
      
      <div style={containerStyle}>
        {/* Header */}
        <Header />

        {/* Project Selector */}
        <ProjectSelector
          projects={BUILD_PROJECTS}
          selectedIndex={selectedProjectIndex}
          onSelect={setSelectedProjectIndex}
          onRefresh={refetch}
          loading={loading}
          error={error}
          config={config}
        />

        {/* Config Info from Blockchain */}
        <ConfigInfo
          simulatedConfig={simulatedConfig}
          selectedProject={selectedProject}
          globalState={globalState}
          dataSource={dataSource}
        />

        {/* Global State Info */}
        <GlobalStateInfo
          simulatedGlobalState={simulatedGlobalState}
          selectedProject={selectedProject}
          dataSource={dataSource}
        />

        {/* Simulation Inputs */}
        <SimulationInputs
          isChainConfigSet={isChainConfigSet}
          config={config}
          globalState={globalState}
          maxTokenAmount={maxTokenAmount}
          setMaxTokenAmount={setMaxTokenAmount}
          currentDay={currentDay}
          setCurrentDay={setCurrentDay}
          durationDays={durationDays}
          simulateLoyaltyPool={simulateLoyaltyPool}
          setSimulateLoyaltyPool={setSimulateLoyaltyPool}
          simulateStartDate={simulateStartDate}
          simulateDurationDays={simulateDurationDays}
          simulateBaseClaimBps={simulateBaseClaimBps}
          simulateEarlyVestMinBps={simulateEarlyVestMinBps}
          simulateEarlyVestMaxBps={simulateEarlyVestMaxBps}
          DEFAULTS={DEFAULTS}
          onReset={handleReset}
        />

        {/* Progress Bar */}
        <ProgressBar
          currentDay={currentDay}
          progressPercent={progressPercent}
        />

        {/* Comparison Summary Cards */}
        <ComparisonCards
          currentDay={currentDay}
          currentMetrics={currentMetrics}
        />

        {/* Table */}
        <VestingTable
          rows={rows}
          currentDay={currentDay}
          selectedProject={selectedProject}
          loading={loading}
        />

        {/* Formula Notes - Vietnamese */}
        <FormulaSection />

        {/* FAQ Section - Vietnamese */}
        <FAQ />

        {/* Footer */}
        <div style={footerStyle} className="footer animate-fade-in-up animate-delay-5">
          By member of VN Chainlink Community • Data from Ethereum Mainnet
        </div>
      </div>
    </>
  );
}

