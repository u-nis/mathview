"use client";
import React, { useEffect, useRef, useState } from "react";

interface LeftRulerProps {
  height: number; // total ruler height in px
  value: number; // current top margin in px
  onChange: (topPx: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
}

export default function LeftRuler({
  height,
  value,
  onChange,
  min = 0,
  max = 400,
  defaultValue = 72,
}: LeftRulerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(localValue);

  useEffect(() => {
    setLocalValue(value);
    localValueRef.current = value;
  }, [value]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cappedY = Math.max(0, Math.min(rect.height, y));
    const newTop = clamp(cappedY);
    if (newTop !== localValueRef.current) {
      localValueRef.current = newTop;
      setLocalValue(newTop);
      onChange(newTop);
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const onStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const onDoubleClickHandle = (e: React.MouseEvent) => {
    e.preventDefault();
    const newTop = clamp(defaultValue);
    if (newTop !== localValueRef.current) {
      localValueRef.current = newTop;
      setLocalValue(newTop);
      onChange(newTop);
    }
  };

  // Build vertical ticks and labels (96px per inch)
  const DPI = 96;
  const ticks: Array<{
    y: number;
    type: "eighth" | "quarter" | "half" | "inch";
  }> = [];
  const labels: Array<{ y: number; label: string }> = [];
  {
    const totalInches = Math.ceil(height / DPI) + 1;
    for (let i = 0; i <= totalInches; i++) {
      for (let j = 0; j < 8; j++) {
        const y = i * DPI + (DPI / 8) * j;
        if (y < 0 || y > height) continue;
        let type: "eighth" | "quarter" | "half" | "inch" = "eighth";
        if (j === 0) {
          type = "inch";
          if (i > 0) labels.push({ y, label: String(i) });
        } else if (j % 4 === 0) {
          type = "half";
        } else if (j % 2 === 0) {
          type = "quarter";
        }
        ticks.push({ y, type });
      }
    }
  }

  return (
    <div
      className="vertical-ruler left-side"
      style={{ ["--ruler-height" as any]: `${height}px` }}
    >
      <div className="vertical-track" ref={trackRef}>
        <div className="vertical-ticks">
          {ticks.map((t, idx) => (
            <div
              key={idx}
              className={`vertical-tick ${t.type}`}
              style={{ ["--tick-top" as any]: `${t.y}px` }}
            />
          ))}
          {labels.map((l, idx) => (
            <div
              key={`vlbl-${idx}`}
              className="vertical-label"
              style={{ ["--label-top" as any]: `${l.y}px` }}
            >
              {l.label}
            </div>
          ))}
        </div>
        {/* Single handle pointing left to match right ruler */}
        <button
          type="button"
          className="vertical-handle"
          style={{ ["--handle-top" as any]: `${localValue}px` }}
          onMouseDown={onStartDrag}
          onDoubleClick={onDoubleClickHandle}
          aria-label={`Adjust top margin (${Math.round(localValue)}px)`}
          title={`Top margin: ${Math.round(localValue)}px`}
        />
      </div>
    </div>
  );
}
