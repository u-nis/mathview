import type { NodeKey, SerializedTextNode, Spread, DOMExportOutput, EditorConfig, LexicalEditor } from "lexical";
import { OperatorNode } from "./OperatorNode";

export type SerializedVariableNode = Spread<
  {
    type: "math-variable";
  },
  SerializedTextNode
>;

/**
 * A single-letter variable (x, y, a, …), rendered in italics like LaTeX.
 * Extends OperatorNode so every code path that treats an operator as a
 * one-character leaf (insertion, deletion, navigation) handles it the same way.
 */
export class VariableNode extends OperatorNode {
  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  static isValidText(text: string): boolean {
    return /^[A-Za-z]$/.test(text);
  }

  static getType(): string {
    return "math-variable";
  }

  static clone(node: VariableNode): VariableNode {
    return new VariableNode(node.getTextContent(), node.__key);
  }

  static importJSON(serializedNode: SerializedVariableNode): VariableNode {
    return $createVariableNode(serializedNode.text);
  }

  exportJSON(): SerializedVariableNode {
    return {
      ...super.exportJSON(),
      type: "math-variable",
    };
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor);
    dom.dataset.lexicalMath = "variable";
    delete dom.dataset.operator;
    return dom;
  }

  updateDOM(prevNode: OperatorNode, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    dom.dataset.lexicalMath = "variable";
    delete dom.dataset.operator;
    return isUpdated;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.dataset.lexicalMath = "variable";
    element.textContent = this.__text;
    return { element };
  }
}

export function $createVariableNode(text: string): VariableNode {
  return new VariableNode(text);
}

export function $isVariableNode(node: unknown): node is VariableNode {
  return node instanceof VariableNode;
}
