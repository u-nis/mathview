import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import "@/components/Lexical/Editor/Plugins/Controls.css";

export default function TextFormatting() {
  const [editor] = useLexicalComposerContext();

  const applyFormat = (
    format: "bold" | "italic" | "underline" | "strikethrough"
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div style={{ display: "flex" }}>
      <button
        className="button"
        style={{ fontWeight: "bold" }}
        onClick={() => applyFormat("bold")}
      >
        B
      </button>
      <button
        className="button"
        style={{ fontStyle: "italic" }}
        onClick={() => applyFormat("italic")}
      >
        I
      </button>
      <button
        className="button"
        style={{ textDecoration: "underline" }}
        onClick={() => applyFormat("underline")}
      >
        U
      </button>
      <button
        className="button"
        style={{ textDecoration: "line-through" }}
        onClick={() => applyFormat("strikethrough")}
      >
        S
      </button>
    </div>
  );
}
