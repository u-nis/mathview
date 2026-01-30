import type { NodeKey, SerializedElementNode, Spread } from "lexical";
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

