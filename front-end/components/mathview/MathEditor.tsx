"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import MathInput, { MathInputProps } from "./MathInput";
import MathRender from "@/components/mathview/Render/MathRender";
import { Row, Cursor, MathViewConfig, Node } from "./core/types";
import { handleInput } from "./Logic/handleInput";
import { moveNode, moveCursorToNode } from "./core/utils";
import styles from "./MathEditor.module.css";
import { MATH_EDITOR_CONSTANTS } from "./core/constants";
import { mathViewEventBus, MathViewEventType } from "./core/events";
import { useFontSize } from "../Editor/FontSizeContext";

// ID generator for unique node identification
let id = 0;
export const createId = (): string => {
  id++;
  return id.toString();
};

interface MathEditorProps {
  config?: MathViewConfig;
  nodeKey?: string;
  onExitLeft?: () => void;
  onExitRight?: () => void;
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
  ({ config = {}, nodeKey, onExitLeft, onExitRight }, ref) => {
    const { fontSize } = useFontSize();
    const rootRef = useRef<Row | null>(null);
    const [cursor, setCursor] = useState<Cursor | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const pendingPlacementRef = useRef<"start" | "end" | null>(null);
    const isInitializedRef = useRef(false);
    const [showDebug, setShowDebug] = useState(false);
    // Keep latest references to avoid stale closures in event callbacks
    const latestCursorRef = useRef<Cursor | null>(null);
    const latestRootRef = useRef<Row | null>(null);

    useEffect(() => {
      latestCursorRef.current = cursor;
    }, [cursor]);

    useEffect(() => {
      latestRootRef.current = rootRef.current;
    }, [rootRef.current]);

    // Default configuration
    const defaultConfig: MathViewConfig = {
      fontFamily: MATH_EDITOR_CONSTANTS.DEFAULT_FONT_FAMILY,
      fontSize: `${fontSize}px`,
      fontColor: MATH_EDITOR_CONSTANTS.DEFAULT_FONT_COLOR,
      backgroundColor: MATH_EDITOR_CONSTANTS.DEFAULT_BACKGROUND_COLOR,
      cursorColor: MATH_EDITOR_CONSTANTS.DEFAULT_CURSOR_COLOR,
      ...config,
    };

    // Initialize root and cursor synchronously
    if (!rootRef.current) {
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

      // Mark as initialized (NODE_CREATED is emitted by MathNode.tsx)
      if (nodeKey && !isInitializedRef.current) {
        isInitializedRef.current = true;
      }
    }

    // Expose API methods via useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        insert: (symbol: string) => {
          if (cursor) {
            handleInput(symbol, cursor, setCursor, {});
          }
        },
        focus: () => {
          inputRef.current?.focus();
        },
        setCursorToStart: () => {
          if (rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, 0);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          } else {
            pendingPlacementRef.current = "start";
          }
        },
        setCursorToEnd: () => {
          if (rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          } else {
            pendingPlacementRef.current = "end";
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
          if (cursor && cursor.parent) {
            const cursorIndex = cursor.parent.children.findIndex(
              (child) => child.id === cursor.id
            );
            if (cursorIndex !== -1) {
              cursor.parent.children.splice(cursorIndex, 1);
              // Force re-render by updating cursor state but keep cursor object
              setCursor({ ...cursor });
            }
          }
        },
        restoreCursorAtStart: () => {
          if (rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, 0);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          } else {
            pendingPlacementRef.current = "start";
          }
        },
        restoreCursorAtEnd: () => {
          if (rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          } else {
            pendingPlacementRef.current = "end";
          }
        },
      }),
      [cursor]
    );

    // Apply pending placement once cursor becomes available
    useEffect(() => {
      if (rootRef.current && cursor && pendingPlacementRef.current) {
        const placement = pendingPlacementRef.current;
        pendingPlacementRef.current = null;
        if (placement === "start") {
          moveNode(cursor, rootRef.current, 0);
        } else {
          moveNode(cursor, rootRef.current, rootRef.current.children.length);
        }
        setCursor({ ...cursor });
        inputRef.current?.focus();
      }
    }, [cursor]);

    // Listen for cursor placement events
    useEffect(() => {
      if (!nodeKey) return;

      const unsubscribeCursorEnd = mathViewEventBus.subscribe(
        MathViewEventType.CURSOR_PLACE_AT_END,
        (event) => {
          if (event.nodeKey === nodeKey && rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        }
      );

      const unsubscribeCursorStart = mathViewEventBus.subscribe(
        MathViewEventType.CURSOR_PLACE_AT_START,
        (event) => {
          if (event.nodeKey === nodeKey && rootRef.current && cursor) {
            moveNode(cursor, rootRef.current, 0);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        }
      );

      const unsubscribeNodeCreated = mathViewEventBus.subscribe(
        MathViewEventType.NODE_CREATED,
        (event) => {
          if (event.nodeKey === nodeKey && rootRef.current && cursor) {
            // When a node is created, place cursor at the end
            moveNode(cursor, rootRef.current, rootRef.current.children.length);
            setCursor({ ...cursor });
            inputRef.current?.focus();
          }
        }
      );

      const unsubscribeNodeSelected = mathViewEventBus.subscribe(
        MathViewEventType.NODE_SELECTED,
        (event) => {
          if (
            event.nodeKey === nodeKey &&
            latestRootRef.current &&
            latestCursorRef.current
          ) {
            const direction = event.data?.direction;
            const currentRoot = latestRootRef.current;
            const currentCursor = latestCursorRef.current;

            if (direction === "left") {
              // Coming from left, place cursor at end
              moveNode(currentCursor, currentRoot, currentRoot.children.length);
            } else if (direction === "right") {
              // Coming from right, place cursor at start
              moveNode(currentCursor, currentRoot, 0);
            } else {
              // No direction specified, default to end for new nodes
              moveNode(currentCursor, currentRoot, currentRoot.children.length);
            }
            setCursor({ ...currentCursor });
            inputRef.current?.focus();
          }
        }
      );

      return () => {
        unsubscribeCursorEnd();
        unsubscribeCursorStart();
        unsubscribeNodeCreated();
        unsubscribeNodeSelected();
      };
    }, [nodeKey]);

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

    // Debug toggle with 'g' key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "g" && e.ctrlKey) {
          e.preventDefault();
          setShowDebug((prev) => !prev);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

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

    // Debug display of root node contents (without circular references)
    const debugRootContents = cursor?.root
      ? JSON.stringify(
          cursor.root,
          (key, value) => {
            // Remove circular references for JSON serialization
            if (key === "parent" || key === "root") {
              return value ? `[${value.type} ${value.id}]` : null;
            }
            return value;
          },
          2
        )
      : "No cursor";

    return (
      <div style={{ display: "flex", gap: "20px" }}>
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
              onExitLeft={onExitLeft}
              onExitRight={onExitRight}
            />
          </div>
        </div>

        {/* Debug display - only show when showDebug is true */}
        {showDebug && (
          <div
            style={{
              width: "300px",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: "12px",
              overflow: "auto",
              maxHeight: "400px",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "black" }}>
              MathView Root Node:
            </h4>
            <pre style={{ margin: 0, color: "black", whiteSpace: "pre-wrap" }}>
              {debugRootContents}
            </pre>
          </div>
        )}
      </div>
    );
  }
);

MathEditor.displayName = "MathEditor";

export default MathEditor;
