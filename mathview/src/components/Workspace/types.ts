export type ResizeEdge = "e" | "w" | "s" | "se" | "sw";

export interface PanelState {
  id: string; // also the IndexedDB key of the file
  name: string;
  kind: "image" | "pdf";
  x: number;
  y: number;
  w: number;
  h: number;
  zoom: number;
  open: boolean;
  /** Scroll position as a fraction of content size, so it survives zoom changes. */
  scrollX?: number;
  scrollY?: number;
}

export interface EditorWindowState {
  x: number;
  y: number;
  scale: number;
}

export interface WorkspaceState {
  editor: EditorWindowState | null;
  panels: PanelState[];
}
