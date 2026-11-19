// Global design system – every scene pulls from here so the whole video stays consistent.
export const VIDEO = { width: 1080, height: 1920, fps: 60 } as const;

export const COLORS = {
  bg: "#050505",
  surface: "#111113",
  surface2: "#1a1a1d",
  white: "#f5f5f7",
  grey: "#86868b",
  silver: "#c7c9cc",
  // line highlight accents
  red: "#e1141e",
  redDeep: "#7a0a0f",
  ember: "#ff5a1f",
  gold: "#d4af6a",
  goldLight: "#f3dfa8",
  money: "#9fd6a8",
  ice: "#cfe6ff",
} as const;

export const FONT = {
  family: '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
} as const;

// Apple-ish cubic beziers
export const CURVES = {
  out: [0.16, 1, 0.3, 1] as const, // expo-ish out – for reveals
  inOut: [0.65, 0, 0.35, 1] as const, // camera moves
  in: [0.7, 0, 0.84, 0] as const, // exits
  snap: [0.2, 0.9, 0.1, 1] as const,
};
