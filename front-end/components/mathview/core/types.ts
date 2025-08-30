// Base type for all nodes
export type BaseNode = {
  id: string;
  type: "symbol" | "row" | "fraction" | "cursor" | "exponent";
};

export interface MathSymbol extends BaseNode {
  type: "symbol";
  value: string;
  parent: Row;
}

export interface Row extends BaseNode {
  type: "row";
  children: Node[];
  // A Row can be nested directly under another Row, or as a child of
  // composite structures like Fraction (numerator/denominator) or
  // Exponent (base/raised). Root Row has parent null.
  parent: Row | Fraction | Exponent | null;
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

export type Node = MathSymbol | Row | Fraction | Exponent | Cursor;

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
