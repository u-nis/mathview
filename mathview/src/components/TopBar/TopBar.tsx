"use client";
import React, { useEffect, useRef, useState } from 'react';
import './TopBar.css';
import { DocumentTitle } from '../Document/DocumentTitle';
import { useDocument } from '../Document/DocumentProvider';

type MenuKey = 'file' | 'edit' | 'view' | 'insert';

const TopBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [exportSubmenuOpen, setExportSubmenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { createDocument } = useDocument();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setExportSubmenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setExportSubmenuOpen(false);
      }
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
    setExportSubmenuOpen(false);
  };

  const closeMenus = () => {
    setOpenMenu(null);
    setExportSubmenuOpen(false);
  };

  const openReference = () => {
    window.dispatchEvent(new CustomEvent("mathview:open-reference"));
    closeMenus();
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
                {key === "file" && (
                  <>
                    <button
                      className="menu-item"
                      onClick={() => {
                        createDocument();
                        closeMenus();
                      }}
                    >
                      New document
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("mathview:save"));
                        closeMenus();
                      }}
                    >
                      Save<span className="shortcut">⌘S</span>
                    </button>
                    <button className="menu-item" onClick={openReference}>
                      Open image / PDF…
                    </button>
                    <div className="menu-divider" />
                    <button className="menu-item disabled" onClick={() => {}}>
                      Print<span className="shortcut">⌘P</span>
                    </button>
                    <button className="menu-item disabled" onClick={() => {}}>
                      Share
                    </button>
                    <div className="menu-divider" />
                    <div
                      className="menu-item has-submenu"
                      onMouseEnter={() => setExportSubmenuOpen(true)}
                      onMouseLeave={() => setExportSubmenuOpen(false)}
                    >
                      Export
                      {exportSubmenuOpen && (
                        <div className="submenu">
                          <button
                            className="menu-item"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent("mathview:export-pdf"));
                              closeMenus();
                            }}
                          >
                            PDF
                          </button>
                          <button
                            className="menu-item"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent("mathview:export-html"));
                              closeMenus();
                            }}
                          >
                            HTML
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {key === "edit" && (
                  <>
                    <button className="menu-item disabled">Undo<span className="shortcut">⌘Z</span></button>
                    <button className="menu-item disabled">Redo<span className="shortcut">⇧⌘Z</span></button>
                    <div className="menu-divider" />
                    <button className="menu-item disabled">Cut<span className="shortcut">⌘X</span></button>
                    <button className="menu-item disabled">Copy<span className="shortcut">⌘C</span></button>
                    <button className="menu-item disabled">Paste<span className="shortcut">⌘V</span></button>
                  </>
                )}
                {key === "view" && (
                  <>
                    <button className="menu-item disabled">Zoom In<span className="shortcut">⌘+</span></button>
                    <button className="menu-item disabled">Zoom Out<span className="shortcut">⌘-</span></button>
                    <div className="menu-divider" />
                    <button className="menu-item disabled">Full Screen</button>
                  </>
                )}
                {key === "insert" && (
                  <>
                    <button className="menu-item" onClick={openReference}>
                      Reference image / PDF
                    </button>
                    <button className="menu-item disabled">Table</button>
                    <button className="menu-item disabled">Equation</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        <DocumentTitle />
      </div>
    </div>
  );
};

export default TopBar;
