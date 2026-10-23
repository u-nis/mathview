"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ExportPlugin.module.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface DocumentDimensions {
  pageWidth: number;
  pageHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

/**
 * Get document dimensions from the editor DOM elements
 */
function getDocumentDimensions(): DocumentDimensions {
  const editorContent = document.querySelector('[data-testid="editor-content"]') as HTMLElement;
  const editorContainer = editorContent?.parentElement;

  // Default dimensions (US Letter-ish at 96 DPI)
  const defaults: DocumentDimensions = {
    pageWidth: 816,
    pageHeight: 1056,
    marginTop: 72,
    marginRight: 72,
    marginBottom: 72,
    marginLeft: 72,
  };

  if (!editorContent || !editorContainer) {
    return defaults;
  }

  // Get page dimensions from container
  const containerStyles = window.getComputedStyle(editorContainer);
  const pageWidth = parseFloat(containerStyles.width) || defaults.pageWidth;
  const pageHeight = parseFloat(containerStyles.height) || defaults.pageHeight;

  // Get margins from editor-content inline styles (set by React state)
  const marginTop = parseFloat(editorContent.style.paddingTop) || defaults.marginTop;
  const marginRight = parseFloat(editorContent.style.paddingRight) || defaults.marginRight;
  const marginLeft = parseFloat(editorContent.style.paddingLeft) || defaults.marginLeft;
  // Bottom margin isn't set in the editor, use default
  const marginBottom = defaults.marginBottom;

  return {
    pageWidth,
    pageHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
  };
}

/** Clone the rendered editor so export keeps the exact on-screen node and style tree. */
function getRenderedEditorHtml(rootElement: HTMLElement | null): string {
  if (!rootElement) return "";
  const clone = rootElement.cloneNode(true) as HTMLElement;
  clone.removeAttribute("contenteditable");
  clone.removeAttribute("data-lexical-editor");
  clone.removeAttribute("spellcheck");
  return clone.outerHTML;
}

/** Collect the same compiled stylesheets used by the live editor preview. */
function collectDocumentCss(): string {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
      } catch {
        // Cross-origin stylesheets cannot be read by the browser.
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * The PDF is rendered by a remote browser that can't reach this app's /fonts,
 * so inline every same-origin font file the CSS references as a data: URL.
 */
async function inlineFontUrls(css: string): Promise<string> {
  const urls = new Set<string>();
  for (const m of css.matchAll(/url\("?([^")]+\.woff2)"?\)/g)) urls.add(m[1]);

  const dataUrls = new Map<string, string>();
  await Promise.all(
    Array.from(urls, async (url) => {
      try {
        const res = await fetch(new URL(url, document.baseURI));
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        dataUrls.set(url, dataUrl);
      } catch {
        // Leave the URL as-is; the PDF falls back to another font for that face.
      }
    })
  );

  return css.replace(/url\("?([^")]+\.woff2)"?\)/g, (match, url: string) => {
    const dataUrl = dataUrls.get(url);
    return dataUrl ? `url("${dataUrl}")` : match;
  });
}

/** Build an HTML document that uses the site's actual editor and math CSS. */
function buildHtmlDocument(
  content: string,
  dimensions: DocumentDimensions,
  documentCss: string,
  typography: { fontFamily: string; fontSize: string; lineHeight: string; color: string; direction: string }
): string {
  const { pageWidth, pageHeight, marginTop, marginRight, marginBottom, marginLeft } = dimensions;
  const contentWidth = pageWidth - marginLeft - marginRight;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <base href="${document.baseURI}">
  <title>MathView Export</title>
  <style>
    ${documentCss}
    @page { size: ${pageWidth}px ${pageHeight}px; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize};
      line-height: ${typography.lineHeight};
      color: ${typography.color};
      direction: ${typography.direction};
      background: #fff;
    }
    .page {
      width: ${pageWidth}px;
      min-height: ${pageHeight}px;
      padding: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;
      box-sizing: border-box;
      background: #fff;
    }
    .content { width: ${contentWidth}px; }
  </style>
</head>
<body>
  <div class="page"><div class="content">${content}</div></div>
</body>
</html>`;
}

type ExportStatus = "preparing" | "rendering" | "downloading" | "error";

const EXPORT_STATUS_LABELS: Record<ExportStatus, string> = {
  preparing: "Preparing document…",
  rendering: "Rendering PDF…",
  downloading: "Downloading PDF…",
  error: "PDF export failed.",
};

export function ExportPlugin() {
  const [editor] = useLexicalComposerContext();
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);

  useEffect(() => {
    const handleExportHtml = () => {
      const renderedEditorHtml = getRenderedEditorHtml(editor.getRootElement());
      const dimensions = getDocumentDimensions();
      const editorInput = document.querySelector('[data-testid="editor-content"] [contenteditable="true"]') as HTMLElement | null;
      const editorStyles = editorInput ? window.getComputedStyle(editorInput) : window.getComputedStyle(document.body);
      const typography = {
        fontFamily: editorStyles.fontFamily,
        fontSize: editorStyles.fontSize,
        lineHeight: editorStyles.lineHeight,
        color: editorStyles.color,
        direction: editorStyles.direction,
      };
      const fullHtml = buildHtmlDocument(renderedEditorHtml, dimensions, collectDocumentCss(), typography);

      console.log("Exported HTML with dimensions:", dimensions);

      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mathview-export.html";
      link.click();
      URL.revokeObjectURL(url);
    };

    const handleExportPdf = async () => {
      setExportStatus("preparing");
      try {
        // Let React paint the status before serializing and sending the document.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const html = getRenderedEditorHtml(editor.getRootElement());

        const dimensions = getDocumentDimensions();
        const editorInput = document.querySelector('[data-testid="editor-content"] [contenteditable="true"]') as HTMLElement | null;
        const editorStyles = editorInput ? window.getComputedStyle(editorInput) : window.getComputedStyle(document.body);
        const typography = {
          fontFamily: editorStyles.fontFamily,
          fontSize: editorStyles.fontSize,
          lineHeight: editorStyles.lineHeight,
          color: editorStyles.color,
          direction: editorStyles.direction,
        };
        const fullHtml = buildHtmlDocument(html, dimensions, await inlineFontUrls(collectDocumentCss()), typography);

        console.log("Exporting PDF with dimensions:", dimensions);
        setExportStatus("rendering");

        const response = await fetch("/api/export-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ html: fullHtml, dimensions }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate PDF");
        }

        setExportStatus("downloading");
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "mathview-export.pdf";
        link.click();
        URL.revokeObjectURL(url);
        window.setTimeout(() => setExportStatus(null), 900);
      } catch (error) {
        console.error("PDF export error:", error);
        setExportStatus("error");
        window.setTimeout(() => setExportStatus(null), 4000);
      }
    };

    window.addEventListener("mathview:export-html", handleExportHtml);
    window.addEventListener("mathview:export-pdf", handleExportPdf);

    return () => {
      window.removeEventListener("mathview:export-html", handleExportHtml);
      window.removeEventListener("mathview:export-pdf", handleExportPdf);
    };
  }, [editor]);

  // Portaled to <body>: the editor sits inside a scaled (transformed) window,
  // which would otherwise pin this "fixed" toast to the editor, not the viewport.
  return exportStatus ? createPortal(
    <div
      className={styles.exportStatus}
      role="status"
      aria-live="polite"
      aria-busy={exportStatus !== "error"}
    >
      <span>{EXPORT_STATUS_LABELS[exportStatus]}</span>
      {exportStatus !== "error" && (
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressIndicator} />
        </div>
      )}
    </div>,
    document.body
  ) : null;
}
