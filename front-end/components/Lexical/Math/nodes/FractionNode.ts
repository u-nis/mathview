import type { NodeKey, SerializedElementNode, Spread } from "lexical";
import { ElementNode } from "lexical";
import { $createRowNode, RowNode } from "./RowNode";

export type SerializedFractionNode = Spread<
  {
    type: "math-fraction";
    version: 1;
  },
  SerializedElementNode
>;

export class FractionNode extends ElementNode {
  static getType(): string {
    return "math-fraction";
  }

  static clone(node: FractionNode): FractionNode {
    return new FractionNode(node.__key);
  }

  static importJSON(serializedNode: SerializedFractionNode): FractionNode {
    return $createFractionNode();
  }

  exportJSON(): SerializedFractionNode {
    return {
      ...super.exportJSON(),
      type: "math-fraction",
      version: 1,
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  /** Get the numerator RowNode (first child) */
  get numerator(): RowNode {
    const child = this.getChildAtIndex(0);
    if (!child) {
      throw new Error("FractionNode has no numerator");
    }
    return child as RowNode;
  }

  /** Get the denominator RowNode (second child) */
  get denominator(): RowNode {
    const child = this.getChildAtIndex(1);
    if (!child) {
      throw new Error("FractionNode has no denominator");
    }
    return child as RowNode;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "fraction";
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }
}

/** Creates a FractionNode with numerator and denominator RowNodes */
export function $createFractionNode(): FractionNode {
  const fraction = new FractionNode();
  const numerator = $createRowNode();
  const denominator = $createRowNode();
  fraction.append(numerator, denominator);
  return fraction;
}

export function $isFractionNode(node: unknown): node is FractionNode {
  return node instanceof FractionNode;
}



