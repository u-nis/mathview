"use client";

import { useEffect, useState } from "react";
import { useDocument } from "./DocumentProvider";
import { MATH_MODE_EVENT } from "@/components/Lexical/Math/plugins/MathModeHintPlugin";
import styles from "./DocumentTitle.module.css";

/** Right side of the top bar: math-mode hint and a quiet "Saved" status. */
export function DocumentTitle() {
  const { currentDocument, lastSavedAt } = useDocument();
  const [inMath, setInMath] = useState(false);

  useEffect(() => {
    const onMode = (e: Event) => setInMath(!!(e as CustomEvent<{ active: boolean }>).detail?.active);
    window.addEventListener(MATH_MODE_EVENT, onMode);
    return () => window.removeEventListener(MATH_MODE_EVENT, onMode);
  }, []);

  if (!currentDocument) return null;

  return (
    <div className={styles.container}>
      <span className={`${styles.hint} ${inMath ? styles.hintActive : ""}`} aria-live="polite">
        {inMath ? (
          <>
            <span className={styles.modeDot} aria-hidden="true" />
            Math mode · <kbd className={styles.kbd}>Enter</kbd> or <kbd className={styles.kbd}>Esc</kbd> to exit
          </>
        ) : (
          <>
            Type <kbd className={styles.kbd}>$$</kbd> for math
          </>
        )}
      </span>
      {lastSavedAt && <span className={styles.status}>Saved in this browser</span>}
    </div>
  );
}
