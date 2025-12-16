import { theme } from './theme.js';

// ============================================
// TYPOGRAPHY SYSTEM - Chainlink Official Style
// ============================================
// Font Family: Circular (body), TASA Orbiter VF (headings)
// Page title: 32px, weight 600, TASA Orbiter VF
// Section title: 24px, weight 600, TASA Orbiter VF
// Body text: 16px, weight 400-500
// Labels: 12px, weight 500-600, uppercase
// Values: 16px, weight 600
// Large values: 24px, weight 700
// Code: 14px, monospace
// ============================================

// Container & Layout
export const containerStyle = {
  padding: "32px 24px",
  fontFamily: "'Circular', 'Inter', Tahoma, sans-serif",
  maxWidth: 1440,
  margin: "0 auto",
  minHeight: "100vh",
  fontSize: 16, // Chainlink base font size
  lineHeight: 1.5,
  color: theme.textSecondary,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

// Header
export const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 8,
};

export const logoStyle = {
  display: "flex",
  alignItems: "center",
};

export const titleStyle = {
  fontSize: 32,
  fontWeight: 600,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.textPrimary,
  margin: 0,
  letterSpacing: "-0.5px",
  lineHeight: 1.3,
};

export const badgeStyle = {
  background: theme.accentBlue,
  color: "#ffffff",
  padding: "6px 14px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

export const descriptionStyle = {
  marginBottom: 24,
  color: theme.textSecondary,
  fontSize: 16,
  lineHeight: 1.5,
};

// How to Use Section - Styled like SXT Config
export const howToUseContainerStyle = {
  marginBottom: 24,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
  paddingBottom: 20,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid ${theme.accentBlue}`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
  borderRadius: 8,
};

export const howToUseTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: theme.accentBlue,
  marginBottom: 12,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  letterSpacing: '-0.3px',
};

export const howToUseListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export const howToUseItemStyle = {
  fontSize: 15,
  lineHeight: 1.6,
  color: theme.textPrimary,
  fontWeight: 500,
};

// Project Selector
export const projectSelectorStyle = {
  marginBottom: 20,
};

export const selectWrapperStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

export const selectContainerStyle = {
  position: "relative",
  flex: 1,
  maxWidth: 420,
};

export const selectStyle = {
  width: "100%",
  padding: "14px 48px 14px 16px",
  borderRadius: 4,
  border: `2px solid ${theme.borderSubtle}`,
  background: `linear-gradient(135deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)`,
  color: theme.textPrimary,
  fontSize: 14,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  transition: "all 0.25s ease",
  boxShadow: theme.cardShadow,
};

export const selectChevronStyle = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: theme.textSecondary,
  transition: "all 0.25s ease",
};

export const refreshButtonStyle = {
  width: 48,
  height: 48,
  padding: 0,
  borderRadius: 4,
  border: "none",
  background: `linear-gradient(135deg, ${theme.accentBlue} 0%, #3366ff 100%)`,
  color: "#ffffff",
  fontSize: 20,
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(8, 71, 247, 0.3)",
};

// Inline status indicator styles
export const inlineStatusStyle = {
  minWidth: 100,
  display: "flex",
  alignItems: "center",
};

export const inlineLoadingStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentBlue,
  padding: "6px 12px",
  borderRadius: 4,
  background: "#eff6ff",
  animation: "pulse 1.5s ease-in-out infinite",
};

export const inlineSuccessStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentGreen,
  padding: "6px 12px",
  borderRadius: 4,
  background: "#ecfdf5",
};

export const inlineErrorStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentRed,
  padding: "6px 12px",
  borderRadius: 4,
  background: "#fef2f2",
};

// Disclaimer Banner Styles
export const disclaimerBannerStyle = {
  marginBottom: 24,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
  paddingBottom: 20,
  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  borderLeft: `4px solid #fbbf24`,
  borderTop: `1px solid #fef3c7`,
  borderBottom: `1px solid #fef3c7`,
  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
  position: 'relative',
};

export const disclaimerContentStyle = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  maxWidth: 1200,
  margin: '0 auto',
  color: '#92400e',
};

export const disclaimerTextStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  color: '#92400e',
  margin: 0,
};

export const disclaimerLinkStyle = {
  color: '#d97706',
  textDecoration: 'underline',
  fontWeight: 600,
  transition: 'color 0.2s',
};

export const disclaimerToggleButtonStyle = {
  marginTop: 12,
  padding: '8px 12px',
  background: 'rgba(254, 243, 199, 0.5)',
  border: '1px solid #fde68a',
  borderRadius: 4,
  color: '#92400e',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.2s',
};

export const disclaimerExpandedStyle = {
  marginTop: 12,
  padding: 16,
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: 6,
  border: '1px solid #fde68a',
};

export const disclaimerOfficialTextStyle = {
  fontSize: 12,
  lineHeight: 1.7,
  color: '#78350f',
  margin: 0,
};

// Close button for disclaimer banner
export const closeButtonStyle = {
  position: 'absolute',
  top: 16,
  right: 24,
  background: 'rgba(146, 64, 14, 0.1)',
  border: '1px solid rgba(146, 64, 14, 0.2)',
  borderRadius: 4,
  padding: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#92400e',
  transition: 'all 0.2s ease',
  zIndex: 10,
};

export const closeButtonHoverStyle = {
  background: 'rgba(146, 64, 14, 0.2)',
  borderColor: '#92400e',
  transform: 'scale(1.05)',
};

// Success popup notification
export const successPopupStyle = {
  position: 'fixed',
  top: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#3366ff',
  opacity: 0,
  color: '#ffffff',
  padding: '18px 28px',
  borderRadius: 2,
  boxShadow: '0 8px 32px rgba(51, 102, 255, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  zIndex: 9999,
  width: 560,
  maxWidth: '90vw',
  textAlign: 'center',
  transition: 'opacity 0.4s ease-in-out',
};

export const successPopupVisibleStyle = {
  opacity: 1,
};


// Config Info - ENHANCED for prominence
export const configInfoStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

export const configTitleStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
};

export const chainTagStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentBlue,
  verticalAlign: "baseline",
  lineHeight: 1,
};

export const simTagStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentOrange,
  verticalAlign: "baseline",
  lineHeight: 1,
};

// Title tag styles (larger for use in section titles)
export const chainTagTitleStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: theme.accentBlue,
};

export const simTagTitleStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: theme.accentOrange,
};

export const configGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 20,
  alignItems: "start",
};

export const configItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export const configLabelStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
  fontWeight: 500,
  minHeight: 32,
  lineHeight: 1.4,
  display: "flex",
  alignItems: "flex-start",
};

export const configValueStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Input Grid
export const inputGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
  marginBottom: 24,
};

export const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
};

export const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: theme.textSecondary,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 4,
  border: `2px solid ${theme.borderSubtle}`,
  background: theme.inputBg,
  color: theme.textPrimary,
  fontSize: 16,
  fontWeight: 500,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export const inputHintStyle = {
  fontSize: 14,
  color: theme.textMuted,
  marginTop: 8,
};

export const rangeStyle = {
  marginTop: 8,
  width: "100%",
  accentColor: theme.accentBlue,
};

// Simulation Header
export const simulationHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
  padding: "14px 20px",
  borderRadius: 4,
  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  border: `1px solid ${theme.accentOrange}`,
};

export const simulationTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.accentOrange,
};

export const simulationHintStyle = {
  fontSize: 14,
  color: theme.textSecondary,
};

export const resetButtonStyle = {
  padding: "6px 16px",
  borderRadius: 4,
  border: `1px solid ${theme.border}`,
  background: theme.bgCard,
  color: theme.textSecondary,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// Spinner
export const spinnerContainerStyle = {
  display: "flex",
  alignItems: "center",
  marginTop: 12,
};

export const spinnerStyle = {
  width: 20,
  height: 20,
  border: `2px solid ${theme.borderSubtle}`,
  borderTopColor: theme.accentBlue,
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

// Progress Bar
export const progressContainerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 24,
  paddingBottom: 24,
  background: theme.bgSecondary,
  borderTop: `1px solid ${theme.borderSubtle}`,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const progressLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  fontSize: 16,
  color: theme.textSecondary,
  lineHeight: 1.5,
};

export const progressBarBgStyle = {
  height: 12,
  background: theme.bgCard,
  borderRadius: 6,
  overflow: "hidden",
  border: `1px solid ${theme.borderSubtle}`,
};

export const progressBarFillStyle = {
  height: "100%",
  background: `linear-gradient(90deg, ${theme.accentBlue} 0%, #3366ff 100%)`,
  borderRadius: 6,
  transition: "width 0.5s ease-out",
};

// Comparison Cards
export const comparisonContainerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
  overflow: "hidden",
};

export const comparisonTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
};

export const comparisonGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 24,
};

export const comparisonCardStyle = {
  padding: "24px",
  borderRadius: 4,
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.cardShadow,
};

export const comparisonCardHighlightStyle = {
  borderLeft: `3px solid ${theme.accentBlue}`,
  background: "#f0f4ff",
};

export const comparisonCardHeaderStyle = {
  marginBottom: 16,
  paddingBottom: 14,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const comparisonCardTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const comparisonCardBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export const comparisonRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 16,
  color: theme.textSecondary,
  lineHeight: 1.5,
};

export const comparisonRowDividerStyle = {
  height: 1,
  background: theme.borderSubtle,
  margin: "8px 0",
};

export const comparisonRowTotalStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Summary Box
export const summaryBoxStyle = {
  flex: "1 1 160px",
  padding: "24px",
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.cardShadow,
};

export const summaryBoxHighlightStyle = {
  background: "#f0f4ff",
  borderLeft: `3px solid ${theme.accentBlue}`,
};

export const summaryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

export const summaryLabelStyle = {
  fontSize: 14,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
  fontWeight: 500,
};

export const summaryValueStyle = {
  fontSize: 28,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  letterSpacing: "-0.5px",
};

export const summaryTickerStyle = {
  fontSize: 14,
  color: theme.textMuted,
  marginTop: 6,
};

// Table
export const tableSectionStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

export const tableHeaderTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
};

export const dotStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  minWidth: "12px",
  minHeight: "12px",
  flexShrink: 0,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #375BD2 0%, #2563eb 100%)",
  border: "2px solid white",
  // Removed boxShadow from inline style - let CSS animation control it
};

export const emptyStateStyle = {
  color: theme.textMuted,
  padding: "48px 24px",
  textAlign: "center",
  fontSize: 16,
  lineHeight: 1.5,
  background: theme.bgCard,
  borderRadius: 8,
  border: `1px solid ${theme.borderSubtle}`,
  boxShadow: theme.cardShadow,
};

export const tableWrapperStyle = {
  maxHeight: 600,
  overflow: "auto",
  borderRadius: 8,
  border: `1px solid ${theme.borderSubtle}`,
  background: theme.bgPrimary,
  boxShadow: theme.cardShadow,
};

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
  lineHeight: 1.5,
};

export const thStyle = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: `1px solid ${theme.borderSubtle}`,
  background: theme.tableHeaderBg,
  color: theme.textSecondary,
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  position: "sticky",
  top: 0,
  zIndex: 1,
  whiteSpace: "nowrap",
};

export const thStyleHighlight = {
  ...thStyle,
  background: "#fff7ed",
  color: theme.accentOrange,
};

export const thStyleBlue = {
  ...thStyle,
  background: "#eff6ff",
  color: theme.accentBlue,
};

export const tdStyle = {
  padding: "10px",
  borderBottom: `1px solid ${theme.borderSubtle}`,
  whiteSpace: "nowrap",
  color: theme.textPrimary,
  fontSize: 14,
};

export const tdStyleDate = {
  ...tdStyle,
  color: theme.textSecondary,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 13,
};

export const tdStyleMuted = {
  ...tdStyle,
  color: theme.textMuted,
};

export const tdStyleHighlight = {
  ...tdStyle,
  color: theme.accentOrange,
  fontWeight: 500,
};

export const tdStyleGreen = {
  ...tdStyle,
  color: theme.accentGreen,
  fontWeight: 500,
};

export const tdStyleOrange = {
  ...tdStyle,
  color: theme.accentOrange,
  fontWeight: 600,
  background: "#fffbeb",
};

export const tdStyleRed = {
  ...tdStyle,
  color: theme.accentRed,
};

export const tdStyleBlue = {
  ...tdStyle,
  color: theme.accentBlue,
  fontWeight: 600,
  background: "#eff6ff",
};

export const trEvenStyle = {
  background: theme.bgPrimary,
};

export const trOddStyle = {
  background: theme.bgSecondary,
};

export const trHighlightStyle = {
  background: "#eff6ff",
  boxShadow: "inset 0 0 0 2px " + theme.accentBlue,
};

// Global State
export const globalStateInfoStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

export const globalStateTitleStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
};

export const globalStateGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 20,
  alignItems: "start",
};

export const globalStateItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export const globalStateLabelStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
  fontWeight: 500,
  minHeight: 32,
  lineHeight: 1.4,
  display: "flex",
  alignItems: "flex-start",
};

export const globalStateValueStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Formula Notes - Full width, no card boxing
export const formulaNotesStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

export const formulaNotesTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
  cursor: "pointer",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "background 0.2s ease",
};

export const formulaNotesToggleStyle = {
  fontSize: 14,
  color: theme.textMuted,
};

export const formulaNotesContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

export const formulaSectionStyle = {
  marginBottom: 24,
  paddingBottom: 24,
  borderBottom: `1px solid ${theme.border}`,
};

export const formulaSectionTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.accentBlue,
  marginBottom: 16,
  padding: "12px 14px",
  borderLeft: `3px solid ${theme.accentBlue}`,
  background: "linear-gradient(90deg, #eff6ff 0%, transparent 100%)",
  display: "block",
  lineHeight: 1.2,
};

export const formulaItemStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  gap: 10,
  marginTop: 12,
};

export const formulaLabelStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
  minWidth: 200,
  paddingBottom: 6,
  borderBottom: `1px dashed ${theme.borderSubtle}`,
};

export const formulaCodeStyle = {
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  background: "#DFE7FB",
  padding: "4px 10px",
  borderRadius: 4,
  color: theme.textPrimary,
  border: `1px solid ${theme.borderSubtle}`,
};

export const formulaDescStyle = {
  fontSize: 16,
  color: theme.textSecondary,
  marginTop: 8,
  marginBottom: 14,
  lineHeight: 1.5,
  paddingLeft: 17,
};

// FAQ Section - Full width, no card boxing
export const faqContainerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 28,
  paddingBottom: 28,
  background: `linear-gradient(135deg, ${theme.bgSecondary} 0%, #E8EFFD 100%)`,
  borderTop: `2px solid #E8EFFD`,
  borderBottom: `2px solid #E8EFFD`,
  borderLeft: `4px solid #E8EFFD`,
  boxShadow: `0 8px 24px rgba(8, 71, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
  position: 'relative',
};

export const faqTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
  cursor: "pointer",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "background 0.2s ease",
};

export const faqToggleStyle = {
  fontSize: 14,
  color: theme.textMuted,
};

export const faqContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

export const faqItemStyle = {
  marginBottom: 24,
  paddingBottom: 24,
  borderBottom: `1px solid ${theme.border}`,
};

export const faqQuestionStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.accentBlue,
  marginBottom: 14,
  padding: "12px 14px",
  borderLeft: `3px solid ${theme.accentBlue}`,
  background: "linear-gradient(90deg, #eff6ff 0%, transparent 100%)",
  display: "block",
  lineHeight: 1.2,
};

export const faqAnswerStyle = {
  fontSize: 16,
  color: theme.textSecondary,
  lineHeight: 1.5,
  textAlign: "left",
  paddingLeft: 17,
};

export const faqParagraphStyle = {
  marginBottom: 14,
  marginTop: 0,
};

export const faqCodeStyle = {
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  background: "#DFE7FB",
  padding: "4px 10px",
  borderRadius: 4,
  color: theme.textPrimary,
  border: `1px solid ${theme.borderSubtle}`,
};

export const faqListStyle = {
  margin: "10px 0",
  paddingLeft: 24,
  lineHeight: 1.6,
};

// Footer
export const footerStyle = {
  textAlign: "center",
  color: theme.textMuted,
  fontSize: 14,
  paddingTop: 24,
  borderTop: `1px solid ${theme.borderSubtle}`,
};

// =============================================================================
// Wallet Input Styles
// =============================================================================
export const walletInputContainerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 24,
  paddingBottom: 24,
  background: theme.bgSecondary,
  borderTop: `1px solid ${theme.borderSubtle}`,
  borderBottom: `1px solid ${theme.borderSubtle}`,
  position: 'relative',
  zIndex: 100,
};

export const walletInputTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 20,
  fontWeight: 600,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.textPrimary,
};

export const walletInputFieldsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: 16,
  alignItems: "end",
};

export const walletInputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

export const walletInputLabelStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: theme.textSecondary,
};

export const walletInputFieldStyle = {
  padding: "10px 14px",
  fontSize: 15,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  background: theme.bgPrimary,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

export const walletLoadButtonStyle = {
  padding: "10px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: theme.bgPrimary,
  background: theme.accentBlue,
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

export const walletLoadButtonDisabledStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};

export const walletErrorStyle = {
  marginTop: 12,
  padding: 12,
  background: "#fee",
  border: `1px solid ${theme.error}`,
  borderRadius: 4,
  color: theme.error,
  fontSize: 14,
};

export const walletLoadingStyle = {
  marginTop: 12,
  padding: 12,
  background: "#eff6ff",
  border: `1px solid ${theme.accentBlue}`,
  borderRadius: 4,
  color: theme.accentBlue,
  fontSize: 14,
};

// =============================================================================
// Wallet Claim Info Styles
// =============================================================================
export const walletClaimContainerStyle = {
  background: "#f0fff4",
  border: `2px solid ${theme.accentGreen}`,
  borderRadius: 8,
  padding: 24,
  marginBottom: 32,
};

export const walletClaimHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const walletClaimTitleStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: theme.accentGreen,
};

export const walletClaimAddressStyle = {
  fontSize: 14,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  color: theme.textMuted,
  background: theme.bgSecondary,
  padding: "4px 12px",
  borderRadius: 4,
};

export const walletClaimGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
};

export const walletClaimItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

export const walletClaimLabelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: theme.textMuted,
};

export const walletClaimValueStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: theme.textPrimary,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

// =============================================================================
// Wallet Metric Explanations Styles
// =============================================================================
export const walletExplanationsContainerStyle = {
  marginBottom: 32,
  marginLeft: -24,
  marginRight: -24,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 32,
  paddingBottom: 8,
  background: theme.bgSecondary,
  borderTop: `1px solid ${theme.borderSubtle}`,
  borderBottom: `1px solid ${theme.borderSubtle}`,
  overflow: "hidden",
};

export const walletExplanationsTitleStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "'TASA Orbiter VF', 'Inter', sans-serif",
  color: theme.accentBlue,
  letterSpacing: '-0.3px',
  cursor: "pointer",
  transition: "background 0.2s ease",
};

export const walletExplanationsToggleStyle = {
  fontSize: 14,
  color: theme.textMuted,
};

export const walletExplanationsContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

export const walletExplanationItemStyle = {
  marginBottom: 24,
  paddingBottom: 24,
  padding: 20,
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  boxShadow: theme.cardShadow,
};

export const walletExplanationMetricStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: theme.accentBlue,
  marginBottom: 12,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

export const walletExplanationFormulaStyle = {
  fontSize: 14,
  color: theme.textSecondary,
  background: "#eff6ff",
  padding: 12,
  borderRadius: 4,
  marginBottom: 12,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  lineHeight: 1.6,
};

export const walletExplanationDescStyle = {
  fontSize: 15,
  color: theme.textSecondary,
  lineHeight: 1.6,
};

