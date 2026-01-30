import type { NodeKey, SerializedTextNode, Spread } from "lexical";
import { TextNode, EditorConfig, LexicalEditor } from "lexical";

// Map ASCII operators to proper mathematical symbols for display
const DISPLAY_MAP: Record<string, string> = {
  '*': '\u22C5', // ⋅ dot operator
  '-': '\u2212', // − minus sign (longer than hyphen)
};

export type SerializedOperatorNode = Spread<
  {
    type: "math-operator";
  },
  SerializedTextNode
>;

export class OperatorNode extends TextNode {
  constructor(text: string, key?: NodeKey) {
    if (!/^[+\-*=()]$/.test(text)) {
      throw new Error("OperatorNode can only contain operators (+, -, *, =, (, ))");
    }
    super(text, key);
  }

  static getType(): string {
    return "math-operator";
  }

  static clone(node: OperatorNode): OperatorNode {
    return new OperatorNode(node.getTextContent(), node.__key);
  }

  static importJSON(serializedNode: SerializedOperatorNode): OperatorNode {
    return $createOperatorNode(serializedNode.text);
  }

  exportJSON(): SerializedOperatorNode {
    return {
      ...super.exportJSON(),
      type: "math-operator",
      
    };
  }

  getTextContent(): string {
    return this.__text;
  }
  getTextContentSize(): number {
    return this.__text.length; // real length
  }
  // Restrict text updates to operators
  setTextContent(text: string): this {
    if (!/^[+\-*=()]$/.test(text)) {
      throw new Error("OperatorNode can only contain operators (+, -, *, =, (, ))");
    }
    return super.setTextContent(text);
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor);
    dom.dataset.lexicalMath = "operator";
    dom.dataset.operator = this.__text;
    // Display mathematical symbol instead of ASCII
    const display = DISPLAY_MAP[this.__text];
    if (display) {
      dom.textContent = display;
    }
    return dom;
  }

  updateDOM(
    prevNode: OperatorNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    dom.dataset.operator = this.__text;
    // Re-apply display mapping after TextNode updates
    const display = DISPLAY_MAP[this.__text];
    if (display) {
      dom.textContent = display;
    }
    return isUpdated;
  }
}

export function $createOperatorNode(text: string = ""): OperatorNode {
  return new OperatorNode(text);
}

export function $isOperatorNode(node: unknown): node is OperatorNode {
  return node instanceof OperatorNode;
}
