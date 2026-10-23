"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  TextNode,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  LexicalCommand,
} from "lexical";
import {
  $createMathExpressionNode,
  $isMathExpressionNode,
} from "../nodes/MathExpressionNode";

export const INSERT_MATH_EXPRESSION_COMMAND: LexicalCommand<void> =
  createCommand("INSERT_MATH_EXPRESSION");

/**
 * InsertMathPlugin detects when user types "$$" and converts it
 * to a MathExpressionNode, placing cursor inside for math input.
 */
export function InsertMathPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Listen for text changes to detect $$ pattern
    const removeTextListener = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        const text = textNode.getTextContent();
        const dollarIndex = text.indexOf("$$");

        if (dollarIndex !== -1) {
          // Found $$, replace with MathExpressionNode
          const beforeDollars = text.slice(0, dollarIndex);
          const afterDollars = text.slice(dollarIndex + 2);

          // Create math expression node
          const mathExpr = $createMathExpressionNode();

          if (beforeDollars.length > 0) {
            // Update current node to contain only text before $$
            textNode.setTextContent(beforeDollars);
            textNode.insertAfter(mathExpr);
          } else {
            // No text before $$, replace node
            textNode.replace(mathExpr);
          }

          // If there's text after $$, create a new text node
          if (afterDollars.length > 0) {
            const afterNode = new TextNode(afterDollars);
            mathExpr.insertAfter(afterNode);
          }

          // Place cursor inside the math expression's root row
          const rootRow = mathExpr.root;
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(rootRow.getKey(), 0, "element");
          newSelection.focus.set(rootRow.getKey(), 0, "element");
          $setSelection(newSelection);
        }
      }
    );

    // Also register a command for programmatic insertion
    const removeCommand = editor.registerCommand(
      INSERT_MATH_EXPRESSION_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const mathExpr = $createMathExpressionNode();
        selection.insertNodes([mathExpr]);

        // Place cursor inside
        const rootRow = mathExpr.root;
        const newSelection = $createRangeSelection();
        newSelection.anchor.set(rootRow.getKey(), 0, "element");
        newSelection.focus.set(rootRow.getKey(), 0, "element");
        $setSelection(newSelection);

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeTextListener();
      removeCommand();
    };
  }, [editor]);

  return null;
}
