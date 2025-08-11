import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND
} from 'lexical';
import "../styles.css";


export default function TextFormatting() {
    const [editor] = useLexicalComposerContext();

    const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            <button className="button" onClick={() => applyFormat('bold')}>B</button>
            <button className="button" onClick={() => applyFormat('italic')}>I</button>
            <button className="button" onClick={() => applyFormat('underline')}>U</button>
            <button className="button" onClick={() => applyFormat('strikethrough')}>S</button>
        </div>
    );
} 