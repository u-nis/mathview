import { LexicalEditor, LexicalNode, $isElementNode } from "lexical";
import { $isNumberNode } from "../nodes/NumberNode";
import { $isOperatorNode } from "../nodes/OperatorNode";
import { $isRowNode, RowNode } from "../nodes/RowNode";
import { $isGroupNode, GroupNode } from "../nodes/GroupNode";
import { $isFractionNode, FractionNode } from "../nodes/FractionNode";
import { $isMathExpressionNode, MathExpressionNode } from "../nodes/MathExpressionNode";

export type CursorPosition = {
  node: LexicalNode;
  offset: number;
};

export type CursorPositionWithCoords = CursorPosition & {
  x: number;
  y: number;
};

/**
 * Get all leaf nodes (NumberNode, OperatorNode) in a container.
 * Traverses into nested structures (Groups, Fractions) to find all leaves.
 */
export function getLeafNodesInContainer(container: RowNode | GroupNode): LexicalNode[] {
  const leaves: LexicalNode[] = [];

  function traverse(node: LexicalNode): void {
    if ($isNumberNode(node) || $isOperatorNode(node)) {
      leaves.push(node);
    } else if ($isRowNode(node) || $isGroupNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    } else if ($isFractionNode(node)) {
      // For fractions, only traverse the first row (numerator) for horizontal scanning
      // This is intentional - we don't want to mix numerator and denominator leaves
      traverse(node.numerator);
    }
  }

  const children = container.getChildren();
  for (const child of children) {
    traverse(child);
  }

  return leaves;
}

/**
 * Get the pixel X position of a cursor at a specific offset within a node.
 * Returns the X coordinate relative to the viewport.
 */
export function getCursorPixelX(
  editor: LexicalEditor,
  node: LexicalNode,
  offset: number
): number | null {
  const domElement = editor.getElementByKey(node.getKey());
  if (!domElement) return null;

  // For text nodes (Number, Operator), measure character position
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    const rect = domElement.getBoundingClientRect();

    if (offset === 0) {
      return rect.left;
    }

    const text = domElement.textContent || "";
    if (offset >= text.length) {
      return rect.right;
    }

    // Use Range API to measure exact character position
    const textNode = domElement.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, Math.min(offset, text.length));
      const rangeRect = range.getBoundingClientRect();
      return rangeRect.right;
    }

    // Fallback: estimate based on element width
    const charWidth = rect.width / Math.max(text.length, 1);
    return rect.left + charWidth * offset;
  }

  // For element nodes (Row, Group), return left edge
  const rect = domElement.getBoundingClientRect();
  return rect.left;
}

/**
 * Find the closest cursor position in a container given a target X coordinate.
 * Scans all leaf nodes and their character positions to find the best match.
 */
export function findClosestPositionAtX(
  editor: LexicalEditor,
  container: RowNode | GroupNode,
  targetX: number
): CursorPosition | null {
  const leaves = getLeafNodesInContainer(container);

  if (leaves.length === 0) {
    // Empty container - return position at container itself
    return { node: container, offset: 0 };
  }

  let bestPosition: CursorPosition | null = null;
  let bestDistance = Infinity;

  for (const leaf of leaves) {
    const domElement = editor.getElementByKey(leaf.getKey());
    if (!domElement) continue;

    const rect = domElement.getBoundingClientRect();
    const text = domElement.textContent || "";
    const textLength = text.length;

    // Check each character position (0 to textLength inclusive)
    for (let offset = 0; offset <= textLength; offset++) {
      const x = getCharacterX(domElement, offset, text);
      if (x === null) continue;

      const distance = Math.abs(x - targetX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPosition = { node: leaf, offset };
      }
    }
  }

  return bestPosition;
}

/**
 * Get the X coordinate for a character position within an element.
 */
function getCharacterX(
  element: HTMLElement,
  offset: number,
  text: string
): number | null {
  const rect = element.getBoundingClientRect();

  if (offset === 0) {
    return rect.left;
  }

  if (offset >= text.length) {
    return rect.right;
  }

  // Use Range API for precise measurement
  const textNode = element.firstChild;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, Math.min(offset, text.length));
    const rangeRect = range.getBoundingClientRect();
    return rangeRect.right;
  }

  // Fallback: linear interpolation
  const charWidth = rect.width / Math.max(text.length, 1);
  return rect.left + charWidth * offset;
}

/**
 * Check if cursor is at the end of the last leaf in a container.
 */
export function isAtContainerEnd(
  node: LexicalNode,
  offset: number,
  container: RowNode | GroupNode
): boolean {
  const lastChild = container.getLastChild();
  if (!lastChild) return true; // Empty container

  // Find the actual last leaf
  const lastLeaf = getLastLeafInNode(lastChild);
  if (!lastLeaf) return false;

  if (node.getKey() !== lastLeaf.getKey()) return false;

  // Check if at end of the leaf
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    return offset >= node.getTextContentSize();
  }

  return true;
}

/**
 * Check if cursor is at the start of the first leaf in a container.
 */
export function isAtContainerStart(
  node: LexicalNode,
  offset: number,
  container: RowNode | GroupNode
): boolean {
  const firstChild = container.getFirstChild();
  if (!firstChild) return true; // Empty container

  // Find the actual first leaf
  const firstLeaf = getFirstLeafInNode(firstChild);
  if (!firstLeaf) return false;

  if (node.getKey() !== firstLeaf.getKey()) return false;

  // Check if at start of the leaf
  return offset === 0;
}

/**
 * Get the first leaf node within a node (handles nesting).
 */
function getFirstLeafInNode(node: LexicalNode): LexicalNode | null {
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    return node;
  }

  if ($isFractionNode(node)) {
    return getFirstLeafInNode(node.numerator);
  }

  if ($isElementNode(node)) {
    const firstChild = node.getFirstChild();
    return firstChild ? getFirstLeafInNode(firstChild) : null;
  }

  return null;
}

/**
 * Get the last leaf node within a node (handles nesting).
 */
function getLastLeafInNode(node: LexicalNode): LexicalNode | null {
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    return node;
  }

  if ($isFractionNode(node)) {
    return getLastLeafInNode(node.denominator);
  }

  if ($isElementNode(node)) {
    const lastChild = node.getLastChild();
    return lastChild ? getLastLeafInNode(lastChild) : null;
  }

  return null;
}

/**
 * Get ALL leaf nodes inside a fraction (numerator, denominator, and any nested fractions).
 */
export function getAllLeavesInFraction(fraction: FractionNode): LexicalNode[] {
  const leaves: LexicalNode[] = [];

  function traverse(node: LexicalNode): void {
    if ($isNumberNode(node) || $isOperatorNode(node)) {
      leaves.push(node);
    } else if ($isRowNode(node) || $isGroupNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    } else if ($isFractionNode(node)) {
      traverse(node.numerator);
      traverse(node.denominator);
    }
  }

  traverse(fraction.numerator);
  traverse(fraction.denominator);
  return leaves;
}

/**
 * Get all fraction rows (numerator and denominator) inside a fraction, recursively.
 */
function getFractionRowsInFraction(fraction: FractionNode): RowNode[] {
  const rows: RowNode[] = [];

  function traverse(node: LexicalNode): void {
    if ($isFractionNode(node)) {
      rows.push(node.numerator);
      rows.push(node.denominator);
      traverse(node.numerator);
      traverse(node.denominator);
    } else if ($isRowNode(node) || $isGroupNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    }
  }

  traverse(fraction.numerator);
  traverse(fraction.denominator);
  return rows;
}

function isDescendantOf(node: LexicalNode, ancestor: LexicalNode): boolean {
  let current: LexicalNode | null = node;
  while (current) {
    if (current === ancestor) return true;
    current = current.getParent();
  }
  return false;
}

/**
 * Get all possible cursor positions with pixel coordinates within a fraction only.
 * Includes positions for empty rows (numerator/denominator with no content) so
 * vertical movement can land in them.
 */
export function getCursorPositionsWithCoordsInFraction(
  editor: LexicalEditor,
  fraction: FractionNode
): CursorPositionWithCoords[] {
  const leaves = getAllLeavesInFraction(fraction);
  const positions: CursorPositionWithCoords[] = [];

  for (const leaf of leaves) {
    const domElement = editor.getElementByKey(leaf.getKey());
    if (!domElement) continue;

    const text = domElement.textContent || "";
    const textLength = text.length;

    const rect = domElement.getBoundingClientRect();
    const y = rect.top + rect.height / 2;

    for (let offset = 0; offset <= textLength; offset++) {
      const x = getCharacterX(domElement, offset, text);
      if (x === null) continue;

      positions.push({ node: leaf, offset, x, y });
    }
  }

  // Add one position per empty fraction row so we can move up/down into empty numerator/denominator
  const fractionRows = getFractionRowsInFraction(fraction);
  for (const row of fractionRows) {
    const hasPositionInRow = positions.some(
      p => p.node === row || isDescendantOf(p.node, row)
    );
    if (!hasPositionInRow) {
      const domElement = editor.getElementByKey(row.getKey());
      if (domElement) {
        const rect = domElement.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        positions.push({ node: row, offset: 0, x, y });
      }
    }
  }

  return positions;
}

/**
 * Find the closest cursor position ABOVE the current position, within the given fraction only.
 * Never returns a position outside the fraction (e.g. for nested fractions, stays in level-0).
 */
export function findPositionAboveInFraction(
  editor: LexicalEditor,
  fraction: FractionNode,
  currentX: number,
  currentY: number
): CursorPosition | null {
  const positions = getCursorPositionsWithCoordsInFraction(editor, fraction);

  const threshold = 5;
  const abovePositions = positions.filter(p => p.y < currentY - threshold);

  if (abovePositions.length === 0) return null;

  const closestY = Math.max(...abovePositions.map(p => p.y));
  const yTolerance = 10;
  const sameRowPositions = abovePositions.filter(
    p => Math.abs(p.y - closestY) < yTolerance
  );

  let bestPosition: CursorPositionWithCoords | null = null;
  let bestXDistance = Infinity;

  for (const pos of sameRowPositions) {
    const xDistance = Math.abs(pos.x - currentX);
    if (xDistance < bestXDistance) {
      bestXDistance = xDistance;
      bestPosition = pos;
    }
  }

  return bestPosition ? { node: bestPosition.node, offset: bestPosition.offset } : null;
}

/**
 * Find the closest cursor position BELOW the current position, within the given fraction only.
 * Never returns a position outside the fraction.
 */
export function findPositionBelowInFraction(
  editor: LexicalEditor,
  fraction: FractionNode,
  currentX: number,
  currentY: number
): CursorPosition | null {
  const positions = getCursorPositionsWithCoordsInFraction(editor, fraction);

  const threshold = 5;
  const belowPositions = positions.filter(p => p.y > currentY + threshold);

  if (belowPositions.length === 0) return null;

  const closestY = Math.min(...belowPositions.map(p => p.y));
  const yTolerance = 10;
  const sameRowPositions = belowPositions.filter(
    p => Math.abs(p.y - closestY) < yTolerance
  );

  let bestPosition: CursorPositionWithCoords | null = null;
  let bestXDistance = Infinity;

  for (const pos of sameRowPositions) {
    const xDistance = Math.abs(pos.x - currentX);
    if (xDistance < bestXDistance) {
      bestXDistance = xDistance;
      bestPosition = pos;
    }
  }

  return bestPosition ? { node: bestPosition.node, offset: bestPosition.offset } : null;
}

/**
 * Get ALL leaf nodes in an entire math expression, traversing into all fractions.
 */
export function getAllLeavesInMathExpression(mathExpr: MathExpressionNode): LexicalNode[] {
  const leaves: LexicalNode[] = [];

  function traverse(node: LexicalNode): void {
    if ($isNumberNode(node) || $isOperatorNode(node)) {
      leaves.push(node);
    } else if ($isRowNode(node) || $isGroupNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    } else if ($isFractionNode(node)) {
      // Traverse BOTH numerator and denominator
      traverse(node.numerator);
      traverse(node.denominator);
    }
  }

  const children = mathExpr.getChildren();
  for (const child of children) {
    traverse(child);
  }

  return leaves;
}

/**
 * Get all possible cursor positions in a math expression with their pixel coordinates.
 */
export function getAllCursorPositionsWithCoords(
  editor: LexicalEditor,
  mathExpr: MathExpressionNode
): CursorPositionWithCoords[] {
  const leaves = getAllLeavesInMathExpression(mathExpr);
  const positions: CursorPositionWithCoords[] = [];

  for (const leaf of leaves) {
    const domElement = editor.getElementByKey(leaf.getKey());
    if (!domElement) continue;

    const text = domElement.textContent || "";
    const textLength = text.length;

    // Get Y coordinate from element center
    const rect = domElement.getBoundingClientRect();
    const y = rect.top + rect.height / 2;

    // Check each character position (0 to textLength inclusive)
    for (let offset = 0; offset <= textLength; offset++) {
      const x = getCharacterX(domElement, offset, text);
      if (x === null) continue;

      positions.push({ node: leaf, offset, x, y });
    }
  }

  return positions;
}

/**
 * Find the closest cursor position ABOVE the current position (visually).
 * Uses pixel coordinates to find what's directly above, regardless of tree structure.
 */
export function findPositionAbove(
  editor: LexicalEditor,
  mathExpr: MathExpressionNode,
  currentX: number,
  currentY: number
): CursorPosition | null {
  const positions = getAllCursorPositionsWithCoords(editor, mathExpr);

  // Filter to positions that are visually above (smaller Y)
  // Use a small threshold to avoid same-line positions
  const threshold = 5;
  const abovePositions = positions.filter(p => p.y < currentY - threshold);

  if (abovePositions.length === 0) return null;

  // Find the closest Y level (the row just above)
  const closestY = Math.max(...abovePositions.map(p => p.y));

  // Filter to positions at that Y level (within a tolerance)
  const yTolerance = 10;
  const sameRowPositions = abovePositions.filter(
    p => Math.abs(p.y - closestY) < yTolerance
  );

  // Find the position with closest X
  let bestPosition: CursorPositionWithCoords | null = null;
  let bestXDistance = Infinity;

  for (const pos of sameRowPositions) {
    const xDistance = Math.abs(pos.x - currentX);
    if (xDistance < bestXDistance) {
      bestXDistance = xDistance;
      bestPosition = pos;
    }
  }

  return bestPosition ? { node: bestPosition.node, offset: bestPosition.offset } : null;
}

/**
 * Find the closest cursor position BELOW the current position (visually).
 * Uses pixel coordinates to find what's directly below, regardless of tree structure.
 */
export function findPositionBelow(
  editor: LexicalEditor,
  mathExpr: MathExpressionNode,
  currentX: number,
  currentY: number
): CursorPosition | null {
  const positions = getAllCursorPositionsWithCoords(editor, mathExpr);

  // Filter to positions that are visually below (larger Y)
  // Use a small threshold to avoid same-line positions
  const threshold = 5;
  const belowPositions = positions.filter(p => p.y > currentY + threshold);

  if (belowPositions.length === 0) return null;

  // Find the closest Y level (the row just below)
  const closestY = Math.min(...belowPositions.map(p => p.y));

  // Filter to positions at that Y level (within a tolerance)
  const yTolerance = 10;
  const sameRowPositions = belowPositions.filter(
    p => Math.abs(p.y - closestY) < yTolerance
  );

  // Find the position with closest X
  let bestPosition: CursorPositionWithCoords | null = null;
  let bestXDistance = Infinity;

  for (const pos of sameRowPositions) {
    const xDistance = Math.abs(pos.x - currentX);
    if (xDistance < bestXDistance) {
      bestXDistance = xDistance;
      bestPosition = pos;
    }
  }

  return bestPosition ? { node: bestPosition.node, offset: bestPosition.offset } : null;
}

/**
 * Get the pixel Y coordinate of a cursor position.
 */
export function getCursorPixelY(
  editor: LexicalEditor,
  node: LexicalNode
): number | null {
  const domElement = editor.getElementByKey(node.getKey());
  if (!domElement) return null;

  const rect = domElement.getBoundingClientRect();
  return rect.top + rect.height / 2;
}
