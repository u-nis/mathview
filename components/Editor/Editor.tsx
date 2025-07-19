"use client";
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import '@/styles/editor.css';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { $isRangeSelection, $getSelection } from 'lexical';
import {HeadingNode, $createHeadingNode} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {
  ListNode, 
  ListItemNode, 
  $createListNode, 
  $createListItemNode,
  ListType,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list';
import Toolbar from './ToolBar';

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
  }
};

function onError(error: Error) {
  console.error(error);
}



export default function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <Toolbar/>
        <ListPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input"

            />
          }
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
}