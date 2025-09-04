import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

// Stub to register a command for inserting math; implement later
export function InsertMathPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // TODO: register command and behavior
    return () => {};
  }, [editor]);
  return null;
}
