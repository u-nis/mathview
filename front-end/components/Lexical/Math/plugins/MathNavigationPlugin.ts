import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

// Placeholder for future complex navigation within math expression nodes
export function MathKeymapPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // TODO: register navigation commands for math structures
    return () => {};
  }, [editor]);

  return null;
}
