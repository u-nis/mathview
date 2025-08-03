import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListType } from "@lexical/list";
import { useState, useRef, useEffect } from "react";
import "../styles.css";

export default function List() {
  const [editor] = useLexicalComposerContext();
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  const [selectedList, setSelectedList] = useState('None');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsListDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onListClick = (tag: ListType): void => {
    if(tag === 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND,undefined)
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND,undefined)
    }
  };
  
  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setIsListDropdownOpen(!isListDropdownOpen)}
          className="dropdown"
        >
          {selectedList}
          <span style={{ fontSize: '12px' }}>▼</span>
        </button>
        {isListDropdownOpen && (
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
            {[
              { text: 'None', action: () => setSelectedList('None') },
              { text: 'Bullet List', action: () => { onListClick('bullet'); setSelectedList('Bullet List'); setIsListDropdownOpen(false); } },
              { text: 'Numbered List', action: () => { onListClick('number'); setSelectedList('Numbered List'); setIsListDropdownOpen(false); } }
            ].map((item, index) => (
              <button
                key={item.text}
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
                  item.action();
                  setIsListDropdownOpen(false);
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