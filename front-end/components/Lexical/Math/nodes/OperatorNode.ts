import type { NodeKey, SerializedTextNode, Spread } from "lexical";
import { TextNode, EditorConfig, LexicalEditor } from "lexical";

export type SerializedOperatorNode = Spread<
  {
    type: "math-operator";
  },
  SerializedTextNode
>;

export class OperatorNode extends TextNode {
  constructor(text: string, key?: NodeKey) {
    if (!/^[+\-*]$/.test(text)) {
      throw new Error("OperatorNode can only contain operators");
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
    // Don’t contribute to editor.getTextContent()
    return `[${this.__text}]`;
  }
  getTextContentSize(): number {
    return this.__text.length; // real length
  }
  // Restrict text updates to digits
  setTextContent(text: string): this {
    if (!/^[+\-*]$/.test(text)) {
      throw new Error("OperatorNode can only contain operators");
    }
    return super.setTextContent(text);
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor);
    dom.dataset.lexicalMath = "operator";
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }
}

export function $createOperatorNode(text: string = ""): OperatorNode {
  return new OperatorNode(text);
}

export function $isOperatorNode(node: unknown): node is OperatorNode {
  return node instanceof OperatorNode;
}
