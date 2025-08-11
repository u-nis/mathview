import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from "lexical";
import "../styles.css";

export default function Alignment() {
    const [editor] = useLexicalComposerContext();

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            <button className="button" onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>{'<'}</button>
            <button className="button" onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>{'>'}</button>
        </div>
    );
} 