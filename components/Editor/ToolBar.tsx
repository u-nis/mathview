import UndoRedo from "./plugins/UndoRedo";
import TextFormat from "./plugins/BlockType";
import Font from "./plugins/Font";
import FontSize from "./plugins/FontSize";
import TextFormatting from "./plugins/TextFormatting";
import TextColor from "./plugins/TextColor";
import Highlight from "./plugins/Highlight";
import Alignment from "./plugins/Alignment";
import List from "./plugins/List";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_BANNER_COMMAND } from "./plugins/BannerPlugin";
import { JSX } from "react";
import "@/components/Editor/styles.css";


function BannertoolbarPlugin(): JSX.Element{
    const [editor] = useLexicalComposerContext();
    const onClick = (e: React.MouseEvent) => {
        editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined);
    }
    return (
        <button className="button" onClick={onClick}>Banner</button>
    )
}

export default function Toolbar() {
    return (
        <div className="toolbar" style={{backgroundColor: 'white', display: 'flex', gap: '0.5rem', padding: '8px', borderBottom: '1px solid #eee' }}>
            <UndoRedo />
            <TextFormat />
            <Font />
            <FontSize />
            <TextFormatting />
            <TextColor />
            <Highlight />
            {/* <Alignment /> */}
            <List />
            <BannertoolbarPlugin />
        </div>
    )
}