"use client";
import React, { createContext, useContext, useState } from "react";
import { MATH_EDITOR_CONSTANTS } from "../mathview/core/constants";

type FontSizeContextType = {
  fontSize: number;
  setFontSize: (size: number) => void;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

/**
 * Provides font size state to descendant components via React context.
 *
 * The provider initializes `fontSize` from `MATH_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE`
 * and supplies `{ fontSize, setFontSize }` through `FontSizeContext` so consumers
 * can read and update the current font size.
 *
 * @param children - React nodes that will have access to the font size context
 * @returns A context provider wrapping `children`
 */
export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(
    MATH_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE
  ); // Match CSS default

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}
