import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import { COMMAND_PRIORITY_LOW, createCommand, DecoratorNode, $getSelection, $isRangeSelection, $isTextNode } from 'lexical';
import React from 'react';
import MathEditor from '@/components/mathview/MathEditor';

// Serialized type for the MathNode
export type SerializedMathNode = SerializedLexicalNode;

export class MathNode extends DecoratorNode<React.ReactElement> {
  static getType(): string {
    return 'math';
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(node.__key);
  }

  static importJSON(serializedNode: SerializedMathNode): MathNode {
    return new MathNode();
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  exportJSON(): SerializedMathNode {
    return {
      ...super.exportJSON(),
    };
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'math-node-container';
    element.style.display = 'inline-block';
    element.style.verticalAlign = 'baseline';
    return element;
  }

  updateDOM(): boolean {
    // Return false to prevent DOM replacement
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <MathNodeComponent 
        nodeKey={this.getKey()}
      />
    );
  }
}

// React component wrapper for the MathEditor
function MathNodeComponent({ 
  nodeKey 
}: { 
  nodeKey: string;
}) {
  const [editor] = useLexicalComposerContext();

  // Handle focus management
  const handleFocus = React.useCallback(() => {
    // When math editor is focused, we need to update Lexical's selection
    editor.update(() => {
      const selection = $getSelection();
      if (selection && $isRangeSelection(selection)) {
        // Set selection to this node
        selection.focus.set(nodeKey, 0, 'element');
        selection.anchor.set(nodeKey, 0, 'element');
      }
    });
  }, [editor, nodeKey]);

  return (
    <div onFocus={handleFocus}>
      <MathEditor />
    </div>
  );
}

// Utility functions
export function $createMathNode(): MathNode {
  return new MathNode();
}

export function $isMathNode(node: LexicalNode | null | undefined): node is MathNode {
  return node instanceof MathNode;
}

// Command to insert math node, with argument for how many characters to delete before inserting
export const INSERT_MATH_COMMAND = createCommand<{ deleteLength: number }>('insertMath');

// Plugin to register the command
export function MathNodePlugin(): null {
  const [editor] = useLexicalComposerContext();
  
  if (!editor.hasNodes([MathNode])) {
    throw new Error('MathNodePlugin: MathNode is not registered on the editor');
  }

  editor.registerCommand(
    INSERT_MATH_COMMAND,
    (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && payload?.deleteLength > 0) {
          const anchor = selection.anchor;
          const node = anchor.getNode();
          const offset = anchor.offset;
          // Only proceed if the anchor is in a TextNode and there's enough text to delete
          if ($isTextNode(node) && offset >= payload.deleteLength) {
            // Set the selection to cover the pattern to delete
            selection.setTextNodeRange(
              node,
              offset - payload.deleteLength,
              node,
              offset
            );
            // Remove the selected text
            selection.removeText();
          }
        }
        // Insert the MathNode at the cursor (now after the deleted text)
        const mathNode = $createMathNode();
        const newSelection = $getSelection();
        if (newSelection) {
          newSelection.insertNodes([mathNode]);
        }
      });
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  return null;
}
