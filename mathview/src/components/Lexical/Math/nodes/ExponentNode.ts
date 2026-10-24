import type { NodeKey, SerializedElementNode, Spread, DOMExportOutput, LexicalEditor } from "lexical";
import { ElementNode } from "lexical";
import { $createRowNode, RowNode } from "./RowNode";

export type SerializedExponentNode = Spread<
  {
    type: "math-exponent";
    version: 1;
  },
  SerializedElementNode
>;

export class ExponentNode extends ElementNode {
  static getType(): string {
    return "math-exponent";
  }

  static clone(node: ExponentNode): ExponentNode {
    return new ExponentNode(node.__key);
  }

  static importJSON(serializedNode: SerializedExponentNode): ExponentNode {
    // Bare node: Lexical appends the saved base/exponent rows itself.
    return new ExponentNode();
  }

  exportJSON(): SerializedExponentNode {
    return {
      ...super.exportJSON(),
      type: "math-exponent",
      version: 1,
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  /** Get the base RowNode (first child) */
  get base(): RowNode {
    const child = this.getChildAtIndex(0);
    if (!child) {
      throw new Error("ExponentNode has no base");
    }
    return child as RowNode;
  }

  /** Get the exponent RowNode (second child) */
  get exponent(): RowNode {
    const child = this.getChildAtIndex(1);
    if (!child) {
      throw new Error("ExponentNode has no exponent");
    }
    return child as RowNode;
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "exponent";
    return dom;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("span");
    element.dataset.lexicalMath = "exponent";
    return { element };
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }
}

/** Creates an ExponentNode with base and exponent RowNodes */
export function $createExponentNode(): ExponentNode {
  const exponent = new ExponentNode();
  const base = $createRowNode();
  const exp = $createRowNode();
  exponent.append(base, exp);
  return exponent;
}

export function $isExponentNode(node: unknown): node is ExponentNode {
  return node instanceof ExponentNode;
}
