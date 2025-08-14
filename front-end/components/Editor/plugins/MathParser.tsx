import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { INSERT_MATH_COMMAND } from "./MathNode";

export function MathParserPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const registerUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const text = root.getTextContent();

          // Regex pattern for incomplete mathematical expressions
          // Matches: numbers/variables + operators (incomplete expressions)
          // Examples: a+, 6^, f=, 2+, etc.
          const mathRegex = /([a-zA-Z0-9]+[\+\-\*\/\^=])(?=\s|$)/g;
          const matches = text.match(mathRegex);

          if (matches && matches.length > 0) {
            console.log("Math detected:", matches);
            // Try to read current font-size from selection's computed style if possible
            let fontSizePx: number | undefined = undefined;
            const selection = $getSelection();
            try {
              const domSel = window.getSelection();
              if (domSel && domSel.anchorNode) {
                const anchorEl = (
                  domSel.anchorNode.nodeType === 3
                    ? domSel.anchorNode.parentElement
                    : (domSel.anchorNode as Element)
                ) as Element | null;
                if (anchorEl) {
                  const cs = window.getComputedStyle(anchorEl);
                  const parsed = parseFloat(cs.fontSize || "");
                  if (!Number.isNaN(parsed)) {
                    fontSizePx = Math.round(parsed);
                  }
                }
              }
            } catch {}

            // Trigger the command to insert MathNode with detected math text and current font size
            editor.dispatchCommand(INSERT_MATH_COMMAND, {
              replace: matches[0],
              fontSizePx,
            });
          }
        });
      }
    );
    return registerUpdateListener;
  }, [editor]);

  return null;
}
