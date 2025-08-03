import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import "../styles.css";

export default function TextColor() {
    const [editor] = useLexicalComposerContext();
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000');
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

    const onTextColor = (color: string) => { 
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { color });
          }
        });
      };

    return (
        <div style={{ position: 'relative' }}>
        <button className="button" onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>A</button>
        {isColorPickerOpen && (
          <div ref={colorPickerRef} style={{ position: 'absolute', top: '100%', left: '0', background: 'white', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1000, padding: '8px' }}>
            <HexColorPicker 
              color={selectedColor} 
              onChange={(color) => {
                setSelectedColor(color);
                onTextColor(color);
              }} 
            />
          </div>
        )}
      </div>
    )
} 