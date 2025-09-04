import type { NodeKey, SerializedElementNode, Spread } from "lexical";
import { ElementNode } from "lexical";

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
      version: 1
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "fraction";
    // Styling handled via global CSS (see MathLexical/math.css)
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }
}

export function $createFractionNode(): FractionNode {
  return new FractionNode();
}

export function $isFractionNode(node: unknown): node is FractionNode {
  return node instanceof FractionNode;
}



