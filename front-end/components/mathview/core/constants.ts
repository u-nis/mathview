// MathView core constants
export const MATH_EDITOR_CONSTANTS = {
  DEFAULT_FONT_SIZE: 25,
  DEFAULT_FONT_FAMILY: "Times New Roman, serif",
  DEFAULT_FONT_COLOR: "#000000",
  DEFAULT_BACKGROUND_COLOR: "transparent",
  DEFAULT_CURSOR_COLOR: "#000000",
} as const;

export const MATH_EVENTS = {
  NAVIGATE_LEFT: "math-navigate-left",
  NAVIGATE_RIGHT: "math-navigate-right",
  APPLY_FONT_SIZE: "mathnode-apply-font-size",
} as const;

export const NODE_TYPES = {
  ROW: "row",
  SYMBOL: "symbol",
  FRACTION: "fraction",
  EXPONENT: "exponent",
  CURSOR: "cursor",
} as const;

export const ROOT_NODE_ID = "root" as const;

// Navigation keys
export const NAVIGATION_KEYS = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  BACKSPACE: "Backspace",
  SPACE: " ",
} as const;

// Math operators (excluding / and ^ which are special operators)
export const MATH_OPERATORS = [
  "+", "-", "*", "="
] as const;

export const FRACTION_OPERATOR = "/";
export const EXPONENT_OPERATOR = "^";
