"use client";
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import '@/styles/editor.css';
import './margin-ruler.css';
import {HeadingNode} from '@lexical/rich-text';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {
  ListNode, 
  ListItemNode, 
} from '@lexical/list';
import Toolbar from './ToolBar';
import { BannerNode, BannerPlugin } from './plugins/BannerPlugin';
import { MathParserPlugin } from './plugins/MathParser';
import { TreeView } from '@lexical/react/LexicalTreeView';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MathNode, MathNodePlugin } from './plugins/MathNode';
import MarginRuler from './MarginRuler';
import { useState } from 'react';

const theme = {
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-bold'
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline'
  },
  list: {
    ol: 'list-decimal pl-5',
    ul: 'list-disc pl-5'
  },
  banner: 'bg-blue-500 text-white p-2 rounded-md'
};

function onError(error: Error) {
  console.error(error);
}

function TreeViewWrapper() {
  const [editor] = useLexicalComposerContext();
  return <TreeView editor={editor} />;
}

export default function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, BannerNode, MathNode],
  };

  const [leftMargin, setLeftMargin] = useState(72);
  const [rightMargin, setRightMargin] = useState(72);
  const contentWidth = 1086;

  const onRulerChange = (leftPx: number, rightPx: number) => {
    setLeftMargin(leftPx);
    setRightMargin(rightPx);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MathParserPlugin />
      <MathNodePlugin />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="editor-container">
          <Toolbar/>
          <div>
            <MarginRuler width={contentWidth} leftMargin={leftMargin} rightMargin={rightMargin} onChange={onRulerChange} />
          </div>
          <div className="editor-content" style={{ paddingLeft: leftMargin, paddingRight: rightMargin }}>
            <ListPlugin />
            <HistoryPlugin />
            <BannerPlugin />
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <div className="treeview-container" style={{color: 'black'}}>
          <TreeViewWrapper />
        </div>
      </div>
    </LexicalComposer>
    
  );
}