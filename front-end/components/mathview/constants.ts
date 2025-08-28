// Constants for MathEditor configuration
export const MATH_EDITOR_CONSTANTS = {
    DEFAULT_FONT_FAMILY: "Times New Roman, serif",
    DEFAULT_FONT_SIZE: "15",
    DEFAULT_FONT_COLOR: "#000000",
    DEFAULT_BACKGROUND_COLOR: "transparent",
    DEFAULT_CURSOR_COLOR: "#000000",
    FOCUS_DELAY_MS: 50,
    VERTICAL_RULER_OFFSET_PX: 29,
} as const

// Event names for better maintainability
export const MATH_EVENTS = {
    NAVIGATE_LEFT: 'math-navigate-left',
    NAVIGATE_RIGHT: 'math-navigate-right',
    APPLY_FONT_SIZE: 'mathnode-apply-font-size',
} as const

// Node types for type safety
export const NODE_TYPES = {
    SYMBOL: 'symbol',
    ROW: 'row',
    FRACTION: 'fraction',
    CURSOR: 'cursor',
    EXPONENT: 'exponent',
} as const

// Root node ID
export const ROOT_NODE_ID = 'root' as const
