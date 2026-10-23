"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getFile } from "@/lib/storage/fileStore";
import PdfView from "./PdfView";
import styles from "./Workspace.module.css";
import type { PanelState, ResizeEdge } from "./types";

export const PANEL_HEADER = 18;
const BODY_PAD = 12;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 5;

interface PreviewPanelProps {
  panel: PanelState;
  active: boolean;
  onDragStart: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent, edge: ResizeEdge) => void;
  onZoom: (zoom: number) => void;
  onScroll: (fx: number, fy: number) => void;
  onMinimize: () => void;
  onFocus: () => void;
}

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export default function PreviewPanel({
  panel,
  active,
  onDragStart,
  onResizeStart,
  onZoom,
  onScroll,
  onMinimize,
  onFocus,
}: PreviewPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [bodyWidth, setBodyWidth] = useState(0);
  const anchorRef = useRef<{ fx: number; fy: number; px: number; py: number } | null>(null);
  const restoredRef = useRef(false);
  const zoomRef = useRef(panel.zoom);
  zoomRef.current = panel.zoom;

  // Load the stored file.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    getFile(panel.id)
      .then((b) => {
        if (cancelled) return;
        if (!b) return setMissing(true);
        setBlob(b);
        if (panel.kind === "image") {
          objectUrl = URL.createObjectURL(b);
          setUrl(objectUrl);
        }
      })
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [panel.id, panel.kind]);

  // Track available content width.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () => setBodyWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const contentWidth = Math.max(40, (bodyWidth - BODY_PAD * 2) * panel.zoom);

  // Ctrl/⌘ + wheel (and trackpad pinch) zooms around the cursor.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      anchorRef.current = {
        px,
        py,
        fx: (el.scrollLeft + px) / Math.max(1, el.scrollWidth),
        fy: (el.scrollTop + py) / Math.max(1, el.scrollHeight),
      };
      const factor = Math.exp(-e.deltaY * 0.01);
      onZoom(clampZoom(zoomRef.current * factor));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onZoom]);

  // Keep the point under the cursor fixed after a zoom.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    const a = anchorRef.current;
    if (!el || !a) return;
    anchorRef.current = null;
    el.scrollLeft = a.fx * el.scrollWidth - a.px;
    el.scrollTop = a.fy * el.scrollHeight - a.py;
  }, [panel.zoom]);

  const zoomBy = (factor: number) => {
    const el = bodyRef.current;
    if (el) {
      const px = el.clientWidth / 2;
      const py = el.clientHeight / 2;
      anchorRef.current = {
        px,
        py,
        fx: (el.scrollLeft + px) / Math.max(1, el.scrollWidth),
        fy: (el.scrollTop + py) / Math.max(1, el.scrollHeight),
      };
    }
    onZoom(clampZoom(panel.zoom * factor));
  };

  // Restore the last scroll position once content has a size.
  const contentReady = panel.kind === "image" ? !!url : !!blob;
  useEffect(() => {
    if (restoredRef.current || !contentReady) return;
    const el = bodyRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      restoredRef.current = true;
      el.scrollLeft = (panel.scrollX ?? 0) * el.scrollWidth;
      el.scrollTop = (panel.scrollY ?? 0) * el.scrollHeight;
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentReady]);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = () => {
    if (!restoredRef.current) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = bodyRef.current;
      if (!el) return;
      onScroll(
        el.scrollLeft / Math.max(1, el.scrollWidth),
        el.scrollTop / Math.max(1, el.scrollHeight)
      );
    }, 300);
  };

  return (
    <div
      className={`${styles.window} ${styles.panel} ${active ? styles.windowActive : ""}`}
      style={{ left: panel.x, top: panel.y, width: panel.w, height: panel.h }}
      onPointerDownCapture={onFocus}
    >
      <div className={styles.panelHeader} onPointerDown={onDragStart} title="Drag to move">
        <span className={styles.gripDots} />
        <span className={styles.panelTitle}>{panel.name}</span>
        <span className={styles.gripDots} />
        <div className={styles.panelTools} onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => zoomBy(1 / 1.2)} title="Zoom out" aria-label="Zoom out">
            −
          </button>
          <button
            type="button"
            className={styles.zoomLabel}
            onClick={() => onZoom(1)}
            title="Fit to width"
          >
            {Math.round(panel.zoom * 100)}%
          </button>
          <button type="button" onClick={() => zoomBy(1.2)} title="Zoom in" aria-label="Zoom in">
            +
          </button>
          <button
            type="button"
            className={styles.minimizeBtn}
            onClick={onMinimize}
            title="Minimize"
            aria-label="Minimize"
          >
            _
          </button>
        </div>
      </div>

      <div ref={bodyRef} className={styles.panelBody} onScroll={handleScroll}>
        <div className={styles.panelContent} style={{ padding: BODY_PAD }}>
          {missing ? (
            <div className={styles.previewMessage}>
              This file is no longer in the browser&apos;s storage.
            </div>
          ) : panel.kind === "image" ? (
            url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={panel.name}
                draggable={false}
                className={styles.previewImage}
                style={{ width: contentWidth }}
              />
            )
          ) : (
            blob && <PdfView blob={blob} width={contentWidth} />
          )}
        </div>
      </div>

      {(["e", "w", "s", "se", "sw"] as ResizeEdge[]).map((edge) => (
        <div
          key={edge}
          className={`${styles.handle} ${styles[`handle_${edge}`]}`}
          onPointerDown={(e) => onResizeStart(e, edge)}
        />
      ))}
    </div>
  );
}
