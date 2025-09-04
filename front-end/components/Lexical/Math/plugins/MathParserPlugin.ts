import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $getSelection } from "lexical";

export function MathParserPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        const pattern = /^[0-9][+\-*/^]$/;
        if (text.length > 2){
            if (pattern.test(text.slice(-2))){
                console.log("Math expression detected");
            }
        }
      });
    });
  }, [editor]);

  return null;
}
