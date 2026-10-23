"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Editor from "@/components/Lexical/Editor/Editor";
import { useDocument } from "@/components/Document/DocumentProvider";
import { readJSON, uid, writeJSON } from "@/lib/storage/local";
import { deleteFile, putFile } from "@/lib/storage/fileStore";
import {
  GAP,
  Rect,
  clampToBounds,
  collides,
  findFreeSpot,
  resolveMove,
} from "./geometry";
import PreviewPanel, { PANEL_HEADER } from "./PreviewPanel";
import type { EditorWindowState, PanelState, ResizeEdge, WorkspaceState } from "./types";
import styles from "./Workspace.module.css";

const STORAGE_KEY = "mathview:workspace";
const EDITOR_GRIP = 16;
const MIN_EDITOR_SCALE = 0.2;
const MIN_PANEL_W = 220;
const MIN_PANEL_H = 160;
const DEFAULT_NATURAL = { w: 1020, h: 1344 };

type Natural = { w: number; h: number };

type Interaction =
  | { type: "move"; id: string; sx: number; sy: number; orig: Rect }
  | { type: "resize-editor"; edge: ResizeEdge; sx: number; sy: number; orig: EditorWindowState }
  | { type: "resize-panel"; id: string; edge: ResizeEdge; sx: number; sy: number; orig: Rect };

function editorRect(e: EditorWindowState, n: Natural): Rect {
  return { x: e.x, y: e.y, w: n.w * e.scale, h: EDITOR_GRIP + n.h * e.scale };
}

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isImage(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(file.name);
}

async function contentRatio(file: File): Promise<number> {
  if (isPdf(file)) return 11 / 8.5;
  try {
    const bmp = await createImageBitmap(file);
    const r = bmp.height / bmp.width;
    bmp.close();
    return r || 1.3;
  } catch {
    return 1.3;
  }
}

/**
 * Bring a layout back within bounds and free of overlaps (after a window
 * resize, a change in editor size, or on first load).
 */
function normalize(ws: WorkspaceState, n: Natural, planeW: number, viewH: number): WorkspaceState {
  const maxScale = Math.max(MIN_EDITOR_SCALE, (planeW - 2 * GAP) / n.w);
  let editor = ws.editor;
  if (!editor) {
    const scale = Math.min(1, Math.max(MIN_EDITOR_SCALE, ((planeW - 3 * GAP) * 0.55) / n.w));
    editor = { x: GAP, y: GAP, scale };
  }
  editor = { ...editor, scale: Math.min(editor.scale, maxScale) };
  const er = clampToBounds(editorRect(editor, n), planeW);
  editor = { ...editor, x: er.x, y: er.y };

  const placed: Rect[] = [editorRect(editor, n)];
  const panels = ws.panels.map((p) => {
    if (!p.open) return p;
    let r: Rect = { x: p.x, y: p.y, w: Math.min(p.w, planeW - 2 * GAP), h: p.h };
    r = clampToBounds(r, planeW);
    if (collides(r, placed)) r = findFreeSpot(r.w, r.h, placed, planeW, viewH, MIN_PANEL_W, MIN_PANEL_H);
    placed.push(r);
    return { ...p, ...r };
  });
  return { editor, panels };
}

export default function Workspace() {
  const {
    ready: docsReady,
    documents,
    activeId,
    createDocument,
    switchDocument,
    renameDocument,
    deleteDocument,
    loadContent,
  } = useDocument();

  const canvasRef = useRef<HTMLDivElement>(null);
  const editorInnerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [planeW, setPlaneW] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [natural, setNatural] = useState<Natural>(DEFAULT_NATURAL);
  const [ws, setWs] = useState<WorkspaceState | null>(null);
  const [activeWin, setActiveWin] = useState("editor");
  const [interacting, setInteracting] = useState<null | "move" | "ew" | "ns" | "nwse" | "nesw">(null);
  const [dropHover, setDropHover] = useState(false);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);

  const wsRef = useRef(ws);
  wsRef.current = ws;
  const naturalRef = useRef(natural);
  naturalRef.current = natural;
  const planeWRef = useRef(planeW);
  planeWRef.current = planeW;
  const viewHRef = useRef(viewH);
  viewHRef.current = viewH;
  const storedRef = useRef<WorkspaceState | null>(null);

  // ---- canvas size -------------------------------------------------------
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => {
      setPlaneW(el.clientWidth);
      setViewH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- hydrate + keep layout valid ---------------------------------------
  useEffect(() => {
    storedRef.current = readJSON<WorkspaceState>(STORAGE_KEY, { editor: null, panels: [] });
  }, []);

  useEffect(() => {
    if (planeW <= 0 || viewH <= 0) return;
    const base = wsRef.current ?? storedRef.current ?? { editor: null, panels: [] };
    const next = normalize(base, natural, planeW, viewH);
    if (JSON.stringify(next) !== JSON.stringify(wsRef.current)) setWs(next);
  }, [planeW, viewH, natural]);

  // Persist (debounced).
  useEffect(() => {
    if (!ws) return;
    const t = setTimeout(() => writeJSON(STORAGE_KEY, ws), 200);
    return () => clearTimeout(t);
  }, [ws]);

  // Measure the editor's unscaled size.
  const editorMounted = !!ws?.editor && docsReady;
  useEffect(() => {
    const el = editorInnerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0 && (Math.abs(w - naturalRef.current.w) > 0.5 || Math.abs(h - naturalRef.current.h) > 0.5)) {
        setNatural({ w, h });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editorMounted]);

  // ---- helpers -----------------------------------------------------------
  const othersFor = useCallback((id: string, state: WorkspaceState): Rect[] => {
    const rects: Rect[] = [];
    if (id !== "editor" && state.editor) rects.push(editorRect(state.editor, naturalRef.current));
    for (const p of state.panels) if (p.open && p.id !== id) rects.push(p);
    return rects;
  }, []);

  const updatePanel = useCallback((id: string, patch: Partial<PanelState>) => {
    setWs((prev) =>
      prev ? { ...prev, panels: prev.panels.map((p) => (p.id === id ? { ...p, ...patch } : p)) } : prev
    );
  }, []);

  // ---- pointer interactions ---------------------------------------------
  const interactionRef = useRef<Interaction | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const it = interactionRef.current;
      const state = wsRef.current;
      if (!it || !state || !state.editor) return;
      const dx = e.clientX - it.sx;
      const dy = e.clientY - it.sy;
      const pw = planeWRef.current;
      const n = naturalRef.current;
      const others = othersFor(it.type === "resize-editor" ? "editor" : it.id, state);

      if (it.type === "move") {
        const current: Rect =
          it.id === "editor"
            ? editorRect(state.editor, n)
            : (state.panels.find((p) => p.id === it.id) as Rect);
        if (!current) return;
        const next = resolveMove(current, { ...it.orig, x: it.orig.x + dx, y: it.orig.y + dy }, others, pw);
        if (it.id === "editor") {
          setWs({ ...state, editor: { ...state.editor, x: next.x, y: next.y } });
        } else {
          updatePanel(it.id, { x: next.x, y: next.y });
        }
        return;
      }

      if (it.type === "resize-editor") {
        const o = it.orig;
        const origRect = editorRect(o, n);
        const right = origRect.x + origRect.w;
        const fromLeft = it.edge.includes("w");
        let wTarget = origRect.w;
        if (it.edge === "e" || it.edge === "se") wTarget = origRect.w + dx;
        if (it.edge === "w" || it.edge === "sw") wTarget = origRect.w - dx;
        let sTarget = wTarget / n.w;
        if (it.edge.includes("s")) {
          const sFromH = (n.h * o.scale + dy) / n.h;
          sTarget = it.edge === "s" ? sFromH : Math.max(sTarget, sFromH);
        }
        const room = fromLeft ? right - GAP : pw - GAP - o.x;
        const maxScale = Math.max(MIN_EDITOR_SCALE, room / n.w);
        sTarget = Math.min(maxScale, Math.max(MIN_EDITOR_SCALE, sTarget));

        const rectFor = (s: number): Rect => {
          const r = editorRect({ ...o, scale: s }, n);
          return fromLeft ? { ...r, x: right - r.w } : r;
        };
        let scale = sTarget;
        if (collides(rectFor(scale), others)) {
          // Largest scale between the current one and the target that fits.
          let lo = Math.min(state.editor.scale, sTarget);
          let hi = Math.max(state.editor.scale, sTarget);
          if (collides(rectFor(lo), others)) lo = MIN_EDITOR_SCALE;
          for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            if (collides(rectFor(mid), others)) hi = mid;
            else lo = mid;
          }
          scale = lo;
        }
        const r = rectFor(scale);
        setWs({ ...state, editor: { x: r.x, y: r.y, scale } });
        return;
      }

      if (it.type === "resize-panel") {
        const o = it.orig;
        const right = o.x + o.w;
        let { x, w, h } = o;
        if (it.edge.includes("e")) w = Math.min(o.w + dx, pw - GAP - o.x);
        if (it.edge.includes("w")) {
          w = Math.min(o.w - dx, right - GAP);
          x = right - w;
        }
        if (it.edge.includes("s")) h = o.h + dy;
        w = Math.max(MIN_PANEL_W, w);
        h = Math.max(MIN_PANEL_H, h);
        if (it.edge.includes("w")) x = right - w;
        const target: Rect = { x, y: o.y, w, h };

        const current = state.panels.find((p) => p.id === it.id);
        if (!current) return;
        let result = target;
        if (collides(target, others)) {
          // Grow horizontally as far as possible, then vertically.
          const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
          const search = (make: (t: number) => Rect) => {
            if (!collides(make(1), others)) return make(1);
            let lo = 0;
            let hi = 1;
            for (let i = 0; i < 20; i++) {
              const mid = (lo + hi) / 2;
              if (collides(make(mid), others)) hi = mid;
              else lo = mid;
            }
            return make(lo);
          };
          const horiz = search((t) => ({
            x: lerp(current.x, target.x, t),
            y: current.y,
            w: lerp(current.w, target.w, t),
            h: current.h,
          }));
          result = search((t) => ({ ...horiz, h: lerp(current.h, target.h, t) }));
          if (collides(result, others)) return;
        }
        updatePanel(it.id, { x: result.x, y: result.y, w: result.w, h: result.h });
      }
    },
    [othersFor, updatePanel]
  );

  const endInteraction = useCallback(() => {
    interactionRef.current = null;
    setInteracting(null);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endInteraction);
    window.removeEventListener("pointercancel", endInteraction);
  }, [onPointerMove]);

  const beginInteraction = (e: React.PointerEvent, it: Interaction, cursor: typeof interacting) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    interactionRef.current = it;
    setInteracting(cursor);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("pointercancel", endInteraction);
  };

  useEffect(() => () => endInteraction(), [endInteraction]);

  const cursorFor = (edge: ResizeEdge): typeof interacting =>
    edge === "e" || edge === "w" ? "ew" : edge === "s" ? "ns" : edge === "se" ? "nwse" : "nesw";

  const startMove = (id: string) => (e: React.PointerEvent) => {
    const state = wsRef.current;
    if (!state?.editor) return;
    const orig =
      id === "editor" ? editorRect(state.editor, naturalRef.current) : state.panels.find((p) => p.id === id);
    if (!orig) return;
    setActiveWin(id);
    beginInteraction(e, { type: "move", id, sx: e.clientX, sy: e.clientY, orig: { ...orig } }, "move");
  };

  const startEditorResize = (edge: ResizeEdge) => (e: React.PointerEvent) => {
    const state = wsRef.current;
    if (!state?.editor) return;
    setActiveWin("editor");
    beginInteraction(
      e,
      { type: "resize-editor", edge, sx: e.clientX, sy: e.clientY, orig: { ...state.editor } },
      cursorFor(edge)
    );
  };

  const startPanelResize = (id: string) => (e: React.PointerEvent, edge: ResizeEdge) => {
    const p = wsRef.current?.panels.find((q) => q.id === id);
    if (!p) return;
    setActiveWin(id);
    beginInteraction(
      e,
      { type: "resize-panel", id, edge, sx: e.clientX, sy: e.clientY, orig: { x: p.x, y: p.y, w: p.w, h: p.h } },
      cursorFor(edge)
    );
  };

  // ---- reference files (right sidebar) -----------------------------------
  const addFiles = useCallback(async (files: File[], at?: { x: number; y: number }) => {
    for (const file of files) {
      if (!isPdf(file) && !isImage(file)) continue;
      const state = wsRef.current;
      if (!state) return;
      const id = uid();
      try {
        await putFile(id, file);
      } catch (err) {
        console.error("[mathview] could not store file", err);
        alert(`Couldn't save "${file.name}" in this browser.`);
        continue;
      }
      const pw = planeWRef.current;
      const vh = viewHRef.current;
      const others = othersFor(id, state);
      const ratio = await contentRatio(file);

      const er = state.editor ? editorRect(state.editor, naturalRef.current) : null;
      const rightSpace = er ? pw - (er.x + er.w) - 2 * GAP : pw - 2 * GAP;
      const w = Math.min(720, Math.max(320, rightSpace));
      const h = Math.min(vh - 2 * GAP, PANEL_HEADER + 24 + (w - 24) * ratio);

      let rect: Rect | null = null;
      if (at) {
        const r = clampToBounds({ x: at.x - w / 2, y: at.y - 16, w, h }, pw);
        if (!collides(r, others)) rect = r;
      }
      if (!rect) rect = findFreeSpot(w, h, others, pw, vh, MIN_PANEL_W, MIN_PANEL_H);

      const panel: PanelState = {
        id,
        name: file.name,
        kind: isPdf(file) ? "pdf" : "image",
        ...rect,
        zoom: 1,
        open: true,
      };
      const next = { ...state, panels: [...state.panels, panel] };
      wsRef.current = next;
      setWs(next);
      setActiveWin(id);
    }
  }, [othersFor]);

  const togglePanel = (id: string) => {
    const state = wsRef.current;
    if (!state) return;
    const p = state.panels.find((q) => q.id === id);
    if (!p) return;
    if (p.open) {
      updatePanel(id, { open: false });
      return;
    }
    // Re-open where it was, or somewhere free if that spot is taken now.
    const others = othersFor(id, state);
    let r = clampToBounds({ x: p.x, y: p.y, w: Math.min(p.w, planeW - 2 * GAP), h: p.h }, planeW);
    if (collides(r, others)) r = findFreeSpot(r.w, r.h, others, planeW, viewH, MIN_PANEL_W, MIN_PANEL_H);
    updatePanel(id, { ...r, open: true });
    setActiveWin(id);
  };

  const closePanel = (id: string) => {
    setWs((prev) => (prev ? { ...prev, panels: prev.panels.filter((p) => p.id !== id) } : prev));
    deleteFile(id).catch(() => {});
  };

  useEffect(() => {
    const open = () => fileInputRef.current?.click();
    window.addEventListener("mathview:open-reference", open);
    return () => window.removeEventListener("mathview:open-reference", open);
  }, []);

  // ---- documents (left sidebar) -------------------------------------------
  const onRenameDoc = (id: string, title: string) => {
    const next = window.prompt("Rename document", title);
    if (next && next.trim()) renameDocument(id, next);
  };

  const onDeleteDoc = (id: string, title: string) => {
    const content = loadContent(id) as { root?: { children?: { children?: unknown[] }[] } } | null;
    const hasText = !!content?.root?.children?.some((c) => (c.children?.length ?? 0) > 0);
    const isActiveWithEdits = id === activeId; // may have unsaved edits; ask anyway
    if ((hasText || isActiveWithEdits) && !window.confirm(`Delete “${title}”? This can't be undone.`)) return;
    deleteDocument(id);
  };

  // ---- drag & drop files onto the canvas ---------------------------------
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropHover(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    addFiles(files, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + canvasRef.current.scrollTop,
    });
  };

  // ---- render ------------------------------------------------------------
  const er = ws?.editor ? editorRect(ws.editor, natural) : null;
  const bottoms = [er ? er.y + er.h : 0, ...(ws?.panels.filter((p) => p.open).map((p) => p.y + p.h) ?? [])];
  const planeH = Math.max(viewH, Math.max(...bottoms) + GAP * 4);

  return (
    <div className={styles.workspace}>
      {/* Left: text editor tabs */}
      <nav className={`${styles.sidebar} ${styles.sidebarLeft}`} aria-label="Documents">
        {documents.map((d) => (
          <div
            key={d.id}
            role="tab"
            aria-selected={d.id === activeId}
            className={`${styles.tab} ${d.id === activeId ? styles.tabActive : ""}`}
            onClick={() => switchDocument(d.id)}
            onDoubleClick={() => onRenameDoc(d.id, d.title)}
            title={`${d.title} — double-click to rename`}
          >
            <span className={styles.tabLabel}>{d.title}</span>
            <button
              type="button"
              className={styles.tabClose}
              aria-label={`Delete ${d.title}`}
              title="Delete document"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDoc(d.id, d.title);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className={styles.addTab} onClick={createDocument} title="New document">
          +
        </button>
      </nav>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`${styles.canvas} ${interacting ? styles[`cursor_${interacting}`] : ""} ${
          dropHover ? styles.dropHover : ""
        }`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDropHover(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDropHover(false);
        }}
        onDrop={onDrop}
      >
        <div className={styles.plane} style={{ height: planeH }}>
          {ws?.editor && er && docsReady && (
            <div
              className={`${styles.window} ${styles.editorWindow} ${
                activeWin === "editor" ? styles.windowActive : ""
              }`}
              style={{ left: er.x, top: er.y, width: er.w, height: er.h }}
              onPointerDownCapture={() => setActiveWin("editor")}
            >
              <div
                className={styles.editorGrip}
                style={{ height: EDITOR_GRIP }}
                onPointerDown={startMove("editor")}
                title="Drag to move"
              >
                <span className={styles.gripDots} />
                {titleDraft !== null ? (
                  <input
                    autoFocus
                    className={styles.gripTitleInput}
                    value={titleDraft}
                    size={Math.max(titleDraft.length, 4)}
                    onFocus={(e) => e.currentTarget.select()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => {
                      if (activeId && titleDraft.trim()) renameDocument(activeId, titleDraft);
                      setTitleDraft(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") setTitleDraft(null);
                    }}
                  />
                ) : (
                  <span
                    className={styles.gripTitle}
                    title="Double-click to rename"
                    onDoubleClick={() =>
                      setTitleDraft(documents.find((d) => d.id === activeId)?.title ?? "")
                    }
                  >
                    {documents.find((d) => d.id === activeId)?.title}
                  </span>
                )}
                <span className={styles.gripDots} />
              </div>
              <div
                className={styles.editorScaleBox}
                style={{ width: er.w, height: er.h - EDITOR_GRIP }}
              >
                <div
                  ref={editorInnerRef}
                  className={styles.editorInner}
                  style={{ transform: `scale(${ws.editor.scale})` }}
                >
                  <Editor embedded />
                </div>
              </div>
              {(["e", "w", "se", "sw"] as ResizeEdge[]).map((edge) => (
                <div
                  key={edge}
                  className={`${styles.handle} ${styles[`handle_${edge}`]}`}
                  onPointerDown={startEditorResize(edge)}
                />
              ))}
            </div>
          )}

          {ws?.panels
            .filter((p) => p.open)
            .map((p) => (
              <PreviewPanel
                key={p.id}
                panel={p}
                active={activeWin === p.id}
                onDragStart={startMove(p.id)}
                onResizeStart={startPanelResize(p.id)}
                onZoom={(zoom) => updatePanel(p.id, { zoom })}
                onScroll={(scrollX, scrollY) => updatePanel(p.id, { scrollX, scrollY })}
                onMinimize={() => updatePanel(p.id, { open: false })}
                onFocus={() => setActiveWin(p.id)}
              />
            ))}
        </div>
      </div>

      {/* Right: image / PDF tabs */}
      <nav className={`${styles.sidebar} ${styles.sidebarRight}`} aria-label="References">
        {ws?.panels.map((p) => (
          <div
            key={p.id}
            role="tab"
            aria-selected={p.open}
            className={`${styles.tab} ${p.open ? styles.tabActive : styles.tabMinimized}`}
            onClick={() => togglePanel(p.id)}
            title={p.open ? `${p.name} — click to minimize` : `${p.name} — click to open`}
          >
            <span className={styles.tabLabel}>{p.name}</span>
            <button
              type="button"
              className={styles.tabClose}
              aria-label={`Close ${p.name}`}
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                closePanel(p.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addTab}
          onClick={() => fileInputRef.current?.click()}
          title="Add image or PDF"
        >
          +
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) addFiles(files);
          }}
        />
      </nav>
    </div>
  );
}
