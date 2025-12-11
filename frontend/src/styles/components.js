import { theme } from './theme.js';

// Container & Layout
export const containerStyle = {
  padding: "32px 24px",
  fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
  maxWidth: 1400,
  margin: "0 auto",
  minHeight: "100vh",
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
  fontSize: 28,
  fontWeight: 700,
  color: theme.textPrimary,
  margin: 0,
  letterSpacing: "-0.5px",
};

export const badgeStyle = {
  background: theme.accentBlue,
  color: "#ffffff",
  padding: "6px 14px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const descriptionStyle = {
  marginBottom: 24,
  color: theme.textSecondary,
  fontSize: 15,
  lineHeight: 1.6,
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
  padding: "14px 48px 14px 18px",
  borderRadius: 12,
  border: `2px solid ${theme.borderSubtle}`,
  background: `linear-gradient(135deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)`,
  color: theme.textPrimary,
  fontSize: 15,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  transition: "all 0.25s ease",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${theme.accentBlue} 0%, #4f7dff 100%)`,
  color: "#ffffff",
  fontSize: 20,
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(42, 90, 218, 0.3)",
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
  borderRadius: 6,
  background: "#eff6ff",
  animation: "pulse 1.5s ease-in-out infinite",
};

export const inlineSuccessStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentGreen,
  padding: "6px 12px",
  borderRadius: 6,
  background: "#ecfdf5",
};

export const inlineErrorStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: theme.accentRed,
  padding: "6px 12px",
  borderRadius: 6,
  background: "#fef2f2",
};

// Config Info
export const configInfoStyle = {
  marginBottom: 24,
  padding: "20px 24px",
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.borderSubtle}`,
  boxShadow: theme.cardShadow,
};

export const configTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 12,
  fontSize: 13,
  fontWeight: 600,
  color: theme.textPrimary,
};

export const chainTagStyle = {
  fontSize: 9,
  fontWeight: 500,
  color: theme.accentGreen,
};

export const simTagStyle = {
  fontSize: 9,
  fontWeight: 500,
  color: theme.accentOrange,
};

export const configGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 16,
};

export const configItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

export const configLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
};

export const configValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Input Grid
export const inputGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 24,
};

export const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
};

export const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: theme.textSecondary,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: `1px solid ${theme.borderSubtle}`,
  background: theme.inputBg,
  color: theme.textPrimary,
  fontSize: 16,
  fontWeight: 500,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export const inputHintStyle = {
  fontSize: 12,
  color: theme.textMuted,
  marginTop: 6,
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
  marginBottom: 12,
  padding: "12px 16px",
  borderRadius: 8,
  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  border: `1px solid ${theme.accentOrange}`,
};

export const simulationTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.accentOrange,
};

export const simulationHintStyle = {
  fontSize: 12,
  color: theme.textSecondary,
};

export const resetButtonStyle = {
  padding: "4px 12px",
  borderRadius: 6,
  border: `1px solid ${theme.border}`,
  background: theme.bgCard,
  color: theme.textSecondary,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: 4,
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
  marginBottom: 24,
};

export const progressLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  fontSize: 13,
  color: theme.textSecondary,
};

export const progressBarBgStyle = {
  height: 10,
  background: "#e5e7eb",
  borderRadius: 5,
  overflow: "hidden",
};

export const progressBarFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #2a5ada 0%, #4f7dff 100%)",
  borderRadius: 5,
  transition: "width 0.5s ease-out",
};

// Comparison Cards
export const comparisonContainerStyle = {
  marginBottom: 24,
  padding: 0,
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.cardShadow,
  overflow: "hidden",
};

export const comparisonTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "16px 20px",
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
  borderBottom: `1px solid ${theme.border}`,
  margin: 0,
};

export const comparisonGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 0,
};

export const comparisonCardStyle = {
  padding: "20px",
  borderRadius: 0,
  background: theme.bgCard,
  border: "none",
  borderRight: `1px solid ${theme.border}`,
};

export const comparisonCardHighlightStyle = {
  borderRight: "none",
  borderLeft: `2px solid ${theme.accentBlue}`,
  background: "#f0f4ff",
};

export const comparisonCardHeaderStyle = {
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const comparisonCardTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const comparisonCardBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

export const comparisonRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14,
  color: theme.textSecondary,
};

export const comparisonRowDividerStyle = {
  height: 1,
  background: theme.borderSubtle,
  margin: "4px 0",
};

export const comparisonRowTotalStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Summary Box
export const summaryBoxStyle = {
  flex: "1 1 140px",
  padding: "20px 24px",
  borderRadius: 0,
  background: theme.bgCard,
  border: "none",
  borderRight: `1px solid ${theme.border}`,
};

export const summaryBoxHighlightStyle = {
  background: "#f0f4ff",
  borderRight: "none",
  borderLeft: `2px solid ${theme.accentBlue}`,
};

export const summaryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
};

export const summaryLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
};

export const summaryValueStyle = {
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: "-0.5px",
};

export const summaryTickerStyle = {
  fontSize: 11,
  color: theme.textMuted,
  marginTop: 2,
};

// Table
export const tableSectionStyle = {
  marginBottom: 24,
};

export const tableHeaderTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
  color: theme.textPrimary,
  fontSize: 18,
  fontWeight: 600,
};

export const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: theme.accentBlue,
};

export const emptyStateStyle = {
  color: theme.textMuted,
  padding: "40px 20px",
  textAlign: "center",
  background: theme.bgSecondary,
  borderRadius: 8,
  border: `1px solid ${theme.borderSubtle}`,
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
  fontSize: 13,
};

export const thStyle = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: `1px solid ${theme.borderSubtle}`,
  background: theme.tableHeaderBg,
  color: theme.textSecondary,
  fontWeight: 600,
  fontSize: 11,
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
};

export const tdStyleDate = {
  ...tdStyle,
  color: theme.textSecondary,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 12,
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
  marginBottom: 24,
  padding: "20px 24px",
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.borderSubtle}`,
  boxShadow: theme.cardShadow,
};

export const globalStateTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.textPrimary,
  marginBottom: 12,
};

export const globalStateGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

export const globalStateItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

export const globalStateLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  color: theme.textMuted,
  letterSpacing: "0.5px",
};

export const globalStateValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.textPrimary,
};

// Formula Notes
export const formulaNotesStyle = {
  marginBottom: 24,
  padding: "20px 24px",
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.borderSubtle}`,
  boxShadow: theme.cardShadow,
};

export const formulaNotesTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
  marginBottom: 16,
};

export const formulaSectionStyle = {
  marginBottom: 16,
  paddingBottom: 16,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const formulaSectionTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: theme.accentBlue,
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

export const formulaItemStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "6px 0",
  gap: 8,
};

export const formulaLabelStyle = {
  fontSize: 13,
  color: theme.textSecondary,
  minWidth: 200,
};

export const formulaCodeStyle = {
  fontSize: 12,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  background: theme.bgSecondary,
  padding: "4px 8px",
  borderRadius: 4,
  color: theme.textPrimary,
};

export const formulaDescStyle = {
  fontSize: 11,
  color: theme.textMuted,
  fontStyle: "italic",
  marginTop: 8,
  lineHeight: 1.5,
};

// FAQ Section
export const faqContainerStyle = {
  marginBottom: 24,
  padding: "20px 24px",
  borderRadius: 8,
  background: theme.bgCard,
  border: `1px solid ${theme.borderSubtle}`,
  boxShadow: theme.cardShadow,
};

export const faqTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: theme.textPrimary,
  marginBottom: 20,
};

export const faqItemStyle = {
  marginBottom: 20,
  paddingBottom: 20,
  borderBottom: `1px solid ${theme.borderSubtle}`,
};

export const faqQuestionStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: theme.accentBlue,
  marginBottom: 10,
};

export const faqAnswerStyle = {
  fontSize: 13,
  color: theme.textSecondary,
  lineHeight: 1.7,
};

export const faqCodeStyle = {
  fontSize: 11,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  background: theme.bgSecondary,
  padding: "2px 6px",
  borderRadius: 3,
  color: theme.textPrimary,
};

export const faqListStyle = {
  margin: "8px 0",
  paddingLeft: 20,
  lineHeight: 1.8,
};

// Footer
export const footerStyle = {
  textAlign: "center",
  color: theme.textMuted,
  fontSize: 13,
  paddingTop: 24,
  borderTop: `1px solid ${theme.borderSubtle}`,
};

