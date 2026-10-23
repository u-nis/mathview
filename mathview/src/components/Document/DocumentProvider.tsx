"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { readJSON, removeKey, uid, writeJSON } from "@/lib/storage/local";

/**
 * Documents are kept entirely in the browser (localStorage):
 *   mathview:docs          -> { docs: DocumentMeta[], activeId }
 *   mathview:doc:<id>      -> serialized Lexical editor state
 */

export interface DocumentMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface DocIndex {
  docs: DocumentMeta[];
  activeId: string | null;
}

const INDEX_KEY = "mathview:docs";
const contentKey = (id: string) => `mathview:doc:${id}`;

interface DocumentContextType {
  ready: boolean;
  documents: DocumentMeta[];
  activeId: string | null;
  currentDocument: DocumentMeta | null;
  lastSavedAt: number | null;
  createDocument: () => string;
  switchDocument: (id: string) => void;
  renameDocument: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;
  loadContent: (id: string) => unknown | null;
  saveContent: (id: string, content: unknown) => void;
  /** The editor registers a function that writes any pending edits immediately. */
  registerFlush: (fn: (() => void) | null) => void;
  flush: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

function newMeta(title: string): DocumentMeta {
  const now = Date.now();
  return { id: uid(), title, createdAt: now, updatedAt: now };
}

function nextUntitled(docs: DocumentMeta[]): string {
  const taken = new Set(docs.map((d) => d.title));
  if (!taken.has("Untitled")) return "Untitled";
  let i = 2;
  while (taken.has(`Untitled ${i}`)) i++;
  return `Untitled ${i}`;
}

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const flushRef = useRef<(() => void) | null>(null);
  const docsRef = useRef<DocumentMeta[]>([]);
  docsRef.current = documents;

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    const stored = readJSON<DocIndex>(INDEX_KEY, { docs: [], activeId: null });
    let docs = Array.isArray(stored.docs) ? stored.docs : [];
    if (docs.length === 0) docs = [newMeta("Untitled")];
    const active =
      stored.activeId && docs.some((d) => d.id === stored.activeId)
        ? stored.activeId
        : docs[0].id;
    docsRef.current = docs;
    setDocuments(docs);
    setActiveId(active);
    setReady(true);
  }, []);

  // Persist the index whenever it changes.
  useEffect(() => {
    if (!ready) return;
    writeJSON(INDEX_KEY, { docs: documents, activeId } satisfies DocIndex);
  }, [ready, documents, activeId]);

  const registerFlush = useCallback((fn: (() => void) | null) => {
    flushRef.current = fn;
  }, []);

  const flush = useCallback(() => {
    flushRef.current?.();
  }, []);

  const loadContent = useCallback((id: string) => {
    return readJSON<unknown | null>(contentKey(id), null);
  }, []);

  const saveContent = useCallback((id: string, content: unknown) => {
    if (!docsRef.current.some((d) => d.id === id)) return; // deleted meanwhile
    writeJSON(contentKey(id), content);
    const now = Date.now();
    setLastSavedAt(now);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, updatedAt: now } : d))
    );
  }, []);

  const switchDocument = useCallback(
    (id: string) => {
      if (id === activeId) return;
      flushRef.current?.(); // save the outgoing doc first
      setActiveId(id);
    },
    [activeId]
  );

  const createDocument = useCallback(() => {
    flushRef.current?.();
    const meta = newMeta(nextUntitled(docsRef.current));
    docsRef.current = [...docsRef.current, meta];
    setDocuments(docsRef.current);
    setActiveId(meta.id);
    return meta.id;
  }, []);

  const renameDocument = useCallback((id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: clean, updatedAt: Date.now() } : d))
    );
  }, []);

  const deleteDocument = useCallback(
    (id: string) => {
      const prev = docsRef.current;
      const idx = prev.findIndex((d) => d.id === id);
      if (idx === -1) return;
      removeKey(contentKey(id));
      let next = prev.filter((d) => d.id !== id);
      if (next.length === 0) next = [newMeta("Untitled")];
      docsRef.current = next;
      setDocuments(next);
      if (id === activeId || !next.some((d) => d.id === activeId)) {
        setActiveId(next[Math.min(idx, next.length - 1)].id);
      }
    },
    [activeId]
  );

  const currentDocument = documents.find((d) => d.id === activeId) ?? null;

  return (
    <DocumentContext.Provider
      value={{
        ready,
        documents,
        activeId,
        currentDocument,
        lastSavedAt,
        createDocument,
        switchDocument,
        renameDocument,
        deleteDocument,
        loadContent,
        saveContent,
        registerFlush,
        flush,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
