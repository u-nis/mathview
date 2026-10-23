"use client";

import { useDocument } from "./DocumentProvider";
import styles from "./DocumentTitle.module.css";

/** Quiet "Saved" status in the top bar. Renaming happens in the editor's title bar. */
export function DocumentTitle() {
  const { currentDocument, lastSavedAt } = useDocument();
  if (!currentDocument) return null;

  return (
    <div className={styles.container}>
      {lastSavedAt && <span className={styles.status}>Saved in this browser</span>}
    </div>
  );
}
