"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

/**
 * ExponentAlignmentPlugin
 *
 * When an exponent is inside a fraction row, this plugin adds margin-left
 * to the exponent equal to the superscript's width. This makes the base
 * appear centered rather than the whole exponent (base + superscript).
 */
export function ExponentAlignmentPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const updateExponentAlignment = () => {
      const root = editor.getRootElement();
      if (!root) return;

      // Find all exponents inside fraction rows
      const fractionRows = root.querySelectorAll('[data-lexical-math="fraction"] > [data-lexical-math="row"]');

      fractionRows.forEach((row) => {
        // Only apply centering if exponent is the only child in the row
        const children = row.children;
        if (children.length === 1 && children[0].getAttribute('data-lexical-math') === 'exponent') {
          const exponentEl = children[0] as HTMLElement;
          const superscriptRow = exponentEl.querySelector(':scope > [data-lexical-math="row"]:last-child') as HTMLElement;

          if (superscriptRow) {
            const superscriptWidth = superscriptRow.getBoundingClientRect().width;
            exponentEl.style.marginLeft = `${superscriptWidth}px`;
          }
        } else {
          // Clear any previously set margin on exponents that are no longer alone
          const exponents = row.querySelectorAll(':scope > [data-lexical-math="exponent"]');
          exponents.forEach((exponent) => {
            (exponent as HTMLElement).style.marginLeft = '';
          });
        }
      });
    };

    // Update on editor changes
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(updateExponentAlignment);
    });

    // Also use ResizeObserver to handle content size changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateExponentAlignment);
    });

    const root = editor.getRootElement();
    if (root) {
      resizeObserver.observe(root);
    }

    // Initial alignment
    requestAnimationFrame(updateExponentAlignment);

    return () => {
      removeUpdateListener();
      resizeObserver.disconnect();
    };
  }, [editor]);

  return null;
}
