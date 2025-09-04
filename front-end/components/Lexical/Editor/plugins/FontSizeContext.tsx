"use client";
import React, { createContext, useContext, useState } from "react";
import { MATH_EDITOR_CONSTANTS } from "../../../mathview/core/constants";

type FontSizeContextType = {
  fontSize: number;
  setFontSize: (size: number) => void;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

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
