"use client";
import React, { useEffect, useRef, useState } from 'react';
import './TopBar.css';

type MenuKey = 'file' | 'edit' | 'view' | 'insert';

const TopBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const toggleMenu = (key: MenuKey) => {
    setOpenMenu((curr) => (curr === key ? null : key));
  };

  return (
    <div className="topbar" ref={containerRef}>
      <div className="menu-bar">
        {(['file', 'edit', 'view', 'insert'] as MenuKey[]).map((key) => (
          <div key={key} className="menu">
            <button
              type="button"
              className={`menu-button${openMenu === key ? ' open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={openMenu === key}
              onClick={() => toggleMenu(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {openMenu === key && (
              <div role="menu" className="dropdown">
                {/* Empty for now */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBar;