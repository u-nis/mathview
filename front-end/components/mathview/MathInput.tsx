import React, { forwardRef } from "react";
import { Cursor } from "./core/types";
import { handleInput } from "./Logic/handleInput";

export interface MathInputProps {
  cursor: Cursor | null;
  setCursor: (cursor: Cursor) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onExitLeft?: () => void;
  onExitRight?: () => void;
}

const MathInput = forwardRef<HTMLDivElement, MathInputProps>(
  ({ cursor, setCursor, onFocus, onBlur, onExitLeft, onExitRight }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!cursor) return;
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        e.stopPropagation();
        handleInput(e.key, cursor, setCursor, {
          onExitLeft,
          onExitRight,
        });
      } else if (e.key.length === 1) {
        handleInput(e.key, cursor, setCursor, {
          onExitLeft,
          onExitRight,
        });
      }
    };

    return (
      <div
        ref={ref}
        className="w-full h-full outline-none"
        tabIndex={0}
        role="textbox"
        aria-label="Math input"
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  }
);

MathInput.displayName = "MathInput";

export default MathInput;
