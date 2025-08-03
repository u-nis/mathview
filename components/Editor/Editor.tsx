"use client";
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import '@/styles/editor.css';
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

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div style={{display: 'flex', alignItems: 'flex-start'}}>
      <MathParserPlugin />
      <MathNodePlugin />

      <div className="editor-container">
        <Toolbar/>
        <ListPlugin />
        <HistoryPlugin />
        <BannerPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input"
            />
          }
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <TreeViewWrapper />
      </div>
    </LexicalComposer>
    
  );
}