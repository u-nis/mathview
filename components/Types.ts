export type Node = {
    id: string;
    type: "symbol" | "row" | "fraction" | "cursor";
};

export interface Symbol extends Node {
    type: "symbol";
    value: string;
    parent: Row;
};

export interface Row extends Node {
    type: "row";
    children: Node[];
    parent: Node | null;
};

export interface Fraction extends Node {
    type: "fraction";
    numerator: Row;
    denominator: Row;
    parent: Row;
};

export interface Cursor extends Node {
    type: "cursor";
    parent: Row;
    root: Node;
};
