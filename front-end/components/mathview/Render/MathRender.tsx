"use client";
import React, { useRef } from "react";
import styles from "./MathRender.module.css";
import type {
  Cursor,
  Exponent,
  Fraction,
  MathViewConfig,
  Node,
  Row,
  Symbol,
} from "../core/types";

interface MathRenderProps {
  cursor: Cursor | null;
  config: MathViewConfig;
  showCursor: boolean;
  onNodeClick?: (node: Node) => void;
}

// We prefer relative scaling with em for compounding (fractions/exponents)

const isRow = (n: Node): n is Row => n.type === "row";
const isSymbol = (n: Node): n is Symbol => n.type === "symbol";
const isFraction = (n: Node): n is Fraction => n.type === "fraction";
const isExponent = (n: Node): n is Exponent => n.type === "exponent";

const isDigitSymbol = (n: Node | null | undefined): boolean => {
  return !!(n && n.type === "symbol" && /^[0-9]$/.test((n as Symbol).value));
};

function RenderRow({
  row,
  depth,
  config,
  showCursor,
  onNodeClick,
}: {
  row: Row;
  depth: number;
  config: MathViewConfig;
  showCursor: boolean;
  onNodeClick?: (node: Node) => void;
}) {
  const children = row.children;

  const hasLeadingCursor = children[0]?.type === "cursor";

  const elements = [] as React.ReactNode[];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === "cursor") continue;

    // Find previous non-cursor node for spacing logic
    let prevNonCursor: Node | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (children[j].type !== "cursor") {
        prevNonCursor = children[j];
        break;
      }
    }

    // Default: add spacing except digit-digit adjacency
    let marginLeft = 0;
    const isCurrentDigit = isDigitSymbol(child);
    const isPrevDigit = isDigitSymbol(prevNonCursor);

    if (prevNonCursor) {
      if (!(isPrevDigit && isCurrentDigit)) {
        marginLeft = 0.22;
      }
    }

    const nextIsCursor = children[i + 1]?.type === "cursor";

    elements.push(
      <span
        key={child.id}
        className={styles.item}
        style={{ marginLeft: marginLeft ? `${marginLeft}em` : undefined }}
      >
        <RenderNode
          node={child}
          depth={depth}
          config={config}
          showCursor={showCursor}
          onNodeClick={onNodeClick}
        />
        {showCursor && nextIsCursor && (
          <span
            className={styles.caretAbs}
            style={{ backgroundColor: config.cursorColor }}
          />
        )}
      </span>
    );
  }

  return (
    <span className={styles.row}>
      <span className={styles.rowInner}>
        {showCursor && hasLeadingCursor && (
          <span
            className={styles.caretStart}
            style={{ backgroundColor: config.cursorColor }}
          />
        )}
        {elements}
      </span>
    </span>
  );
}

function RenderFraction({
  frac,
  depth,
  config,
  showCursor,
  onNodeClick,
}: {
  frac: Fraction;
  depth: number;
  config: MathViewConfig;
  showCursor: boolean;
  onNodeClick?: (node: Node) => void;
}) {
  // Scale fraction to 85% of parent size; nesting compounds naturally
  return (
    <span className={styles.fraction} style={{ fontSize: "0.85em" }}>
      <span className={styles.numerator}>
        <RenderRow
          row={frac.numerator}
          depth={depth + 1}
          config={config}
          showCursor={showCursor}
          onNodeClick={onNodeClick}
        />
      </span>
      <span className={styles.denominator}>
        <RenderRow
          row={frac.denominator}
          depth={depth + 1}
          config={config}
          showCursor={showCursor}
          onNodeClick={onNodeClick}
        />
      </span>
    </span>
  );
}

function RenderExponent({
  exp,
  depth,
  config,
  showCursor,
  onNodeClick,
}: {
  exp: Exponent;
  depth: number;
  config: MathViewConfig;
  showCursor: boolean;
  onNodeClick?: (node: Node) => void;
}) {
  // Base inherits; raised reduced to 85%
  return (
    <span className={styles.exponent}>
      <span className={styles.expBase}>
        <RenderRow
          row={exp.base}
          depth={depth}
          config={config}
          showCursor={showCursor}
          onNodeClick={onNodeClick}
        />
      </span>
      <span className={styles.expRaised} style={{ fontSize: "0.85em" }}>
        <RenderRow
          row={exp.raised}
          depth={depth + 1}
          config={config}
          showCursor={showCursor}
          onNodeClick={onNodeClick}
        />
      </span>
    </span>
  );
}

function RenderNode({
  node,
  depth,
  config,
  showCursor,
  onNodeClick,
}: {
  node: Node;
  depth: number;
  config: MathViewConfig;
  showCursor: boolean;
  onNodeClick?: (node: Node) => void;
}) {
  if (node.type === "cursor") {
    return null;
  }
  if (isSymbol(node)) {
    const value = node.value;
    const isOperator = /^[+\-*/=]$/.test(value);
    const isDigit = /^[0-9]$/.test(value);
    const className = `${styles.symbol}${
      isOperator ? " " + styles.operator : ""
    }${isDigit ? " " + styles.digit : ""}`;
    const display = value === "*" ? "·" : value;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onNodeClick) {
        onNodeClick(node);
      }
    };

    return (
      <span
        className={className}
        onClick={handleClick}
        style={{ cursor: "text" }}
      >
        {display}
      </span>
    );
  }
  if (isRow(node)) {
    return (
      <RenderRow
        row={node}
        depth={depth}
        config={config}
        showCursor={showCursor}
        onNodeClick={onNodeClick}
      />
    );
  }
  if (isFraction(node)) {
    return (
      <RenderFraction
        frac={node}
        depth={depth}
        config={config}
        showCursor={showCursor}
        onNodeClick={onNodeClick}
      />
    );
  }
  if (isExponent(node)) {
    return (
      <RenderExponent
        exp={node}
        depth={depth}
        config={config}
        showCursor={showCursor}
        onNodeClick={onNodeClick}
      />
    );
  }
  return null;
}

const MathRender: React.FC<MathRenderProps> = ({
  cursor,
  config,
  showCursor,
  onNodeClick,
}) => {
  if (!cursor || !cursor.root) return null;
  const rootRow = cursor.root;

  return (
    <span className={styles.root}>
      <RenderRow
        row={rootRow}
        depth={0}
        config={config}
        showCursor={showCursor}
        onNodeClick={onNodeClick}
      />
    </span>
  );
};

export default MathRender;
