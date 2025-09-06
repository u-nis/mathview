import type { NodeKey, SerializedTextNode, Spread } from "lexical";
import { TextNode, EditorConfig, LexicalEditor } from "lexical";

export type SerializedNumberNode = Spread<
  {
    type: "math-number";
  },
  SerializedTextNode
>;

export class NumberNode extends TextNode {
  constructor(text: string, key?: NodeKey) {
    if (!/^[0-9]*$/.test(text)) {
      throw new Error("NumberNode can only contain digits");
    }
    super(text, key);
  }


  
  static getType(): string {
    return "math-number";
  }

  static clone(node: NumberNode): NumberNode {
    return new NumberNode(node.getTextContent(), node.__key);
  }

  static importJSON(serializedNode: SerializedNumberNode): NumberNode {
    return $createNumberNode(serializedNode.text);
  }

  exportJSON(): SerializedNumberNode {
    return {
      ...super.exportJSON(),
      type: "math-number",
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
    if (!/^[0-9]*$/.test(text)) {
      throw new Error("NumberNode can only contain digits");
    }
    return super.setTextContent(text);
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor);
    dom.dataset.lexicalMath = "number";
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }
}

export function $createNumberNode(text: string = ""): NumberNode {
  return new NumberNode(text);
}

export function $isNumberNode(node: unknown): node is NumberNode {
  return node instanceof NumberNode;
}
