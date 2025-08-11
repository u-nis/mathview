import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import { createCommand, DecoratorNode, $getSelection, COMMAND_PRIORITY_LOW, $createRangeSelection, $setSelection, $isRangeSelection, $getNodeByKey, $createNodeSelection } from 'lexical';
import React, { useRef, useEffect, useState } from 'react';
import MathEditor, { MathEditorAPI } from '@/components/mathview/MathEditor';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';

// Serialized type for the MathNode
export type SerializedMathNode = SerializedLexicalNode;

let initMathString = "";
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

  // Ensure this node is treated as inline by Lexical
  isInline(): boolean {
    return true;
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
    // Align with surrounding text baseline and inherit line-height
    element.style.verticalAlign = 'baseline';
    element.style.lineHeight = 'inherit';
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return <MathNodeComponent nodeKey={this.__key}/>;
  }
}

// React component wrapper for the MathEditor
function MathNodeComponent({ nodeKey }: { nodeKey: string }) {
  const [editor] = useLexicalComposerContext();
  const mathEditorRef = useRef<MathEditorAPI>(null);
  const hasInsertedRef = useRef(false);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  // Effect to handle selection changes
  useEffect(() => {
    if (isSelected) {
      console.log('MathNode SELECTED via useLexicalNodeSelection');
      if (mathEditorRef.current) {
        mathEditorRef.current.focus();
      }
    }
  }, [isSelected]);

           // Effect to listen for math navigation events
         useEffect(() => {
           const handleMathNavigation = (event: CustomEvent) => {
             const detail = (event as CustomEvent<{ nodeKey?: string }>).detail;
             if (!detail || detail.nodeKey !== nodeKey) return;

             const isLeft = event.type === 'math-navigate-left';
             const isRight = event.type === 'math-navigate-right';
             if (!isLeft && !isRight) return;

             editor.update(() => {
               const node = $getNodeByKey(nodeKey);
               if (!node) return;
               const parent = node.getParent();
               if (!parent) return;

               const indexWithinParent = node.getIndexWithinParent();
               const offset = isLeft ? indexWithinParent : indexWithinParent + 1;

               const range = $createRangeSelection();
               range.anchor.set(parent.getKey(), offset, 'element');
               range.focus.set(parent.getKey(), offset, 'element');
               $setSelection(range);
             });
           };

           document.addEventListener('math-navigate-left', handleMathNavigation as EventListener);
           document.addEventListener('math-navigate-right', handleMathNavigation as EventListener);

           return () => {
             document.removeEventListener('math-navigate-left', handleMathNavigation as EventListener);
             document.removeEventListener('math-navigate-right', handleMathNavigation as EventListener);
           };
         }, [editor, nodeKey]);

  // Effect to insert the detected math string when the component mounts
  useEffect(() => {
    console.log('MathNodeComponent effect running, initMathString:', initMathString, 'mathEditorRef.current:', mathEditorRef.current);
    
    if (initMathString && mathEditorRef.current && !hasInsertedRef.current) {
      // Insert each character from the detected math string
      for (let i = 0; i < initMathString.length; i++) {
        console.log('Inserting character:', initMathString[i]);
        mathEditorRef.current.insert(initMathString[i]);
      }
      
      hasInsertedRef.current = true;
      console.log('Insertion completed, hasInserted set to true');
    }
    
    // Always focus the MathEditor when component mounts
    setTimeout(() => {
      console.log('Attempting to focus MathEditor, ref available:', mathEditorRef.current);
      if (mathEditorRef.current) {
        mathEditorRef.current.focus();
        console.log('Focus called on MathEditor');
      }
    }, 50);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.update(() => {
      const nodeSelection = $createNodeSelection();
      nodeSelection.add(nodeKey);
      $setSelection(nodeSelection);
    });
  };

  return (
    <div 
      data-lexical-math-editor
      onClick={handleClick}
    >
      <MathEditor ref={mathEditorRef} nodeKey={nodeKey} />
    </div>
  );
}

// Utility function to get MathEditor API from a MathNode
export function getMathEditorAPI(nodeKey: string): MathEditorAPI | null {
  return null; // No longer needed
}

// Utility functions
export function $createMathNode(): MathNode {
  return new MathNode();
}

export function $isMathNode(node: LexicalNode | null | undefined): node is MathNode {
  return node instanceof MathNode;
}

// Command to insert math node
export const INSERT_MATH_COMMAND = createCommand<{ replace?: string }>('insertMath');

// Plugin to register the command
export function MathNodePlugin(): null {
  const [editor] = useLexicalComposerContext();
  
  if (!editor.hasNodes([MathNode])) {
    throw new Error('MathNodePlugin: MathNode is not registered on the editor');
  }

  editor.registerCommand(
    INSERT_MATH_COMMAND,
    (payload) => {
      // If replace string is provided, delete it from Lexical first
      if (payload?.replace) {
        deleteMathString(editor, payload.replace);
      }
      
      editor.update(() => {
        const mathNode = $createMathNode();
        const selection = $getSelection();
        if (selection) {
          selection.insertNodes([mathNode]);
          
          // Set the global variable for the MathNodeComponent to use
          if (payload?.replace) {
            initMathString = payload.replace;
          }
          
          // Clear the selection in the Lexical editor
          $setSelection(null);
        }
      });
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  return null;
}

// Function to delete math string from Lexical
export function deleteMathString(editor: any, replace: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (selection && $isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const focus = selection.focus;
      
      // Ensure we don't go out of bounds
      const startOffset = Math.max(0, anchor.offset - replace.length);
      
      // Create a selection that starts 'replace.length' characters behind the current position
      const newSelection = $createRangeSelection();
      newSelection.anchor.set(anchor.key, startOffset, anchor.type);
      newSelection.focus.set(focus.key, focus.offset, focus.type);
      
      $setSelection(newSelection);
      
      // Delete the selected content
      newSelection.removeText();
    }
  });
}
