"use client";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isNodeSelection, $isRangeSelection, type LexicalNode } from "lexical";
import { $isMathExpressionNode } from "../nodes/MathExpressionNode";

/** Fired on window whenever the caret enters or leaves a math expression. */
export const MATH_MODE_EVENT = "mathview:math-mode";

function isInsideMath(node: LexicalNode | null): boolean {
  for (let current = node; current; current = current.getParent()) {
    if ($isMathExpressionNode(current)) return true;
  }
  return false;
}

/** Tells the top bar's hint whether the user is currently typing math. */
export function MathModeHintPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let active = false;
    const emit = (next: boolean) => {
      if (next === active) return;
      active = next;
      window.dispatchEvent(new CustomEvent(MATH_MODE_EVENT, { detail: { active } }));
    };
    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      const next = editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) return isInsideMath(selection.anchor.getNode());
        if ($isNodeSelection(selection)) {
          // A selected fraction/exponent is still "in math"; the whole expression selected is not.
          return selection.getNodes().some((n) => !$isMathExpressionNode(n) && isInsideMath(n));
        }
        return false;
      });
      emit(next);
    });
    return () => {
      removeListener();
      emit(false);
    };
  }, [editor]);

  return null;
}
