import type { NodeKey, SerializedElementNode, Spread } from "lexical";
import { ElementNode } from "lexical";

export type SerializedMathExpressionNode = Spread<
  {
    type: "math-expression";
    version: 1;
  },
  SerializedElementNode
>;

export class MathExpressionNode extends ElementNode {
  static getType(): string {
    return "math-expression";
  }

  static clone(node: MathExpressionNode): MathExpressionNode {
    return new MathExpressionNode(node.__key);
  }

  static importJSON(serializedNode: SerializedMathExpressionNode): MathExpressionNode {
    const node = $createMathExpressionNode();
    return node;
  }

  exportJSON(): SerializedMathExpressionNode {
    return {
      ...super.exportJSON(),
      type: "math-expression",
      version: 1
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "expression";
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

export function $createMathExpressionNode(): MathExpressionNode {
  return new MathExpressionNode();
}

export function $isMathExpressionNode(
  node: unknown
): node is MathExpressionNode {
  return node instanceof MathExpressionNode;
}



