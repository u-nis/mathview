import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import "@/components/Lexical/Editor/Plugins/Controls.css";
import { useFontSize } from "./FontSizeContext";
import { MATH_EDITOR_CONSTANTS } from "../constants";

// Constants
const MIN_FONT_SIZE = 4;
const MAX_FONT_SIZE = 72;
const DEFAULT_FONT_SIZE = MATH_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE;
const DRAG_SENSITIVITY = 5;
const EDGE_WIDTH = 10;

export default function FontSize() {
  const [editor] = useLexicalComposerContext();
  const { fontSize, setFontSize } = useFontSize();
  const [inputValue, setInputValue] = useState(fontSize.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, size: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Update font size in context and editor
  const applyFontSize = (size: number) => {
    const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
    setInputValue(clampedSize.toString());
    setFontSize(clampedSize);

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-size": `${clampedSize}px` });
      }
    });
  };

  // Keep input value synced with context font size
  useEffect(() => {
    setInputValue(fontSize.toString());
  }, [fontSize]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaSize = Math.round(deltaX / DRAG_SENSITIVITY);
      const newSize = dragStart.size + deltaSize;
      applyFontSize(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, editor]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        setSelectionStart(0);
        setSelectionEnd(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get text width using measurement span
  const getTextWidth = (text: string) => {
    if (!measureRef.current) return 0;
    measureRef.current.textContent = text;
    return measureRef.current.offsetWidth;
  };

  // Get cursor position from click
  const getCursorFromClick = (clickX: number) => {
    let bestPosition = 0;
    let minDistance = Infinity;

    for (let i = 0; i <= inputValue.length; i++) {
      const textWidth = getTextWidth(inputValue.slice(0, i));
      const distance = Math.abs(clickX - textWidth);
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = i;
      }
    }
    return bestPosition;
  };

  // Handle scrolling to keep cursor visible
  const updateScroll = () => {
    const containerWidth = 40 - 16; // 40px width - 16px padding
    const cursorX = getTextWidth(inputValue.slice(0, cursorPosition));
    const visibleStart = scrollOffset;
    const visibleEnd = scrollOffset + containerWidth;

    if (cursorX < visibleStart) {
      setScrollOffset(Math.max(0, cursorX - 5));
    } else if (cursorX > visibleEnd) {
      setScrollOffset(cursorX - containerWidth + 5);
    }
  };

  // Update scroll when cursor moves
  useEffect(() => {
    if (isEditing) {
      updateScroll();
    }
  }, [cursorPosition, inputValue, isEditing]);

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) return;

    e.stopPropagation();
    e.preventDefault();

    const hasSelection = selectionStart !== selectionEnd;

    switch (e.key) {
      case "Enter":
        {
          const parsed = Number.parseInt(inputValue, 10);
          const newSize = Number.isNaN(parsed) ? DEFAULT_FONT_SIZE : parsed;
          applyFontSize(newSize);
        }
        setIsEditing(false);
        setSelectionStart(0);
        setSelectionEnd(0);
        containerRef.current?.blur();
        break;

      case "Escape":
        setInputValue(fontSize.toString());
        setIsEditing(false);
        setSelectionStart(0);
        setSelectionEnd(0);
        setCursorPosition(0);
        setScrollOffset(0);
        containerRef.current?.blur();
        break;

      case "Backspace":
        if (hasSelection) {
          const start = Math.min(selectionStart, selectionEnd);
          const end = Math.max(selectionStart, selectionEnd);
          const newValue = inputValue.slice(0, start) + inputValue.slice(end);
          setInputValue(newValue);
          setCursorPosition(start);
          setSelectionStart(start);
          setSelectionEnd(start);
        } else if (cursorPosition > 0) {
          const newValue =
            inputValue.slice(0, cursorPosition - 1) +
            inputValue.slice(cursorPosition);
          setInputValue(newValue);
          setCursorPosition(cursorPosition - 1);
        }
        break;

      case "Delete":
        if (hasSelection) {
          const start = Math.min(selectionStart, selectionEnd);
          const end = Math.max(selectionStart, selectionEnd);
          const newValue = inputValue.slice(0, start) + inputValue.slice(end);
          setInputValue(newValue);
          setCursorPosition(start);
          setSelectionStart(start);
          setSelectionEnd(start);
        } else if (cursorPosition < inputValue.length) {
          const newValue =
            inputValue.slice(0, cursorPosition) +
            inputValue.slice(cursorPosition + 1);
          setInputValue(newValue);
        }
        break;

      case "ArrowLeft":
        if (e.shiftKey) {
          const newPos = Math.max(0, cursorPosition - 1);
          setCursorPosition(newPos);
          setSelectionEnd(newPos);
        } else {
          const newPos = hasSelection
            ? Math.min(selectionStart, selectionEnd)
            : Math.max(0, cursorPosition - 1);
          setCursorPosition(newPos);
          setSelectionStart(newPos);
          setSelectionEnd(newPos);
        }
        break;

      case "ArrowRight":
        if (e.shiftKey) {
          const newPos = Math.min(inputValue.length, cursorPosition + 1);
          setCursorPosition(newPos);
          setSelectionEnd(newPos);
        } else {
          const newPos = hasSelection
            ? Math.max(selectionStart, selectionEnd)
            : Math.min(inputValue.length, cursorPosition + 1);
          setCursorPosition(newPos);
          setSelectionStart(newPos);
          setSelectionEnd(newPos);
        }
        break;

      case "Home":
        if (e.shiftKey) {
          setCursorPosition(0);
          setSelectionEnd(0);
        } else {
          setCursorPosition(0);
          setSelectionStart(0);
          setSelectionEnd(0);
        }
        break;

      case "End":
        if (e.shiftKey) {
          setCursorPosition(inputValue.length);
          setSelectionEnd(inputValue.length);
        } else {
          setCursorPosition(inputValue.length);
          setSelectionStart(inputValue.length);
          setSelectionEnd(inputValue.length);
        }
        break;

      case "a":
        if (e.ctrlKey || e.metaKey) {
          setSelectionStart(0);
          setSelectionEnd(inputValue.length);
          setCursorPosition(inputValue.length);
        }
        break;

      default:
        if (e.key >= "0" && e.key <= "9") {
          let newValue: string;
          let newCursorPos: number;

          if (hasSelection) {
            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);
            newValue =
              inputValue.slice(0, start) + e.key + inputValue.slice(end);
            newCursorPos = start + 1;
          } else {
            newValue =
              inputValue.slice(0, cursorPosition) +
              e.key +
              inputValue.slice(cursorPosition);
            newCursorPos = cursorPosition + 1;
          }

          setInputValue(newValue);
          setCursorPosition(newCursorPos);
          setSelectionStart(newCursorPos);
          setSelectionEnd(newCursorPos);
        }
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, size: fontSize });
      return;
    }

    const wasEditing = isEditing;
    setIsEditing(true);
    containerRef.current?.focus();

    if (!wasEditing) {
      // First click from outside - select all
      setSelectionStart(0);
      setSelectionEnd(inputValue.length);
      setCursorPosition(inputValue.length);
    } else {
      // Already editing - position cursor at click location
      const clickX = x - 8 + scrollOffset; // Account for padding and scroll
      const position = getCursorFromClick(clickX);

      setCursorPosition(position);
      setSelectionStart(position);
      setSelectionEnd(position);
    }
  };

  // Handle double-click to select all
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Don't handle double-click on drag edges
    if (x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH) {
      return;
    }

    setSelectionStart(0);
    setSelectionEnd(inputValue.length);
    setCursorPosition(inputValue.length);
  };

  // Keep cursor in bounds
  useEffect(() => {
    const maxPos = inputValue.length;
    setCursorPosition((prev) => Math.max(0, Math.min(maxPos, prev)));
    setSelectionStart((prev) => Math.max(0, Math.min(maxPos, prev)));
    setSelectionEnd((prev) => Math.max(0, Math.min(maxPos, prev)));
  }, [inputValue]);

  // Render text with selection highlighting
  const renderText = () => {
    if (!isEditing) {
      return <span>{inputValue}</span>;
    }

    const hasSelection = selectionStart !== selectionEnd;
    if (!hasSelection) {
      return <span>{inputValue}</span>;
    }

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    return (
      <>
        <span>{inputValue.slice(0, start)}</span>
        <span style={{ backgroundColor: "#0066cc", color: "white" }}>
          {inputValue.slice(start, end)}
        </span>
        <span>{inputValue.slice(end)}</span>
      </>
    );
  };

  const containerStyles = {
    cursor: isDragging ? "ew-resize" : "text",
  };

  const textContainerStyles = {
    position: "relative" as const,
    transform: `translateX(-${scrollOffset}px)`,
    padding: "0 8px",
    whiteSpace: "nowrap" as const,
    minWidth: "100%",
  };

  const cursorStyles = {
    position: "absolute" as const,
    left: `${
      8 + getTextWidth(inputValue.slice(0, cursorPosition)) - scrollOffset
    }px`,
    top: "5px",
    width: "1px",
    height: "14px",
    backgroundColor: "black",
    animation:
      isEditing && selectionStart === selectionEnd
        ? "blink 1s infinite"
        : "none",
    display: isEditing && selectionStart === selectionEnd ? "block" : "none",
  };

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Decrease Button */}
        <button
          className="button"
          onClick={() => {
            const parsed = Number.parseInt(inputValue, 10);
            const current = Number.isNaN(parsed) ? fontSize : parsed;
            applyFontSize(current - 1);
          }}
        >
          -
        </button>

        {/* Fake Input Field */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const onEdge = x <= EDGE_WIDTH || x >= rect.width - EDGE_WIDTH;
            e.currentTarget.style.cursor = isDragging
              ? "ew-resize"
              : onEdge
              ? "ew-resize"
              : "text";
          }}
          className="font-size-input-container"
          style={containerStyles}
        >
          <div style={textContainerStyles}>{renderText()}</div>
          <span style={cursorStyles}></span>

          {/* Hidden measurement span */}
          <span
            ref={measureRef}
            style={{
              position: "absolute",
              left: "-9999px",
              fontSize: `${fontSize}px`,
              fontFamily: "monospace",
              whiteSpace: "pre",
            }}
          />
        </div>

        {/* Increase Button */}
        <button
          className="button"
          onClick={() => {
            const parsed = Number.parseInt(inputValue, 10);
            const current = Number.isNaN(parsed) ? fontSize : parsed;
            applyFontSize(current + 1);
          }}
        >
          +
        </button>
      </div>
    </>
  );
}
