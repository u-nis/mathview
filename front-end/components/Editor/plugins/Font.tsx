import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import "../styles.css";

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

    const onFont = (font: string) => { 
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { 'font-family': font });
          }
        });
      };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
          className="dropdown"
        >
          {selectedFont}
        </button>
        {isFontDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '0px',
              marginTop: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '120px'
            }}
          >
            {[
              { text: 'Arial', action: () => { onFont('Arial'); setSelectedFont('Arial'); } },
              { text: 'Verdana', action: () => { onFont('Verdana'); setSelectedFont('Verdana'); } },
              { text: 'Times New Roman', action: () => { onFont('Times New Roman'); setSelectedFont('Times New Roman'); } },
              { text: 'Courier New', action: () => { onFont('Courier New'); setSelectedFont('Courier New'); } },
            ].map((item, index) => (
              <button
                key={item.text}
                style={{
                  padding: '6px 8px',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'black',
                  borderBottom: index < 3 ? '1px solid #eee' : 'none'
                }}
                onClick={() => {
                  item.action();
                  setIsFontDropdownOpen(false);
                }}
              >
                {item.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
} 