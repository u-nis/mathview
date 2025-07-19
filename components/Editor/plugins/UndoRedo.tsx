import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";
import { buttonStyle } from "../styles";

export default function UndoRedo() {
  const [editor] = useLexicalComposerContext();

  const onUndo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const onRedo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <>
      <button style={buttonStyle} onClick={onUndo}>
        ←
      </button>
      <button style={buttonStyle} onClick={onRedo}>
        →
      </button>
    </>
  );
} 