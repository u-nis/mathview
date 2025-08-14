import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import "../styles.css";

export default function Highlight() {
    const [editor] = useLexicalComposerContext();
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
            setIsColorPickerOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    const onHighlight = (color: string) => { 
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { 'background-color': color });
          }
        });
      };

    return (
        <div style={{ display: 'inline-flex' }}>
        <button className="button" onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>H</button>
        {isColorPickerOpen && (
          <div ref={colorPickerRef} style={{ position: 'absolute', top: '100%', left: '0', background: 'white', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1000, padding: '8px' }}>
            <HexColorPicker 
              color={selectedColor} 
              onChange={(color) => {
                setSelectedColor(color);
                onHighlight(color);
              }} 
            />
          </div>
        )}
      </div>
    )
} 