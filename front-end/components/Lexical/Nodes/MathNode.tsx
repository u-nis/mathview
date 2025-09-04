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
} from "lexical";
import React, { useRef, useEffect, useState } from "react";
import MathEditor, { MathEditorAPI } from "../../mathview/MathEditor";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import "./MathNode.css";
import { MATH_EDITOR_CONSTANTS } from "../../mathview/core/constants";

// Serialized type for the MathNode
export type SerializedMathNode = SerializedLexicalNode & {
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
};

let initMathString = "";
const entrySideByNodeKey = new Map<string, "start" | "end">();
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

// React component wrapper for the MathEditor
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
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  // When the node becomes selected, place the internal cursor based on entry side
  useEffect(() => {
    if (!isSelected) return;
    if (!mathEditorRef.current) return;
    const side = entrySideByNodeKey.get(nodeKey);
    if (side === "end") {
      mathEditorRef.current.restoreCursorAtEnd();
    } else {
      mathEditorRef.current.restoreCursorAtStart();
    }
    entrySideByNodeKey.delete(nodeKey);
    mathEditorRef.current.focus();
  }, [isSelected, nodeKey]);

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

  // Define exit callbacks to move caret out of the math node
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
    console.log(
      "MathNodeComponent effect running, initMathString:",
      initMathString,
      "mathEditorRef.current:",
      mathEditorRef.current
    );

    if (initMathString && mathEditorRef.current && !hasInsertedRef.current) {
      // Insert each character from the detected math string
      for (let i = 0; i < initMathString.length; i++) {
        console.log("Inserting character:", initMathString[i]);
        mathEditorRef.current.insert(initMathString[i]);
      }

      hasInsertedRef.current = true;
      console.log("Insertion completed, hasInserted set to true");
    }

    // Always focus the MathEditor when component mounts
    setTimeout(() => {
      console.log(
        "Attempting to focus MathEditor, ref available:",
        mathEditorRef.current
      );
      if (mathEditorRef.current) {
        mathEditorRef.current.focus();
        console.log("Focus called on MathEditor");
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
  prefill?: boolean; // when true, seed MathEditor with replace string
}>("insertMath");
export const SET_MATHNODE_FONT_SIZE_COMMAND = createCommand<number>(
  "setMathNodeFontSize"
);

export const ENTER_MATH_COMMAND = createCommand<{
  nodeKey: string;
  side: "start" | "end";
}>("enterMath");

// Plugin to register the command
export function MathNodePlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([MathNode])) {
    throw new Error("MathNodePlugin: MathNode is not registered on the editor");
  }

  // Handle entering a math node from text via command
  useEffect(() => {
    return editor.registerCommand(
      ENTER_MATH_COMMAND,
      ({ nodeKey, side }) => {
        editor.update(() => {
          entrySideByNodeKey.set(nodeKey, side);
          const node = $getNodeByKey(nodeKey);
          if (!node) return;
          const nodeSelection = $createNodeSelection();
          nodeSelection.add(nodeKey);
          $setSelection(nodeSelection);
        });
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
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

          // Optionally prefill the MathEditor with the replace string
          if (payload?.replace && payload?.prefill) {
            initMathString = payload.replace;
          } else {
            initMathString = "";
          }

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
