import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";
import "@/components/Lexical/Editor/Plugins/Controls.css";

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
      <button
        className="button"
        title="Undo"
        aria-label="Undo"
        onClick={onUndo}
      >
        {"<"}
      </button>
      <button
        className="button"
        title="Redo"
        aria-label="Redo"
        onClick={onRedo}
      >
        {">"}
      </button>
    </>
  );
}
