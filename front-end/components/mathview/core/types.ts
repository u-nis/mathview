// Base type for all nodes
export type BaseNode = {
  id: string;
  type: "symbol" | "row" | "fraction" | "cursor" | "exponent";
};

export interface Symbol extends BaseNode {
  type: "symbol";
  value: string;
  parent: Row;
}

export interface Row extends BaseNode {
  type: "row";
  children: Node[];
  parent: Row | null;
}

export interface Fraction extends BaseNode {
  type: "fraction";
  numerator: Row;
  denominator: Row;
  parent: Row;
}

export interface Exponent extends BaseNode {
  type: "exponent";
  base: Row;
  raised: Row;
  parent: Row;
}

export interface Cursor extends BaseNode {
  type: "cursor";
  parent: Row;
  root: Row;
}

export type Node = Symbol | Row | Fraction | Exponent | Cursor;

// Configuration types
export interface MathViewConfig {
  fontFamily?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  cursorColor?: string;
}

// Exit callback types
export interface ExitCallbacks {
  onExitLeft?: () => void;
  onExitRight?: () => void;
}
