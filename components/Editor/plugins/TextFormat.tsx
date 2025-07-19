import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import { dropdownStyle } from "../styles";

export default function TextFormat() {
  const [editor] = useLexicalComposerContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('Normal Text');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onHeadingClick = (tag: 'h1' | 'h2' | 'h3'): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const onNormalTextClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => null);
      }
    });
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={dropdownStyle}
      >
        {selectedFormat}
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginTop: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '120px'
          }}
        >
          <button
            style={{
              padding: '8px',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'black',
              borderBottom: '1px solid #eee'
            }}
            onClick={() => {
              onNormalTextClick();
              setSelectedFormat('Normal Text');
              setIsDropdownOpen(false);
            }}
          >
            Normal Text
          </button>
          {['Header 1', 'Header 2', 'Header 3'].map((text, index) => (
            <button
              key={text}
              style={{
                padding: '8px',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'black',
                borderBottom: index < 2 ? '1px solid #eee' : 'none'
              }}
              onClick={() => {
                onHeadingClick(`h${index + 1}` as 'h1' | 'h2' | 'h3');
                setSelectedFormat(text);
                setIsDropdownOpen(false);
              }}
            >
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 