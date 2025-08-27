"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import MathInput from "./MathInput";
import MathRender from "@/components/mathview/Render/MathRender";
import { Row, Cursor, MathViewConfig, Node } from "./Types";
import { handleInput } from "./Logic/handleInput";
import { moveNode, moveCursorToNode } from "./Logic/helperFunctions";
import styles from "./MathEditor.module.css";

// ID generator for unique node identification
let id = 0;
export const createId = (): string => {
  id++;
  return id.toString();
};

interface MathEditorProps {
  config?: MathViewConfig;
  nodeKey?: string;
}

// Interface for the MathEditor API
export interface MathEditorAPI {
  insert: (input: string) => void;
  focus: () => void;
  setCursorToStart: () => void;
  setCursorToEnd: () => void;
  setFontSize: (px: number) => void;
  removeCursor: () => void;
  restoreCursorAtStart: () => void;
  restoreCursorAtEnd: () => void;
}

const MathEditor = forwardRef<MathEditorAPI, MathEditorProps>(
  ({ config = {}, nodeKey }, ref) => {
    const rootRef = useRef<Row | null>(null);
    const [cursor, setCursor] = useState<Cursor | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    console.log("MathEditor rendering, cursor:", cursor);

    // Default configuration
    const defaultConfig: MathViewConfig = {
      fontFamily: "Times New Roman, serif",
      fontSize: "15px",
      fontColor: "#000000",
      backgroundColor: "transparent",
      cursorColor: "#000000",
      ...config,
    };

    // Initialize root and cursor synchronously
    if (!rootRef.current) {
      console.log("MathEditor initializing...");
      const root: Row = {
        id: "root",
        type: "row",
        children: [],
        parent: null,
      };
      rootRef.current = root;

      const newCursor: Cursor = {
        id: "cursor",
        type: "cursor",
        parent: root,
        root: root,
      };
      setCursor(newCursor);
      root.children = [newCursor];
      console.log("MathEditor initialized with cursor:", newCursor);
    }

    // Expose API methods via useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        insert: (symbol: string) => {
          if (cursor) {
            handleInput(symbol, cursor, setCursor);
          }
        },
        focus: () => {
          inputRef.current?.focus();
        },
        setCursorToStart: () => {
          if (cursor && rootRef.current) {
            // Move cursor to the beginning of the root (index 0)
            moveNode(cursor, rootRef.current, 0);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        },
        setCursorToEnd: () => {
          if (cursor && rootRef.current) {
            // Move cursor to the end of the root (after all children)
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        },
        setFontSize: (px: number) => {
          // This relies on parent re-rendering MathEditor with new config
          // but we also set style directly to ensure immediate visual update
          const wrapper = document.querySelector(
            `.${styles.wrapper}`
          ) as HTMLElement | null;
          if (wrapper) {
            wrapper.style.fontSize = `${px}px`;
          }
        },
        removeCursor: () => {
          // Remove cursor from parent's children array to stop rendering
          console.log("MathEditor: removeCursor called");
          if (cursor && cursor.parent) {
            const cursorIndex = cursor.parent.children.findIndex(
              (child) => child.id === cursor.id
            );
            if (cursorIndex !== -1) {
              console.log("MathEditor: removing cursor from children array");
              cursor.parent.children.splice(cursorIndex, 1);
              // Force re-render by updating cursor state but keep cursor object
              setCursor({ ...cursor });
            }
          }
        },
        restoreCursorAtStart: () => {
          // Restore cursor at index 0 with root node as parent
          if (rootRef.current && cursor) {
            console.log("MathEditor: using moveNode to place cursor at start");
            moveNode(cursor, rootRef.current, 0);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        },
        restoreCursorAtEnd: () => {
          // Restore cursor at the end (root.children.length) with root node as parent
          if (rootRef.current && cursor) {
            console.log("MathEditor: using moveNode to place cursor at end");
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        },
      }),
      [cursor]
    );

    const handleContainerMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      inputRef.current?.focus();
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (nodeKey) {
        (window as any).currentMathNodeKey = nodeKey;
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleNodeClick = (node: Node) => {
      if (cursor && node.type !== "cursor") {
        moveCursorToNode(cursor, node, setCursor);
        inputRef.current?.focus();
      }
    };

    const containerStyle: React.CSSProperties = {
      fontFamily: defaultConfig.fontFamily,
      fontSize: defaultConfig.fontSize,
      color: defaultConfig.fontColor,
      backgroundColor: defaultConfig.backgroundColor,
    };

    return (
      <div className={styles.wrapper} style={containerStyle}>
        <div
          className={styles.container}
          onMouseDown={handleContainerMouseDown}
        >
          <MathRender
            cursor={cursor}
            config={defaultConfig}
            showCursor={isFocused}
            onNodeClick={handleNodeClick}
          />
          <MathInput
            cursor={cursor}
            setCursor={setCursor}
            ref={inputRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>
    );
  }
);

MathEditor.displayName = "MathEditor";

export default MathEditor;
