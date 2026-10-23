import type { NodeKey, SerializedElementNode, Spread, DOMExportOutput, LexicalEditor } from "lexical";
import { ElementNode } from "lexical";

export type SerializedGroupNode = Spread<
  {
    type: "math-group";
    version: 1;
  },
  SerializedElementNode
>;

/**
 * GroupNode represents a parenthesized expression in math.
 * It acts like a RowNode but renders with parentheses via CSS.
 * Children are directly inside the GroupNode (no nested RowNode).
 */
export class GroupNode extends ElementNode {
  static getType(): string {
    return "math-group";
  }

  static clone(node: GroupNode): GroupNode {
    return new GroupNode(node.__key);
  }

  static importJSON(serializedNode: SerializedGroupNode): GroupNode {
    return $createGroupNode();
  }

  exportJSON(): SerializedGroupNode {
    return {
      ...super.exportJSON(),
      type: "math-group",
      version: 1,
    };
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("span");
    dom.dataset.lexicalMath = "group";
    return dom;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("span");
    element.dataset.lexicalMath = "group";
    return {
      element,
      after: (el) => {
        if (!el) return null;
        // Add actual bracket elements since CSS ::before/::after don't export
        const leftBracket = document.createElement("span");
        leftBracket.dataset.lexicalMath = "group-bracket-left";
        const rightBracket = document.createElement("span");
        rightBracket.dataset.lexicalMath = "group-bracket-right";
        el.insertBefore(leftBracket, el.firstChild);
        el.appendChild(rightBracket);
        return el;
      },
    };
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }
}

/** Creates an empty GroupNode (content is added directly as children) */
export function $createGroupNode(): GroupNode {
  return new GroupNode();
}

export function $isGroupNode(node: unknown): node is GroupNode {
  return node instanceof GroupNode;
}

