"use client";
import React, { useEffect, useRef, useState } from "react";

interface MarginRulerProps {
  width: number; // total ruler width in px
  minMargin?: number; // minimum margin px
  maxMargin?: number; // maximum margin px (per side)
  leftMargin: number; // current left margin px
  rightMargin: number; // current right margin px
  onChange: (leftPx: number, rightPx: number) => void;
}

export default function MarginRuler({
  width,
  minMargin = 0,
  maxMargin = 400,
  leftMargin,
  rightMargin,
  onChange,
}: MarginRulerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<null | "left" | "right">(null);
  const [localLeft, setLocalLeft] = useState(leftMargin);
  const [localRight, setLocalRight] = useState(rightMargin);
  const localLeftRef = useRef(localLeft);
  const localRightRef = useRef(localRight);

  useEffect(() => {
    setLocalLeft(leftMargin);
    localLeftRef.current = leftMargin;
  }, [leftMargin]);
  useEffect(() => {
    setLocalRight(rightMargin);
    localRightRef.current = rightMargin;
  }, [rightMargin]);

  const clamp = (val: number) => Math.max(minMargin, Math.min(maxMargin, val));

  const handleMouseMove = (e: MouseEvent) => {
    const side = draggingRef.current;
    if (!side || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cappedX = Math.max(0, Math.min(rect.width, x));

    if (side === "left") {
      const newLeft = clamp(cappedX);
      const maxLeft = rect.width - localRightRef.current - 40; // ensure content area min width
      const finalLeft = Math.min(newLeft, Math.max(minMargin, maxLeft));
      if (finalLeft !== localLeftRef.current) {
        localLeftRef.current = finalLeft;
        setLocalLeft(finalLeft);
        onChange(finalLeft, localRightRef.current);
      }
    } else if (side === "right") {
      const fromRight = rect.width - cappedX;
      const newRight = clamp(fromRight);
      const maxRight = rect.width - localLeftRef.current - 40;
      const finalRight = Math.min(newRight, Math.max(minMargin, maxRight));
      if (finalRight !== localRightRef.current) {
        localRightRef.current = finalRight;
        setLocalRight(finalRight);
        onChange(localLeftRef.current, finalRight);
      }
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const onStartDrag = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = side;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const leftHandleX = localLeft;
  const rightHandleX = width - localRight;

  // Build ticks and labels similar to Google Docs (96px per inch)
  const DPI = 96; // pixels per inch approximation
  const ticks: Array<{ x: number; type: "eighth" | "quarter" | "half" | "inch" }>
    = [];
  const labels: Array<{ x: number; label: string }>
    = [];
  {
    const totalInches = Math.ceil(width / DPI) + 1;
    for (let i = 0; i <= totalInches; i++) {
      for (let j = 0; j < 8; j++) {
        const x = i * DPI + (DPI / 8) * j;
        if (x < 0 || x > width) continue;
        let type: "eighth" | "quarter" | "half" | "inch" = "eighth";
        if (j === 0) {
          type = "inch";
          if (i > 0) labels.push({ x, label: String(i) });
        } else if (j % 4 === 0) {
          type = "half";
        } else if (j % 2 === 0) {
          type = "quarter";
        }
        ticks.push({ x, type });
      }
    }
  }

  return (
    <div className="editor-margin-ruler" style={{ width }}>
      <div className="ruler-track" ref={trackRef} style={{ width }}>
        {/* tick marks */}
        <div className="ruler-ticks">
          {ticks.map((t, idx) => (
            <div key={idx} className={`ruler-tick ${t.type}`} style={{ left: t.x }} />
          ))}
          {labels.map((l, idx) => (
            <div key={`lbl-${idx}`} className="ruler-label" style={{ left: l.x }}>
              {l.label}
            </div>
          ))}
        </div>
        {/* shaded margins */}
        {/* handles */}
        <button
          type="button"
          className="ruler-handle left"
          style={{ left: leftHandleX }}
          onMouseDown={onStartDrag("left")}
          aria-label="Adjust left margin"
          title={`Left margin: ${Math.round(localLeft)}px`}
        />
        <button
          type="button"
          className="ruler-handle right"
          style={{ left: rightHandleX }}
          onMouseDown={onStartDrag("right")}
          aria-label="Adjust right margin"
          title={`Right margin: ${Math.round(localRight)}px`}
        />
      </div>
    </div>
  );
}
