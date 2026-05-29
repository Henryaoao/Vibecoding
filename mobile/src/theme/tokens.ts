export const colors = {
  background: "#f7efe8",
  surface: "#fff8ed",
  surfaceMuted: "#f7dbe5",
  text: "#342b40",
  textMuted: "#75647f",
  border: "#75647f",
  primary: "#f6c96f",
  primaryPressed: "#d8c8ef",
  accent: "#cc5b83",
  danger: "#cc5b83",
  warning: "#946200",
  success: "#287D3C",
  outline: "#75647f",
  shadow: "#9a7f94",
  wall: "#f3bfd2",
  wallStripe: "#f7dbe5",
  floorTileA: "#f4d5ab",
  floorTileB: "#d8c8ef",
  panelLavender: "#d8c8ef",
  field: "#fff8ea",
  panelSheen: "rgba(255, 250, 241, 0.28)",
  white: "#fffaf1"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radius = {
  sm: 0,
  md: 0,
  lg: 0
};

export const typography = {
  title: 24,
  sectionTitle: 18,
  body: 15,
  caption: 12
};

export const theme = {
  colors,
  spacing,
  radius,
  typography
};

export type AppTheme = typeof theme;
