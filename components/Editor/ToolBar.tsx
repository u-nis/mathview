import UndoRedo from "./plugins/UndoRedo";
import TextFormat from "./plugins/TextFormat";
import Font from "./plugins/Font";
import FontSize from "./plugins/FontSize";
import TextFormatting from "./plugins/TextFormatting";
import TextColor from "./plugins/TextColor";
import Highlight from "./plugins/Highlight";
import Alignment from "./plugins/Alignment";
import List from "./plugins/List";

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
            <Alignment />
            <List />
        </div>
    )
}