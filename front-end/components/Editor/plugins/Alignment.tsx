import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from "lexical";
import "../Controls.css";

export default function Alignment() {
  const [editor] = useLexicalComposerContext();

  return (
    <div style={{ display: "flex" }}>
      <button
        className="button"
        onClick={() =>
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
        }
      >
        {"<"}
      </button>
      <button
        className="button"
        onClick={() =>
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
        }
      >
        {">"}
      </button>
    </div>
  );
}
