import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { KEY_DOWN_COMMAND, PASTE_COMMAND } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useFontSize } from "../FontSizeContext";

export function FontSizeSyncPlugin() {
  const [editor] = useLexicalComposerContext();
  const { fontSize } = useFontSize();

  // Set the root element's font size to match context
  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.style.fontSize = `${fontSize}px`;
    }
  }, [editor, fontSize]);

  useEffect(() => {
    // Apply font size when user types
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Only apply to printable characters
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Apply font size to the current selection/cursor position
              $patchStyleText(selection, { "font-size": `${fontSize}px` });
            }
          });
        }
        return false; // Don't prevent default behavior
      },
      COMMAND_PRIORITY_LOW
    );

    return removeKeyDownListener;
  }, [editor, fontSize]);

  useEffect(() => {
    // Apply font size when user pastes content
    const removePasteListener = editor.registerCommand(
      PASTE_COMMAND,
      () => {
        // Small delay to let paste complete, then apply font size
        setTimeout(() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $patchStyleText(selection, { "font-size": `${fontSize}px` });
            }
          });
        }, 0);
        return false; // Don't prevent default behavior
      },
      COMMAND_PRIORITY_LOW
    );

    return removePasteListener;
  }, [editor, fontSize]);

  return null;
}
