import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { INSERT_MATH_COMMAND } from "./MathNode";

export function MathParserPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const registerUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        // Regex pattern for incomplete mathematical expressions
        // Matches: numbers/variables + operators (incomplete expressions)
        // Examples: a+, 6^, f=, 2+, etc.
        const mathRegex = /([a-zA-Z0-9]+[\+\-\*\/\^=])(?=\s|$)/g;
        const matches = text.match(mathRegex);

        if (matches && matches.length > 0) {
          console.log('Math detected:', matches);
          // Trigger the command to insert MathNode
          editor.dispatchCommand(INSERT_MATH_COMMAND, { deleteLength: matches[0].length });
        }
      });
    });
    return registerUpdateListener;
  }, [editor]);

  return null;
}