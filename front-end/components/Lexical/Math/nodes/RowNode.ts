import type { NodeKey, SerializedElementNode, Spread } from "lexical";
import { ElementNode } from "lexical";

export type SerializedRowNode = Spread<
  {
    type: "math-row";
  },
  SerializedElementNode
>;

export class RowNode extends ElementNode {

  constructor(key?: NodeKey) {
    super(key);
  }
  static getType(): string {
    return "math-row";
  }

  static clone(node: RowNode): RowNode {
    return new RowNode(node.__key);
  }

  static importJSON(serializedNode: SerializedRowNode): RowNode { 
    return $createRowNode();
  }

  exportJSON(): SerializedRowNode {
    return {
      ...super.exportJSON(),
      type: "math-row",
    };
  }



  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "row";
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

export function $createRowNode(): RowNode {
  return new RowNode();
}

export function $isRowNode(node: unknown): node is RowNode {
  return node instanceof RowNode;
}



