import UndoRedo from "./plugins/UndoRedo";
import TextFormat from "./plugins/BlockType";
import FontFamily from "./plugins/FontFamily";
import FontSize from "./plugins/FontSize";
import TextFormatting from "./plugins/TextFormatting";
import TextColor from "./plugins/TextColor";
import Highlight from "./plugins/Highlight";
import List from "./plugins/List";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_BANNER_COMMAND } from "./plugins/BannerPlugin";
import { JSX } from "react";
import "@/components/Lexical/Editor/Toolbar.css";
import "@/components/Lexical/Editor/Plugins/Controls.css";

function BannertoolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const onClick = (e: React.MouseEvent) => {
    editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined);
  };
  return (
    <button className="button" onClick={onClick}>
      Banner
    </button>
  );
}

function Separator() {
  return <span className="toolbar-separator" aria-hidden="true" />;
}

export default function Toolbar() {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <UndoRedo />
      </div>
      <Separator />
      <div className="toolbar-group">
        <TextFormat />
        <List />
      </div>
      <Separator />
      <div className="toolbar-group">
        <FontFamily />
        <FontSize />
      </div>
      <Separator />
      <div className="toolbar-group">
        <TextFormatting />
        <TextColor />
        <Highlight />
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-group">
        <BannertoolbarPlugin />
      </div>
    </div>
  );
}
