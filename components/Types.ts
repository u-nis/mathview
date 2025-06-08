export type base = {
    id: string;
    type: "symbol" | "row" | "fraction" | "cursor";
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

export interface Cursor extends base {
    type: "cursor";
    parent: Row;
    root: Node;
};

export type Node = Symbol | Row | Fraction | Cursor;