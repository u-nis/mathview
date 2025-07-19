import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { buttonStyle } from "../styles";

export default function TextFormatting() {
    const [editor] = useLexicalComposerContext();

    const onBold = () => {
        editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) {
           selection.formatText('bold');
         }
       });
    };
    const onItalic = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.formatText('italic');
        }
      });
    };
    const onUnderline = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.formatText('underline');
        }
      });
    };

    return (
        <>
            <button style={buttonStyle} onClick={onBold}><strong>B</strong></button>
            <button style={buttonStyle} onClick={onItalic}><em>I</em></button>
            <button style={buttonStyle} onClick={onUnderline}><u>U</u></button>
        </>
    )
} 