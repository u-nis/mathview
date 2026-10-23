"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import styles from "./Workspace.module.css";

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

/** pdf.js touches browser globals at import time, so load it lazily on the client. */
function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      // Copied into /public by scripts/copy-pdf-worker.mjs (runs on install).
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return mod;
    });
  }
  return pdfjsPromise;
}

interface PageInfo {
  page: PDFPageProxy;
  ratio: number; // height / width
}

interface PdfViewProps {
  blob: Blob;
  /** CSS width each page is displayed at. */
  width: number;
}

export default function PdfView({ blob, width }: PdfViewProps) {
  const [pages, setPages] = useState<PageInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;
    setPages(null);
    setError(null);

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = new Uint8Array(await blob.arrayBuffer());
        doc = await pdfjs.getDocument({ data }).promise;
        const list: PageInfo[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          list.push({ page, ratio: vp.height / vp.width });
          if (cancelled) return;
        }
        if (!cancelled) setPages(list);
      } catch (err) {
        console.error("[mathview] PDF load failed", err);
        if (!cancelled) setError("Couldn't open this PDF.");
      }
    })();

    return () => {
      cancelled = true;
      doc?.destroy();
    };
  }, [blob]);

  if (error) return <div className={styles.previewMessage}>{error}</div>;
  if (!pages) return <div className={styles.previewMessage}>Loading PDF…</div>;

  return (
    <div className={styles.pdfPages}>
      {pages.map((p, i) => (
        <PdfPage key={i} info={p} width={width} />
      ))}
    </div>
  );
}

function PdfPage({ info, width }: { info: PageInfo; width: number }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const renderedWidthRef = useRef(0);
  const taskRef = useRef<RenderTask | null>(null);

  // Only render pages near the viewport.
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // (Re)render at the current zoom, debounced so zooming stays smooth.
  useEffect(() => {
    if (!visible || width <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const target = Math.min(Math.round(width * dpr), 6000);
    if (Math.abs(target - renderedWidthRef.current) < 2) return;

    const t = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      taskRef.current?.cancel();
      const base = info.page.getViewport({ scale: 1 });
      const viewport = info.page.getViewport({ scale: target / base.width });
      // Render offscreen, then swap, so the page never flashes blank.
      const off = document.createElement("canvas");
      off.width = Math.floor(viewport.width);
      off.height = Math.floor(viewport.height);
      const ctx = off.getContext("2d");
      if (!ctx) return;
      const task = info.page.render({ canvasContext: ctx, viewport });
      taskRef.current = task;
      try {
        await task.promise;
        canvas.width = off.width;
        canvas.height = off.height;
        canvas.getContext("2d")?.drawImage(off, 0, 0);
        renderedWidthRef.current = target;
      } catch {
        /* cancelled by a newer render */
      }
    }, renderedWidthRef.current ? 150 : 0);

    return () => clearTimeout(t);
  }, [visible, width, info]);

  useEffect(() => () => taskRef.current?.cancel(), []);

  return (
    <div
      ref={holderRef}
      className={styles.pdfPage}
      style={{ width, height: Math.round(width * info.ratio) }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
