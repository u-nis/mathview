"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import "./editor.css";
import "./Rulers/margin-ruler.css";
import { HeadingNode } from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import Toolbar from "./ToolBar";
import { BannerNode, BannerPlugin } from "./plugins/BannerPlugin";
import { MathParserPlugin } from "./plugins/MathParser";
import { FontSizeSyncPlugin } from "./plugins/FontSizeSync";
import { MathNodeNavigationPlugin } from "./plugins/MathNodeNavigation";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MathNode, MathNodePlugin } from "./Nodes/MathNode";
import MarginRuler from "./Rulers/MarginRuler";
import { useEffect, useRef, useState } from "react";
import RightRuler from "./Rulers/RightRuler";
import LeftRuler from "./Rulers/LeftRuler";
import { FontSizeProvider } from "./FontSizeContext";

const theme = {
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-bold",
    h3: "text-lg font-bold",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ol: "list-decimal pl-5",
    ul: "list-disc pl-5",
  },
  banner: "bg-blue-500 text-white p-2 rounded-md",
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
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, BannerNode, MathNode],
  };

  const [leftMargin, setLeftMargin] = useState(72);
  const [rightMargin, setRightMargin] = useState(72);
  const [topMargin, setTopMargin] = useState(72);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [editorWidth, setEditorWidth] = useState<number>(0);
  const VERTICAL_RULER_OUTSIDE_PX = 29; // matches CSS offset used for vertical rulers

  useEffect(() => {
    const update = () => {
      if (contentRef.current) setContentHeight(contentRef.current.clientHeight);
      if (containerRef.current)
        setEditorWidth(containerRef.current.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (contentRef.current) ro.observe(contentRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const onRulerChange = (leftPx: number, rightPx: number) => {
    setLeftMargin(leftPx);
    setRightMargin(rightPx);
  };

  return (
    <FontSizeProvider>
      <LexicalComposer initialConfig={initialConfig}>
        <MathParserPlugin />
        <MathNodePlugin />
        <FontSizeSyncPlugin />
        <MathNodeNavigationPlugin />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            className="editor-frame"
            style={{
              width: editorWidth + 2 * VERTICAL_RULER_OUTSIDE_PX,
              marginLeft: -VERTICAL_RULER_OUTSIDE_PX,
            }}
          >
            <div className="editor-container" ref={containerRef}>
              <Toolbar />
              <div>
                <MarginRuler
                  width={editorWidth}
                  leftMargin={leftMargin}
                  rightMargin={rightMargin}
                  onChange={onRulerChange}
                />
              </div>
              <div
                className="editor-content"
                ref={contentRef}
                style={{
                  paddingLeft: leftMargin,
                  paddingRight: rightMargin,
                  paddingTop: topMargin,
                  position: "relative",
                }}
                onClick={(e) => {
                  const container = e.currentTarget as HTMLDivElement;
                  const ce = container.querySelector(
                    ".editor-input"
                  ) as HTMLElement | null;
                  if (!ce) return;
                  const r = ce.getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  const clickedInsideCE =
                    x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
                  if (!clickedInsideCE) {
                    // clicked the padding area; focus after click settles
                    requestAnimationFrame(() => ce.focus());
                  }
                }}
              >
                <LeftRuler
                  height={contentHeight || 0}
                  value={topMargin}
                  onChange={setTopMargin}
                />
                <RightRuler
                  height={contentHeight || 0}
                  value={topMargin}
                  onChange={setTopMargin}
                />
                <ListPlugin />
                <HistoryPlugin />
                <BannerPlugin />
                <RichTextPlugin
                  contentEditable={<ContentEditable className="editor-input" />}
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
            </div>
          </div>
          <div className="treeview-container" style={{ color: "black" }}>
            <TreeViewWrapper />
          </div>
        </div>
      </LexicalComposer>
    </FontSizeProvider>
  );
}
