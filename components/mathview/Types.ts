export type base = {
    id: string;
    type: "symbol" | "row" | "fraction" | "cursor" | "exponent";
};

export interface Symbol extends base {
    type: "symbol";
    value: string;
    parent: Row;
};

export interface Row extends base {
    type: "row";
    children: Node[];
    parent: Node | null;
};

export interface Fraction extends base {
    type: "fraction";
    numerator: Row;
    denominator: Row;
    parent: Row;
};

export interface Exponent extends base {
    type: "exponent";
    base: Row;
    raised: Row;
    parent: Row;
};

export interface Cursor extends base {
    type: "cursor";
    parent: Row;
    root: Node;
};

export type Node = Symbol | Row | Fraction | Exponent | Cursor;

// Simple configuration for MathEditor styling
export interface MathViewConfig {
    fontFamily?: string;
    fontSize?: string;
    fontColor?: string;
    backgroundColor?: string;
    cursorColor?: string;
}