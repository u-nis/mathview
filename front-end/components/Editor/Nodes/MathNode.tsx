import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalNode, NodeKey, SerializedLexicalNode } from "lexical";
import {
  createCommand,
  DecoratorNode,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  $createRangeSelection,
  $setSelection,
  $isRangeSelection,
  $getNodeByKey,
  $createNodeSelection,
  $isNodeSelection,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import React, { useRef, useEffect } from "react";
import MathEditor, { MathEditorAPI } from "@/components/mathview/MathEditor";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import "../Nodes/MathNode.css";
import { MATH_EDITOR_CONSTANTS } from "../../mathview/core/constants";
import {
  mathViewEventBus,
  MathViewEventType,
} from "../../mathview/core/events";

// Serialized type for the MathNode
export type SerializedMathNode = SerializedLexicalNode & {
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
};

let initMathString = "";
// Track the last cursor position before entering a MathNode
const lastCursorPosition: Map<string, { nodeKey: string; offset: number }> =
  new Map();
export class MathNode extends DecoratorNode<React.ReactElement> {
  __fontSize: number;
  __fontFamily: string;
  __fontColor: string;
  __fontWeight: string;
  __fontStyle: string;

  static getType(): string {
    return "math";
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(
      node.__fontSize,
      node.__fontFamily,
      node.__fontColor,
      node.__fontWeight,
      node.__fontStyle,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedMathNode): MathNode {
    return new MathNode(
      serializedNode.fontSize ?? MATH_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE
    );
  }

  constructor(
    fontSize: number = MATH_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE,
    fontFamily: string = "Times New Roman",
    fontColor: string = "black",
    fontWeight: string = "normal",
    fontStyle: string = "normal",
    key?: NodeKey
  ) {
    super(key);
    this.__fontSize = fontSize;
    this.__fontFamily = fontFamily;
    this.__fontColor = fontColor;
    this.__fontWeight = fontWeight;
    this.__fontStyle = fontStyle;
  }

  exportJSON(): SerializedMathNode {
    return {
      ...super.exportJSON(),
      fontSize: this.__fontSize,
      fontFamily: this.__fontFamily,
      fontColor: this.__fontColor,
      fontWeight: this.__fontWeight,
      fontStyle: this.__fontStyle,
    };
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className = "math-node-container";
    element.style.display = "inline-block";
    // Align with surrounding text baseline and inherit line-height
    element.style.verticalAlign = "baseline";
    element.style.lineHeight = "inherit";
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <MathNodeComponent
        nodeKey={this.__key}
        fontSizePx={this.__fontSize}
        fontFamily={this.__fontFamily}
        fontColor={this.__fontColor}
        fontWeight={this.__fontWeight}
        fontStyle={this.__fontStyle}
      />
    );
  }
}

/**
 * React wrapper that renders an embedded MathEditor for a MathNode and wires selection, font, focus, and navigation behavior.
 *
 * When this component becomes selected it:
 * - Infers entry direction from a captured cursor position (if available) and publishes a NodeSelected event.
 * - Focuses the embedded MathEditor.
 *
 * Runtime behaviors:
 * - On mount, if a global `initMathString` is set it inserts that string into the MathEditor once and focuses the editor.
 * - Listens for the `"mathnode-apply-font-size"` CustomEvent and applies the provided px value to the embedded MathEditor when this node is selected.
 * - Exposes exitLeft and exitRight callbacks to move the Lexical selection out of the MathNode to the adjacent text or element sibling.
 *
 * @param nodeKey - The Lexical node key for the MathNode instance rendered by this component.
 * @param fontSizePx - Optional font size (in pixels) passed to the MathEditor config to initialize its rendering size.
 */
function MathNodeComponent({
  nodeKey,
  fontSizePx,
  fontFamily,
  fontColor,
  fontWeight,
  fontStyle,
}: {
  nodeKey: string;
  fontSizePx?: number;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const mathEditorRef = useRef<MathEditorAPI>(null);
  const hasInsertedRef = useRef(false);
  const [isSelected] = useLexicalNodeSelection(nodeKey);

  // Effect to handle selection changes
  useEffect(() => {
    if (isSelected) {
      if (mathEditorRef.current) {
        editor.update(() => {
          const mathNode = $getNodeByKey(nodeKey);
          if (!mathNode) return;
          const mathParent = mathNode.getParent();
          if (!mathParent) return;

          // Use the captured cursor position to determine entry direction
          const capturedPosition = lastCursorPosition.get(nodeKey);
          let inferredDirection: "left" | "right" | null = null;

          if (capturedPosition) {
            const mathNodeIndex = mathNode.getIndexWithinParent();
            const capturedNode = $getNodeByKey(capturedPosition.nodeKey);

            if (capturedNode) {
              const capturedParent = capturedNode.getParent();
              if (capturedParent === mathParent) {
                // Same parent, compare indices
                const capturedIndex = capturedNode.getIndexWithinParent();

                if (capturedIndex < mathNodeIndex) {
                  inferredDirection = "right"; // Came from left
                } else if (capturedIndex > mathNodeIndex) {
                  inferredDirection = "left"; // Came from right
                } else {
                  // Same position, check offset
                  if (capturedNode.getType() === "text") {
                    const textContent = capturedNode.getTextContent();

                    if (capturedPosition.offset === textContent.length) {
                      inferredDirection = "right"; // At end of text, likely moving right
                    } else if (capturedPosition.offset === 0) {
                      inferredDirection = "left"; // At start of text, likely moving left
                    }
                  }
                }
              } else {
                // Different parent, use the original direction from arrow key
                // This will be handled by the arrow key handler
              }
            }

            // Clean up the captured position
            lastCursorPosition.delete(nodeKey);
          } else {
            // No captured position (e.g., clicked on MathNode)
            // Default to end position for better UX
            inferredDirection = null; // Will default to end in MathEditor
          }

          // Publish selection event with inferred direction
          // Publish selection event with inferred direction
          mathViewEventBus.publishNodeSelected(nodeKey, inferredDirection);
          mathEditorRef.current!.focus();
        });
      }
    }
  }, [isSelected, editor, nodeKey]);

  // Listen for external font-size apply events to update embedded MathEditor immediately
  useEffect(() => {
    const handler = (e: CustomEvent<{ px: number }>) => {
      if (isSelected && mathEditorRef.current) {
        const { px } = e.detail;
        mathEditorRef.current.setFontSize(px);
      }
    };
    document.addEventListener(
      "mathnode-apply-font-size",
      handler as EventListener
    );
    return () =>
      document.removeEventListener(
        "mathnode-apply-font-size",
        handler as EventListener
      );
  }, [isSelected]);

  // Exit callbacks for MathEditor to move selection out of MathNode
  const exitLeft = () => {
    if (mathEditorRef.current) {
      mathEditorRef.current.removeCursor();
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;
      const parent = node.getParent();
      if (!parent) return;
      const indexWithinParent = node.getIndexWithinParent();
      const prevSibling = parent.getChildAtIndex(indexWithinParent - 1);
      if (prevSibling && prevSibling.getType() === "text") {
        const textContent = prevSibling.getTextContent();
        const range = $createRangeSelection();
        range.anchor.set(prevSibling.getKey(), textContent.length, "text");
        range.focus.set(prevSibling.getKey(), textContent.length, "text");
        $setSelection(range);
      } else {
        const range = $createRangeSelection();
        range.anchor.set(parent.getKey(), indexWithinParent, "element");
        range.focus.set(parent.getKey(), indexWithinParent, "element");
        $setSelection(range);
      }
    });
  };

  const exitRight = () => {
    if (mathEditorRef.current) {
      mathEditorRef.current.removeCursor();
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!node) return;
      const parent = node.getParent();
      if (!parent) return;
      const indexWithinParent = node.getIndexWithinParent();
      const nextSibling = parent.getChildAtIndex(indexWithinParent + 1);
      if (nextSibling && nextSibling.getType() === "text") {
        const range = $createRangeSelection();
        range.anchor.set(nextSibling.getKey(), 0, "text");
        range.focus.set(nextSibling.getKey(), 0, "text");
        $setSelection(range);
      } else {
        const range = $createRangeSelection();
        range.anchor.set(parent.getKey(), indexWithinParent + 1, "element");
        range.focus.set(parent.getKey(), indexWithinParent + 1, "element");
        $setSelection(range);
      }
    });
  };

  // Effect to insert the detected math string when the component mounts
  useEffect(() => {
    if (initMathString && mathEditorRef.current && !hasInsertedRef.current) {
      // Insert each character from the detected math string
      for (let i = 0; i < initMathString.length; i++) {
        mathEditorRef.current.insert(initMathString[i]);
      }

      hasInsertedRef.current = true;
    }

    // Always focus the MathEditor when component mounts
    setTimeout(() => {
      if (mathEditorRef.current) {
        mathEditorRef.current.focus();
      }
    }, 50);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.update(() => {
      const nodeSelection = $createNodeSelection();
      nodeSelection.add(nodeKey);
      $setSelection(nodeSelection);
    });
  };

  return (
    <div
      data-lexical-math-editor
      onClick={handleClick}
      className={isSelected ? "math-node-selected" : undefined}
    >
      <MathEditor
        ref={mathEditorRef}
        nodeKey={nodeKey}
        config={fontSizePx ? { fontSize: `${fontSizePx}px` } : undefined}
        onExitLeft={exitLeft}
        onExitRight={exitRight}
      />
    </div>
  );
}

// Utility functions
export function $createMathNode(fontSize?: number): MathNode {
  return new MathNode(fontSize);
}

export function $isMathNode(
  node: LexicalNode | null | undefined
): node is MathNode {
  return node instanceof MathNode;
}

// Command to insert math node
export const INSERT_MATH_COMMAND = createCommand<{
  replace?: string;
  fontSizePx?: number;
  fontFamily?: string;
}>("insertMath");
export const SET_MATHNODE_FONT_SIZE_COMMAND = createCommand<number>(
  "setMathNodeFontSize"
);

/**
 * Registers MathNode-related editor behavior: keyboard navigation, insertion, and font-size commands.
 *
 * Sets up:
 * - ArrowLeft/ArrowRight handling to detect caret crossings into MathNode instances, capture the previous caret position, switch selection to the target MathNode, and publish a NodeSelected event with direction.
 * - INSERT_MATH_COMMAND to optionally delete a replacement string, insert a MathNode (optionally preloading content), publish a NodeCreated event, and select the new node.
 * - SET_MATHNODE_FONT_SIZE_COMMAND to update the font size on selected MathNode instances.
 *
 * This plugin performs editor-side registrations and has no rendered output.
 *
 * @throws Error If the editor does not have MathNode registered.
 * @returns null
 */
export function MathNodePlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([MathNode])) {
    throw new Error("MathNodePlugin: MathNode is not registered on the editor");
  }

  // Smooth entry into MathNode when caret crosses boundaries
  useEffect(() => {
    const remove = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (e: KeyboardEvent) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return false;
        let handled = false;

        // First read current state to decide
        let action: null | { key: NodeKey; dir: "left" | "right" } = null;
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();
          if (!parent) return;
          const offset = selection.anchor.offset;
          if (e.key === "ArrowLeft") {
            if (anchorNode.getType() === "text") {
              if (offset === 0) {
                const prevSibling = parent.getChildAtIndex(
                  anchorNode.getIndexWithinParent() - 1
                );
                if (prevSibling instanceof MathNode) {
                  action = { key: prevSibling.getKey(), dir: "left" };
                }
              }
            } else {
              // Element selection at index: check previous child
              const prevSibling = parent.getChildAtIndex(offset - 1);
              if (prevSibling instanceof MathNode) {
                action = { key: prevSibling.getKey(), dir: "left" };
              }
            }
          } else if (e.key === "ArrowRight") {
            if (anchorNode.getType() === "text") {
              const textContent = anchorNode.getTextContent();
              if (offset === textContent.length) {
                const nextSibling = parent.getChildAtIndex(
                  anchorNode.getIndexWithinParent() + 1
                );
                if (nextSibling instanceof MathNode) {
                  action = { key: nextSibling.getKey(), dir: "right" };
                }
              }
            } else {
              // Element selection: check next child at offset
              const nextSibling = parent.getChildAtIndex(offset);
              if (nextSibling instanceof MathNode) {
                action = { key: nextSibling.getKey(), dir: "right" };
              }
            }
          }
        });

        if (action) {
          e.preventDefault();

          // Capture the current cursor position before changing selection
          editor.update(() => {
            const currentSelection = $getSelection();
            if ($isRangeSelection(currentSelection)) {
              lastCursorPosition.set(action!.key, {
                nodeKey: currentSelection.anchor.key,
                offset: currentSelection.anchor.offset,
              });
            }
          });

          editor.update(() => {
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(action!.key);
            $setSelection(nodeSelection);
            // Publish navigation event with direction
            mathViewEventBus.publishNodeSelected(action!.key, action!.dir);
          });
          handled = true;
        }

        return handled ? true : false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
    return remove;
  }, [editor]);

  editor.registerCommand(
    INSERT_MATH_COMMAND,
    (payload) => {
      // If replace string is provided, delete it from Lexical first
      if (payload?.replace) {
        deleteMathString(editor, payload.replace);
      }

      editor.update(() => {
        const mathNode = $createMathNode(payload?.fontSizePx);
        const selection = $getSelection();
        if (selection) {
          selection.insertNodes([mathNode]);

          // Set the global variable for the MathNodeComponent to use
          if (payload?.replace) {
            initMathString = payload.replace;
          }

          // Publish node creation event - MathEditor will handle cursor placement
          mathViewEventBus.publishNodeCreated(mathNode.getKey());
          // Select the newly inserted MathNode
          const nodeSelection = $createNodeSelection();
          nodeSelection.add(mathNode.getKey());
          $setSelection(nodeSelection);
        }
      });
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  editor.registerCommand(
    SET_MATHNODE_FONT_SIZE_COMMAND,
    (newSize) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach((n) => {
            if ($isMathNode(n)) {
              const writable = (n as MathNode).getWritable();
              (writable as MathNode).__fontSize = newSize;
            }
          });
        }
      });
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  return null;
}

// Function to delete math string from Lexical
export function deleteMathString(editor: any, replace: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (selection && $isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const focus = selection.focus;

      // Ensure we don't go out of bounds
      const startOffset = Math.max(0, anchor.offset - replace.length);

      // Create a selection that starts 'replace.length' characters behind the current position
      const newSelection = $createRangeSelection();
      newSelection.anchor.set(anchor.key, startOffset, anchor.type);
      newSelection.focus.set(focus.key, focus.offset, focus.type);

      $setSelection(newSelection);

      // Delete the selected content
      newSelection.removeText();
    }
  });
}
