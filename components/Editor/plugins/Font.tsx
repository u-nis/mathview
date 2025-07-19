import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import { dropdownStyle } from "../styles";

export default function Font() {
  const [editor] = useLexicalComposerContext();
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onFontSelect = (fontFamily: string) => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            $patchStyleText(selection, {
                "font-family": fontFamily
            });
        }
    });
    };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
          style={dropdownStyle}
        >
          {selectedFont}
          <span style={{ fontSize: '12px' }}>▼</span>
        </button>
        {isFontDropdownOpen && (
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
            {['Arial', 'Times New Roman', 'Courier New', 'Georgia'].map((font) => (
              <button
                key={font}
                style={{
                  padding: '8px',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'black',
                  borderBottom: '1px solid #eee',
                  fontFamily: font
                }}
                onClick={() => {
                  onFontSelect(font);
                  setSelectedFont(font);
                  setIsFontDropdownOpen(false);
                }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>
  );
} 