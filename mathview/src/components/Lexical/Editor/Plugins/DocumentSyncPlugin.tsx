"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, CLEAR_HISTORY_COMMAND } from "lexical";
import { useDocument } from "@/components/Document/DocumentProvider";
import { $repairMathRows } from "@/components/Lexical/Math/utils/repairRows";

const AUTOSAVE_DELAY = 400;
const LOAD_TAG = "mathview-load";

/**
 * Keeps the single Lexical editor in sync with the active document tab.
 * Content is autosaved to the browser (localStorage) shortly after each edit,
 * and flushed immediately when switching tabs, pressing ⌘S, or leaving the page.
 */
export function DocumentSyncPlugin() {
  const [editor] = useLexicalComposerContext();
  const { ready, activeId, loadContent, saveContent, registerFlush } = useDocument();

  const docIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const loadingRef = useRef(false);

  // Write pending edits for the doc currently shown in the editor.
  const flushRef = useRef<() => void>(() => {});
  flushRef.current = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current || !docIdRef.current) return;
    pendingRef.current = false;
    saveContent(docIdRef.current, editor.getEditorState().toJSON());
  };

  useEffect(() => {
    const fn = () => flushRef.current();
    registerFlush(fn);
    return () => registerFlush(null);
  }, [registerFlush]);

  // Load the active document into the editor whenever the tab changes.
  useEffect(() => {
    if (!ready || !activeId) return;
    flushRef.current(); // anything left for the previous doc
    docIdRef.current = activeId;
    pendingRef.current = false;
    loadingRef.current = true;

    const content = loadContent(activeId);
    let loaded = false;
    if (content) {
      try {
        const state = editor.parseEditorState(content as string);
        editor.setEditorState(state, { tag: LOAD_TAG });
        editor.update(() => $repairMathRows(), { tag: LOAD_TAG, discrete: true });
        loaded = true;
      } catch (error) {
        console.error("Failed to load document content:", error);
      }
    }
    if (!loaded) {
      editor.update(
        () => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        },
        { tag: LOAD_TAG }
      );
    }
    // Undo history shouldn't cross documents.
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    const t = setTimeout(() => {
      loadingRef.current = false;
    }, 50);
    return () => clearTimeout(t);
  }, [ready, activeId, editor, loadContent]);

  // Autosave on edits.
  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
      if (loadingRef.current || tags.has(LOAD_TAG)) return;
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      pendingRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flushRef.current(), AUTOSAVE_DELAY);
    });
  }, [editor]);

  // ⌘S / File → Save, and save when the tab is hidden or closed.
  useEffect(() => {
    const save = () => {
      pendingRef.current = true; // force a write even if nothing changed
      flushRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flushRef.current();
    };
    const onUnload = () => flushRef.current();

    window.addEventListener("mathview:save", save);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("mathview:save", save);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
      flushRef.current();
    };
  }, []);

  return null;
}
