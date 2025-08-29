"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import styles from "./TextEditor.module.css";
import "./Rulers/Ruler.css";
import { HeadingNode } from "@lexical/rich-text";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import Toolbar from "./ToolBar";
import { BannerNode, BannerPlugin } from "./plugins/BannerPlugin";
import { MathParserPlugin } from "./plugins/MathParser";
import { FontSizeSyncPlugin } from "./plugins/FontSizeSync";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MathNode, MathNodePlugin } from "./Nodes/MathNode";
import TopRuler from "./Rulers/TopRuler";
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
  const [editorWidth, setEditorWidth] = useState<number>(951);
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

        <div>
          <div
            className={`${styles["editor-frame"]} ${styles.editorFrameAnimateIn}`}
            style={{
              width: editorWidth + 2 * VERTICAL_RULER_OUTSIDE_PX,
            }}
          >
            <div className={styles["editor-container"]} ref={containerRef}>
              <Toolbar />
              <div>
                <TopRuler
                  width={editorWidth}
                  leftMargin={leftMargin}
                  rightMargin={rightMargin}
                  onChange={onRulerChange}
                />
              </div>
              <div
                className={styles["editor-content"]}
                ref={contentRef}
                style={{
                  paddingLeft: leftMargin,
                  paddingRight: rightMargin,
                  paddingTop: topMargin,
                  position: "relative",
                }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    const ce = (
                      e.currentTarget as HTMLDivElement
                    ).querySelector(
                      '[contenteditable="true"]'
                    ) as HTMLElement | null;
                    ce && requestAnimationFrame(() => ce.focus());
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
                  contentEditable={
                    <ContentEditable className={styles["editor-input"]} />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
            </div>
          </div>
          <div
            className={styles["treeview-container"]}
            style={{ color: "black" }}
          >
            <TreeViewWrapper />
          </div>
        </div>
      </LexicalComposer>
    </FontSizeProvider>
  );
}
