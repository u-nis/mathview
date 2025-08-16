import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $createNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
} from "lexical";
import { $isMathNode } from "../Nodes/MathNode";

export function MathNodeNavigationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle Arrow Right - look for MathNodes to the right
    const removeArrowRightListener = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event: KeyboardEvent) => {
        return editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const currentNode = selection.anchor.getNode();
          const parent = currentNode.getParent();
          if (!parent) return false;

          // Look for MathNodes to the right within the same parent
          const siblings = parent.getChildren();
          const currentIndex = currentNode.getIndexWithinParent();

          // Search for the next MathNode within a reasonable range (e.g., next 5 nodes)
          for (
            let i = currentIndex + 1;
            i < Math.min(siblings.length, currentIndex + 6);
            i++
          ) {
            const sibling = siblings[i];
            if ($isMathNode(sibling)) {
              console.log(
                "MathNodeNavigation: Found MathNode to the right, jumping to it"
              );
              // Create node selection for the MathNode
              const nodeSelection = $createNodeSelection();
              nodeSelection.add(sibling.getKey());
              $setSelection(nodeSelection);
              return true; // Prevent default arrow behavior
            }
          }

          return false; // Allow normal arrow behavior
        });
      },
      COMMAND_PRIORITY_HIGH
    );

    // Handle Arrow Left - look for MathNodes to the left
    const removeArrowLeftListener = editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event: KeyboardEvent) => {
        return editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const currentNode = selection.anchor.getNode();
          const parent = currentNode.getParent();
          if (!parent) return false;

          // Look for MathNodes to the left within the same parent
          const siblings = parent.getChildren();
          const currentIndex = currentNode.getIndexWithinParent();

          // Search for the previous MathNode within a reasonable range (e.g., previous 5 nodes)
          for (
            let i = currentIndex - 1;
            i >= Math.max(0, currentIndex - 5);
            i--
          ) {
            const sibling = siblings[i];
            if ($isMathNode(sibling)) {
              console.log(
                "MathNodeNavigation: Found MathNode to the left, jumping to it"
              );
              // Create node selection for the MathNode
              const nodeSelection = $createNodeSelection();
              nodeSelection.add(sibling.getKey());
              $setSelection(nodeSelection);
              return true; // Prevent default arrow behavior
            }
          }

          return false; // Allow normal arrow behavior
        });
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeArrowRightListener();
      removeArrowLeftListener();
    };
  }, [editor]);

  return null;
}
