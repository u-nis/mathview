import UndoRedo from "./Plugins/UndoRedo";
import TextFormat from "./Plugins/BlockType";
import FontFamily from "./Plugins/FontFamily";
import FontSize from "./Plugins/FontSize";
import TextFormatting from "./Plugins/TextFormatting";
import TextColor from "./Plugins/TextColor";
import Highlight from "./Plugins/Highlight";
import List from "./Plugins/List";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_BANNER_COMMAND } from "./Plugins/BannerPlugin";
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
