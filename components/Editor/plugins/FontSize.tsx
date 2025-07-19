import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, RangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import { buttonStyle } from "../styles";

export default function FontSize() {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState(12);
  const [fontSizeInput, setFontSizeInput] = useState('12');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartSize, setDragStartSize] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isOnEdge, setIsOnEdge] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const fontSizeInputRef = useRef<HTMLDivElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaX = event.clientX - dragStartX;
        const deltaSize = Math.round(deltaX / 5); // 5px = 1 font size
        const newSize = Math.max(8, Math.min(72, dragStartSize + deltaSize));
        setFontSize(newSize);
        setFontSizeInput(newSize.toString());
        onFontSize(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
        if (fontSizeInputRef.current && !fontSizeInputRef.current.contains(event.target as Node)) {
          setIsInputFocused(false);
        }
      };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartSize]);

  const onFontSize = (size: number) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-size': `${size}px` });
      }
    });
  };

  const getCursorPosition = () => {
    if (!textMeasureRef.current) return 0;
    const textBeforeCursor = fontSizeInput.slice(0, cursorPosition);
    const rect = textMeasureRef.current.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = '12px monospace'; // Match the input font
      const textWidth = context.measureText(textBeforeCursor).width;
      return textWidth;
    }
    return cursorPosition * 8; // Fallback
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
    {/* Decrease Font Size */}
    <button 
      style={{ ...buttonStyle, minWidth: '20px', padding: '4px' }} 
      onClick={() => {
        const newSize = Math.max(8, fontSize - 1);
        setFontSize(newSize);
        setFontSizeInput(newSize.toString());
        onFontSize(newSize);
      }}
    >
      -
    </button>
    {/* Font Size Input */}
    <div
      ref={fontSizeInputRef}
      tabIndex={0}
      onKeyDown={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (e.key === 'Enter') {
          const newSize = parseInt(fontSizeInput) || 12;
          setFontSize(newSize);
          onFontSize(newSize);
          fontSizeInputRef.current?.blur();
          setIsInputFocused(false);
        } else if (e.key === 'Escape') {
          setFontSizeInput(fontSize.toString()); // Reset to current font size
          fontSizeInputRef.current?.blur();
          editor.focus(); // return focus to editor
          setIsInputFocused(false);
        } else if (e.key >= '0' && e.key <= '9') {
            const newFontSizeInput = fontSizeInput.slice(0, cursorPosition) + e.key + fontSizeInput.slice(cursorPosition);
            setFontSizeInput(newFontSizeInput);
            setCursorPosition(cursorPosition + 1);
        } else if (e.key === 'Backspace') {
            if (cursorPosition > 0) {
                const newFontSizeInput = fontSizeInput.slice(0, cursorPosition - 1) + fontSizeInput.slice(cursorPosition);
                setFontSizeInput(newFontSizeInput);
                setCursorPosition(cursorPosition - 1);
            }
        } else if (e.key === 'Delete') {
            const newFontSizeInput = fontSizeInput.slice(0, cursorPosition) + fontSizeInput.slice(cursorPosition + 1);
            setFontSizeInput(newFontSizeInput);
        } else if (e.key === 'ArrowLeft') {
            setCursorPosition(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
            setCursorPosition(prev => Math.min(fontSizeInput.length, prev + 1));
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const edgeWidth = 8; // 8px from each edge
        const isOnLeftEdge = x <= edgeWidth;
        const isOnRightEdge = x >= rect.width - edgeWidth;
        setIsOnEdge(isOnLeftEdge || isOnRightEdge);
      }}
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const edgeWidth = 8; // 8px from each edge
        const isOnLeftEdge = x <= edgeWidth;
        const isOnRightEdge = x >= rect.width - edgeWidth;
        
        if (isOnLeftEdge || isOnRightEdge) {
          setIsDragging(true);
          setDragStartX(e.clientX);
          setDragStartSize(fontSize);
        } else {
            setIsInputFocused(true);
            fontSizeInputRef.current?.focus();
            const charWidth = 8; // Approximate character width for monospace font
            const clickPosition = Math.round((x - 4) / charWidth); // 4px padding
            setCursorPosition(Math.max(0, Math.min(fontSizeInput.length, clickPosition)));
        }
      }}
      style={{
        width: '40px',
        padding: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '12px',
        cursor: isDragging ? 'ew-resize' : (isHovering && isOnEdge ? 'ew-resize' : 'text'),
        backgroundColor: 'white',
        color: 'black',
        outline: 'none',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      <span style={{ visibility: 'hidden' }}>{fontSizeInput}</span>
      <span ref={textMeasureRef} style={{ 
        position: 'absolute', 
        left: '-9999px', 
        top: '0px',
        fontSize: '12px',
        fontFamily: 'monospace',
        visibility: 'hidden'
      }}>
        {fontSizeInput}
      </span>
      <span style={{ 
        position: 'absolute', 
        left: '4px', 
        top: '4px',
        color: 'black',
        visibility: 'visible',
        whiteSpace: 'pre',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {fontSizeInput.slice(0, cursorPosition)}
        <span style={{
          position: 'absolute',
          left: `${getCursorPosition()}px`,
          top: '0px',
          width: '1px',
          height: '14px',
          backgroundColor: 'black',
          animation: isInputFocused ? 'blink 1s infinite' : 'none',
          display: isInputFocused ? 'block' : 'none'
        }}></span>
        {fontSizeInput.slice(cursorPosition)}
      </span>
    </div>
    {/* Increase Font Size */}
    <button 
      style={{ ...buttonStyle, minWidth: '20px', padding: '4px' }} 
      onClick={() => {
        const newSize = Math.min(72, fontSize + 1);
        setFontSize(newSize);
        setFontSizeInput(newSize.toString());
        onFontSize(newSize);
      }}
    >
      +
    </button>
  </div>
  </>
  )
} 