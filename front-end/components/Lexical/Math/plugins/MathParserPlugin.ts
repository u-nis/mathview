import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createRangeSelection, $isRangeSelection, $getRoot, $getSelection, $setSelection, $createTextNode } from "lexical";
import { $createMathExpressionNode } from "../nodes/MathExpressionNode";
import { $createNumberNode } from "../nodes/NumberNode";
import { $createOperatorNode } from "../nodes/OperatorNode";

export function MathParserPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        const match = text.match(/([0-9]+)([+\-*^])?$/);
        if (text.length >= 2){
          if (match){
            editor.update(() => {
            console.log("Math expression detected");
            console.log(match[0]);
            const selection = $getSelection();
            if (selection && $isRangeSelection(selection)) {
              for(let i = 0; i<match[0].length; i++){
                selection.modify("extend", true, "character");
                }
                const mathExpr = $createMathExpressionNode();
                const numberNode = $createNumberNode(match[1]);
                const operatorNode = $createOperatorNode(match[2]);
                mathExpr.root.append(numberNode);
                mathExpr.root.append(operatorNode);
                selection.insertNodes([mathExpr]);
                mathExpr.root.selectEnd();

                
              }
            });
            }
            }
      });
    });
  }, [editor]);

  return null;
}
