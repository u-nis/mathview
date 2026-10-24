import type { NodeKey, SerializedElementNode, Spread, DOMExportOutput, LexicalEditor, LexicalNode } from "lexical";
import { ElementNode, $isElementNode } from "lexical";
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
    // Bare node: Lexical appends the saved numerator/denominator rows itself.
    return new FractionNode();
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

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("span");
    element.dataset.lexicalMath = "fraction";
    // Compute nesting depth by walking up the Lexical node tree
    const depth = this.getFractionDepth();
    element.dataset.mathLevel = String(Math.min(depth, 3));
    return { element };
  }

  /** Calculate how deeply nested this fraction is within other fractions */
  private getFractionDepth(): number {
    let depth = 0;
    let parent: LexicalNode | null = this.getParent();
    while (parent) {
      if ($isFractionNode(parent)) {
        depth++;
      }
      // Stop at MathExpressionNode
      if ($isElementNode(parent) && parent.getType() === "math-expression") {
        break;
      }
      parent = parent.getParent();
    }
    return depth;
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



