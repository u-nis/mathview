"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $isElementNode,
  $isTextNode,
  $setSelection,
  $createRangeSelection,
  $createNodeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  LexicalNode,
  LexicalEditor,
} from "lexical";
import { $isNumberNode } from "../nodes/NumberNode";
import { $isOperatorNode } from "../nodes/OperatorNode";
import { $isFractionNode, FractionNode } from "../nodes/FractionNode";
import { $isExponentNode, ExponentNode } from "../nodes/ExponentNode";
import { $isRowNode, RowNode } from "../nodes/RowNode";
import { $isGroupNode, GroupNode } from "../nodes/GroupNode";
import { $isMathExpressionNode, MathExpressionNode } from "../nodes/MathExpressionNode";
import {
  getCursorPixelX,
  getCursorPixelY,
  findClosestPositionAtX,
  findPositionAboveInFraction,
  findPositionBelowInFraction,
} from "../utils/cursorPosition";

/**
 * Math Navigation Plugin
 *
 * Design principles:
 * 1. Symmetric: LEFT and RIGHT are mirror images
 * 2. Fraction selection is a "gateway": You must pass through selection when crossing a fraction boundary
 * 3. UP/DOWN navigate vertically within fractions without going through selection
 *
 * Selection side semantics:
 * - "from left" = arrived by moving RIGHT (cursor conceptually BEFORE fraction)
 * - "from right" = arrived by moving LEFT or exiting content (cursor conceptually AFTER fraction)
 */

// ===== SELECTION STATE =====

export type SelectionSide = "left" | "right";
let currentSelectionSide: SelectionSide = "right";

export function getSelectionSide(): SelectionSide {
  return currentSelectionSide;
}

function selectFraction(fraction: FractionNode, side: SelectionSide): void {
  currentSelectionSide = side;
  const nodeSelection = $createNodeSelection();
  nodeSelection.add(fraction.getKey());
  $setSelection(nodeSelection);
}

function selectMathExpression(mathExpr: MathExpressionNode, side: SelectionSide): void {
  currentSelectionSide = side;
  const nodeSelection = $createNodeSelection();
  nodeSelection.add(mathExpr.getKey());
  $setSelection(nodeSelection);
}

function selectExponent(exponent: ExponentNode, side: SelectionSide): void {
  currentSelectionSide = side;
  const nodeSelection = $createNodeSelection();
  nodeSelection.add(exponent.getKey());
  $setSelection(nodeSelection);
}

// ===== MAIN PLUGIN =====

export function MathNavigationPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const visualColumnXRef = useRef<number | null>(null);

  useEffect(() => {
    // Visual styling for selected fractions and math expressions
    const removeSelectionListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        const root = editor.getRootElement();
        if (!root) return;

        // Clear previous selection styling
        root.querySelectorAll('.math-selected-left, .math-selected-right').forEach(el => {
          el.classList.remove('math-selected-left', 'math-selected-right');
        });

        // Apply styling to selected fraction, exponent, or math expression
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          for (const node of nodes) {
            if ($isFractionNode(node) || $isExponentNode(node) || $isMathExpressionNode(node)) {
              const element = editor.getElementByKey(node.getKey());
              if (element) {
                const sideClass = currentSelectionSide === "left" ? "math-selected-left" : "math-selected-right";
                element.classList.add(sideClass);
              }
            }
          }
        }
      });
    });

    // LEFT ARROW
    const removeLeftCommand = editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
        visualColumnXRef.current = null; // Reset column memory on horizontal movement

        const selection = $getSelection();

        // Handle node selection (fraction, exponent, or math expression)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const fraction = nodes.find($isFractionNode);
          if (fraction) {
            event?.preventDefault();
            handleLeftFromSelection(fraction);
            return true;
          }
          const exponent = nodes.find($isExponentNode);
          if (exponent) {
            event?.preventDefault();
            handleLeftFromExponentSelection(exponent);
            return true;
          }
          const mathExpr = nodes.find($isMathExpressionNode);
          if (mathExpr) {
            event?.preventDefault();
            handleLeftFromMathExpressionSelection(mathExpr);
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const node = selection.anchor.getNode();
        if (!findMathExpression(node)) return false;

        event?.preventDefault();
        handleArrowLeft(node, selection.anchor.offset);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // RIGHT ARROW
    const removeRightCommand = editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        visualColumnXRef.current = null;

        const selection = $getSelection();

        // Handle node selection (fraction, exponent, or math expression)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const fraction = nodes.find($isFractionNode);
          if (fraction) {
            event?.preventDefault();
            handleRightFromSelection(fraction);
            return true;
          }
          const exponent = nodes.find($isExponentNode);
          if (exponent) {
            event?.preventDefault();
            handleRightFromExponentSelection(exponent);
            return true;
          }
          const mathExpr = nodes.find($isMathExpressionNode);
          if (mathExpr) {
            event?.preventDefault();
            handleRightFromMathExpressionSelection(mathExpr);
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const node = selection.anchor.getNode();
        if (!findMathExpression(node)) return false;

        event?.preventDefault();
        handleArrowRight(node, selection.anchor.offset);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // UP ARROW - move to the row directly above at closest x, never leaving level-0 fraction
    // Also handles: base of exponent → exponent row
    const removeUpCommand = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        const selection = $getSelection();

        // From selection: enter numerator of selected fraction, or handle exponent
        if ($isNodeSelection(selection)) {
          const fraction = selection.getNodes().find($isFractionNode);
          if (fraction) {
            event?.preventDefault();
            enterRow(fraction.numerator, visualColumnXRef.current, editor);
            return true;
          }
          const exponent = selection.getNodes().find($isExponentNode);
          if (exponent) {
            event?.preventDefault();
            // Check if exponent is in a fraction - if so, navigate within fraction
            const parentRow = exponent.getParent();
            if ($isRowNode(parentRow)) {
              const grandparent = parentRow.getParent();
              if ($isFractionNode(grandparent)) {
                // Exponent is in a fraction row - go to numerator if we're in denominator
                if (parentRow === grandparent.denominator) {
                  enterRow(grandparent.numerator, visualColumnXRef.current, editor);
                  return true;
                }
                // In numerator - go to exponent row
                enterRow(exponent.exponent, visualColumnXRef.current, editor);
                return true;
              }
            }
            // Not in a fraction - go to exponent row
            enterRow(exponent.exponent, visualColumnXRef.current, editor);
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const node = selection.anchor.getNode();
        const mathExpr = findMathExpression(node);
        if (!mathExpr) return false;

        // Check if we're in the base of an exponent - if so, go to exponent row
        const containingExponent = findContainingExponent(node);
        if (containingExponent && isInExponentBase(node, containingExponent)) {
          event?.preventDefault();
          const currentX = visualColumnXRef.current ?? getCursorPixelX(editor, node, selection.anchor.offset);
          enterRow(containingExponent.exponent, currentX, editor);
          return true;
        }

        const level0Fraction = findLevel0Fraction(node, mathExpr);
        if (!level0Fraction) {
          // Not inside a fraction - consume and do nothing
          event?.preventDefault();
          return true;
        }

        const currentX = visualColumnXRef.current ?? getCursorPixelX(editor, node, selection.anchor.offset);
        const currentY = getCursorPixelY(editor, node);
        if (currentX === null || currentY === null) {
          event?.preventDefault();
          return true;
        }

        if (visualColumnXRef.current === null) {
          visualColumnXRef.current = currentX;
        }

        const positionAbove = findPositionAboveInFraction(editor, level0Fraction, currentX, currentY);
        if (positionAbove) {
          event?.preventDefault();
          setCursorFromPosition(positionAbove.node, positionAbove.offset);
          visualColumnXRef.current = getCursorPixelX(editor, positionAbove.node, positionAbove.offset);
          return true;
        }

        // Already at top of fraction - stay, never leave
        event?.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    // DOWN ARROW - move to the row directly below at closest x, never leaving level-0 fraction
    // Also handles: exponent row → base (at end) or select exponent (based on X position)
    const removeDownCommand = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
        const selection = $getSelection();

        // From selection: enter denominator of selected fraction, or handle exponent
        if ($isNodeSelection(selection)) {
          const fraction = selection.getNodes().find($isFractionNode);
          if (fraction) {
            event?.preventDefault();
            enterRow(fraction.denominator, visualColumnXRef.current, editor);
            return true;
          }
          const exponent = selection.getNodes().find($isExponentNode);
          if (exponent) {
            event?.preventDefault();
            // Check if exponent is in a fraction - if so, navigate within fraction
            const parentRow = exponent.getParent();
            if ($isRowNode(parentRow)) {
              const grandparent = parentRow.getParent();
              if ($isFractionNode(grandparent)) {
                // Exponent is in a fraction row - go to denominator if we're in numerator
                if (parentRow === grandparent.numerator) {
                  enterRow(grandparent.denominator, visualColumnXRef.current, editor);
                  return true;
                }
                // In denominator - stay (already at bottom)
                return true;
              }
            }
            // Not in a fraction - select with right indicator based on selection side
            // or go to base if appropriate
            if (currentSelectionSide === "left") {
              // From left selection, down does nothing special
              return true;
            } else {
              // From right selection, stay selected
              return true;
            }
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const node = selection.anchor.getNode();
        const mathExpr = findMathExpression(node);
        if (!mathExpr) return false;

        // Check if we're in the exponent row of an exponent
        const containingExponent = findContainingExponent(node);
        if (containingExponent && isInExponentRow(node, containingExponent)) {
          event?.preventDefault();
          // Check cursor X position relative to exponent bounds
          const currentX = getCursorPixelX(editor, node, selection.anchor.offset);
          const exponentElement = editor.getElementByKey(containingExponent.getKey());
          if (currentX !== null && exponentElement) {
            const rect = exponentElement.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            if (currentX > midX) {
              // Cursor on right side - select exponent with right indicator
              selectExponent(containingExponent, "right");
            } else {
              // Cursor on left side - go to end of base
              enterContainerAtEnd(containingExponent.base);
            }
          } else {
            // Fallback: go to end of base
            enterContainerAtEnd(containingExponent.base);
          }
          return true;
        }

        const level0Fraction = findLevel0Fraction(node, mathExpr);
        if (!level0Fraction) {
          event?.preventDefault();
          return true;
        }

        const currentX = visualColumnXRef.current ?? getCursorPixelX(editor, node, selection.anchor.offset);
        const currentY = getCursorPixelY(editor, node);
        if (currentX === null || currentY === null) {
          event?.preventDefault();
          return true;
        }

        if (visualColumnXRef.current === null) {
          visualColumnXRef.current = currentX;
        }

        const positionBelow = findPositionBelowInFraction(editor, level0Fraction, currentX, currentY);
        if (positionBelow) {
          event?.preventDefault();
          setCursorFromPosition(positionBelow.node, positionBelow.offset);
          visualColumnXRef.current = getCursorPixelX(editor, positionBelow.node, positionBelow.offset);
          return true;
        }

        // Already at bottom of fraction - stay, never leave
        event?.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeSelectionListener();
      removeLeftCommand();
      removeRightCommand();
      removeUpCommand();
      removeDownCommand();
    };
  }, [editor]);

  return null;
}

// ===== SELECTION HANDLERS =====

/**
 * LEFT from fraction selection:
 * - If selected "from right": enter numerator at END
 * - If selected "from left": exit left (go to prev sibling or out)
 */
function handleLeftFromSelection(fraction: FractionNode): void {
  if (currentSelectionSide === "right") {
    // Enter numerator at end
    enterNumeratorAtEnd(fraction);
  } else {
    // Exit left
    exitSelectionLeft(fraction);
  }
}

/**
 * RIGHT from fraction selection:
 * - If selected "from left": enter numerator at START
 * - If selected "from right": exit right (go to next sibling or out)
 */
function handleRightFromSelection(fraction: FractionNode): void {
  if (currentSelectionSide === "left") {
    // Enter numerator at start
    enterNumeratorAtStart(fraction);
  } else {
    // Exit right
    exitSelectionRight(fraction);
  }
}

/**
 * LEFT from exponent selection:
 * - If selected "from right": enter base at END
 * - If selected "from left": exit left (go to prev sibling or out)
 */
function handleLeftFromExponentSelection(exponent: ExponentNode): void {
  if (currentSelectionSide === "right") {
    // Enter base at end
    enterExponentBaseAtEnd(exponent);
  } else {
    // Exit left
    exitExponentSelectionLeft(exponent);
  }
}

/**
 * RIGHT from exponent selection:
 * - If selected "from left": enter base at START
 * - If selected "from right": exit right (go to next sibling or out)
 */
function handleRightFromExponentSelection(exponent: ExponentNode): void {
  if (currentSelectionSide === "left") {
    // Enter base at start
    enterExponentBaseAtStart(exponent);
  } else {
    // Exit right
    exitExponentSelectionRight(exponent);
  }
}

// ===== ENTER EXPONENT BASE =====

/** Enter base skipping position 0 (go to position 1 or end of first leaf) */
function enterExponentBaseAtStart(exponent: ExponentNode): void {
  const base = exponent.base;
  const firstChild = base.getFirstChild();

  if (firstChild && ($isNumberNode(firstChild) || $isOperatorNode(firstChild))) {
    // Skip position 0, go to position 1 (or end if only 1 char)
    const len = firstChild.getTextContentSize();
    setCursor(firstChild, Math.min(1, len));
  } else if ($isFractionNode(firstChild)) {
    selectFraction(firstChild, "left");
  } else if ($isExponentNode(firstChild)) {
    selectExponent(firstChild, "left");
  } else if ($isGroupNode(firstChild)) {
    enterContainerAtStart(firstChild);
  } else {
    // Empty base - just put cursor there
    setCursorAtElement(base, 0);
  }
}

function enterExponentBaseAtEnd(exponent: ExponentNode): void {
  const base = exponent.base;
  enterContainerAtEnd(base);
}

function exitExponentSelectionLeft(exponent: ExponentNode): void {
  const prevSibling = exponent.getPreviousSibling();
  if (prevSibling) {
    if ($isFractionNode(prevSibling)) {
      selectFraction(prevSibling, "right");
    } else if ($isExponentNode(prevSibling)) {
      selectExponent(prevSibling, "right");
    } else {
      enterFromRight(prevSibling);
    }
  }
  // No prev sibling - stay selected
}

function exitExponentSelectionRight(exponent: ExponentNode): void {
  const nextSibling = exponent.getNextSibling();
  if (nextSibling) {
    if ($isFractionNode(nextSibling)) {
      selectFraction(nextSibling, "left");
    } else if ($isExponentNode(nextSibling)) {
      selectExponent(nextSibling, "left");
    } else {
      enterFromLeft(nextSibling);
    }
  }
  // No next sibling - check if we're in a container that's in a fraction/exponent
  const parent = exponent.getParent();
  if ($isRowNode(parent) || $isGroupNode(parent)) {
    const grandparent = parent.getParent();
    if ($isFractionNode(grandparent)) {
      selectFraction(grandparent, "right");
      return;
    }
    if ($isExponentNode(grandparent)) {
      selectExponent(grandparent, "right");
      return;
    }
    if ($isMathExpressionNode(grandparent)) {
      selectMathExpression(grandparent, "right");
      return;
    }
  }
}

// ===== ENTER NUMERATOR =====

function enterNumeratorAtStart(fraction: FractionNode): void {
  const numerator = fraction.numerator;
  enterContainerAtStart(numerator);
}

/** Enter a container (Row/Group) at the start, selecting fraction/exponent if found */
function enterContainerAtStart(container: RowNode | GroupNode): void {
  const firstChild = container.getFirstChild();

  if ($isFractionNode(firstChild)) {
    // First child is a fraction - select it from left
    selectFraction(firstChild, "left");
  } else if ($isExponentNode(firstChild)) {
    // First child is an exponent - select it from left
    selectExponent(firstChild, "left");
  } else if ($isGroupNode(firstChild)) {
    // Recurse into group
    enterContainerAtStart(firstChild);
  } else if (firstChild && ($isNumberNode(firstChild) || $isOperatorNode(firstChild))) {
    // Position at start (position 0)
    setCursor(firstChild, 0);
  } else {
    // Empty container
    setCursorAtElement(container, 0);
  }
}

function enterNumeratorAtEnd(fraction: FractionNode): void {
  const numerator = fraction.numerator;
  enterContainerAtEnd(numerator);
}

/** Enter a container (Row/Group) at the end, selecting fraction/exponent if found */
function enterContainerAtEnd(container: RowNode | GroupNode): void {
  const lastChild = container.getLastChild();

  if ($isFractionNode(lastChild)) {
    // Last child is a fraction - select it from right
    selectFraction(lastChild, "right");
  } else if ($isExponentNode(lastChild)) {
    // Last child is an exponent - select it from right
    selectExponent(lastChild, "right");
  } else if ($isGroupNode(lastChild)) {
    // Recurse into group
    enterContainerAtEnd(lastChild);
  } else if (lastChild && ($isNumberNode(lastChild) || $isOperatorNode(lastChild))) {
    setCursor(lastChild, lastChild.getTextContentSize());
  } else {
    // Empty container
    setCursorAtElement(container, container.getChildrenSize());
  }
}

// ===== EXIT SELECTION =====

function exitSelectionLeft(fraction: FractionNode): void {
  const parent = fraction.getParent();
  if (!parent) return;

  const index = fraction.getIndexWithinParent();

  if ($isRowNode(parent) || $isGroupNode(parent)) {
    if (index > 0) {
      // Has previous sibling
      const prevSibling = parent.getChildAtIndex(index - 1);
      if (prevSibling) {
        if ($isFractionNode(prevSibling)) {
          selectFraction(prevSibling, "right");
        } else if ($isExponentNode(prevSibling)) {
          selectExponent(prevSibling, "right");
        } else {
          enterFromRight(prevSibling);
        }
        return;
      }
    }

    // No previous sibling - check if in outer fraction/exponent
    const grandparent = parent.getParent();
    if ($isFractionNode(grandparent)) {
      selectFraction(grandparent, "left");
      return;
    }
    if ($isExponentNode(grandparent)) {
      selectExponent(grandparent, "left");
      return;
    }

    // At expression start
    if ($isMathExpressionNode(grandparent)) {
      exitMathLeft(grandparent);
      return;
    }
  }

  if ($isMathExpressionNode(parent)) {
    exitMathLeft(parent);
  }
}

function exitSelectionRight(fraction: FractionNode): void {
  const parent = fraction.getParent();
  if (!parent) return;

  const index = fraction.getIndexWithinParent();

  if ($isRowNode(parent) || $isGroupNode(parent)) {
    const nextSibling = parent.getChildAtIndex(index + 1);
    if (nextSibling) {
      // Has next sibling
      if ($isFractionNode(nextSibling)) {
        selectFraction(nextSibling, "left");
      } else if ($isExponentNode(nextSibling)) {
        selectExponent(nextSibling, "left");
      } else {
        enterFromLeft(nextSibling);
      }
      return;
    }

    // No next sibling - check if in outer fraction/exponent
    const grandparent = parent.getParent();
    if ($isFractionNode(grandparent)) {
      selectFraction(grandparent, "right");
      return;
    }
    if ($isExponentNode(grandparent)) {
      selectExponent(grandparent, "right");
      return;
    }

    // At expression end
    if ($isMathExpressionNode(grandparent)) {
      exitMathRight(grandparent);
      return;
    }
  }

  if ($isMathExpressionNode(parent)) {
    exitMathRight(parent);
  }
}

// ===== ARROW HANDLERS (from RangeSelection) =====

function handleArrowLeft(node: LexicalNode, offset: number): void {
  // In text node
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    const prevSibling = node.getPreviousSibling();

    // If prev sibling is a fraction or exponent, skip any remaining positions in this node
    if ($isFractionNode(prevSibling)) {
      selectFraction(prevSibling, "right");
      return;
    }
    if ($isExponentNode(prevSibling)) {
      selectExponent(prevSibling, "right");
      return;
    }

    if (offset > 1) {
      // Move within text
      setCursor(node, offset - 1);
      return;
    }

    if (offset === 1) {
      // At position 1 - go to previous sibling or position 0
      if (prevSibling) {
        enterFromRight(prevSibling);
        return;
      }
      // No previous sibling - go to position 0 (start of expression)
      setCursor(node, 0);
      return;
    }

    // At position 0 - go to previous sibling or exit
    if (prevSibling) {
      enterFromRight(prevSibling);
      return;
    }

    // No previous sibling - exit container
    const container = findParentRow(node);
    if (container) {
      exitRowLeft(container);
    }
    return;
  }

  // In container (Row/Group) with element offset
  if ($isRowNode(node) || $isGroupNode(node)) {
    if (offset === 0) {
      exitRowLeft(node);
      return;
    }

    const prevChild = node.getChildAtIndex(offset - 1);
    if (prevChild) {
      if ($isFractionNode(prevChild)) {
        selectFraction(prevChild, "right");
      } else if ($isExponentNode(prevChild)) {
        selectExponent(prevChild, "right");
      } else {
        enterFromRight(prevChild);
      }
    }
  }
}

/** Enter a node from the right, skipping nodes that are immediately before a fraction/exponent */
function enterFromRight(node: LexicalNode): void {
  if ($isFractionNode(node)) {
    selectFraction(node, "right");
    return;
  }
  if ($isExponentNode(node)) {
    selectExponent(node, "right");
    return;
  }

  // If this node's next sibling is a fraction/exponent, skip this node entirely
  const nextSibling = node.getNextSibling();
  if ($isFractionNode(nextSibling) || $isExponentNode(nextSibling)) {
    const prevSibling = node.getPreviousSibling();
    if (prevSibling) {
      enterFromRight(prevSibling);
      return;
    }
    // No previous sibling - go to position 0 of this node
    const leaf = getFirstLeaf(node);
    if (leaf) {
      setCursor(leaf, 0);
    }
    return;
  }

  const leaf = getLastLeaf(node);
  if (!leaf) return;

  // Position at end
  setCursor(leaf, getLeafLength(leaf));
}

function handleArrowRight(node: LexicalNode, offset: number): void {
  // In text node
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    const length = getLeafLength(node);
    const nextSibling = node.getNextSibling();

    // If next sibling is a fraction/exponent, skip any remaining positions in this node
    if ($isFractionNode(nextSibling)) {
      selectFraction(nextSibling, "left");
      return;
    }
    if ($isExponentNode(nextSibling)) {
      selectExponent(nextSibling, "left");
      return;
    }

    if (offset < length) {
      // Move within text
      setCursor(node, offset + 1);
      return;
    }

    // At end of text - enter next sibling
    if (nextSibling) {
      enterFromLeft(nextSibling);
      return;
    }

    // No next sibling - exit container
    const container = findParentRow(node);
    if (container) {
      exitRowRight(container);
    }
    return;
  }

  // In container (Row/Group) with element offset
  if ($isRowNode(node) || $isGroupNode(node)) {
    const child = node.getChildAtIndex(offset);
    if (child) {
      if ($isFractionNode(child)) {
        selectFraction(child, "left");
      } else if ($isExponentNode(child)) {
        selectExponent(child, "left");
      } else {
        enterFromLeft(child);
      }
      return;
    }

    // Past last child - exit
    exitRowRight(node);
  }
}

/** Enter a node from the left, skipping to fraction/exponent if the node immediately precedes one */
function enterFromLeft(node: LexicalNode): void {
  if ($isFractionNode(node)) {
    selectFraction(node, "left");
    return;
  }
  if ($isExponentNode(node)) {
    selectExponent(node, "left");
    return;
  }

  const leaf = getFirstLeaf(node);
  if (!leaf) return;

  const length = getLeafLength(leaf);
  const nextSibling = leaf.getNextSibling();

  // If this leaf's next sibling is a fraction/exponent, skip to it
  if ($isFractionNode(nextSibling)) {
    selectFraction(nextSibling, "left");
    return;
  }
  if ($isExponentNode(nextSibling)) {
    selectExponent(nextSibling, "left");
    return;
  }

  // Otherwise position at start
  setCursor(leaf, 0);
}

// ===== ROW EXIT =====

function exitRowLeft(row: RowNode | GroupNode): void {
  const parent = row.getParent();
  if (!parent) return;

  // Exiting a Group
  if ($isGroupNode(row) && ($isRowNode(parent) || $isGroupNode(parent))) {
    const index = row.getIndexWithinParent();
    if (index > 0) {
      const prevSibling = parent.getChildAtIndex(index - 1);
      if (prevSibling) {
        if ($isFractionNode(prevSibling)) {
          selectFraction(prevSibling, "right");
        } else if ($isExponentNode(prevSibling)) {
          selectExponent(prevSibling, "right");
        } else {
          enterFromRight(prevSibling);
        }
        return;
      }
    }
    // No previous sibling in parent row
    setCursorAtElement(parent, 0);
    return;
  }

  // Exiting a fraction row - SELECT the parent fraction
  if ($isFractionNode(parent)) {
    selectFraction(parent, "left");
    return;
  }

  // Exiting an exponent row - always select the parent exponent
  // (left/right doesn't navigate between base and exponent - use up/down for that)
  if ($isExponentNode(parent)) {
    selectExponent(parent, "left");
    return;
  }

  // Exiting main expression row
  if ($isMathExpressionNode(parent)) {
    exitMathLeft(parent);
  }
}

function exitRowRight(row: RowNode | GroupNode): void {
  const parent = row.getParent();
  if (!parent) return;

  // Exiting a Group
  if ($isGroupNode(row) && ($isRowNode(parent) || $isGroupNode(parent))) {
    const index = row.getIndexWithinParent();
    const nextSibling = parent.getChildAtIndex(index + 1);
    if (nextSibling) {
      if ($isFractionNode(nextSibling)) {
        selectFraction(nextSibling, "left");
      } else if ($isExponentNode(nextSibling)) {
        selectExponent(nextSibling, "left");
      } else {
        enterFromLeft(nextSibling);
      }
      return;
    }
    // No next sibling - check if parent row is in fraction/exponent
    const grandparent = parent.getParent();
    if ($isFractionNode(grandparent)) {
      selectFraction(grandparent, "right");
      return;
    }
    if ($isExponentNode(grandparent)) {
      selectExponent(grandparent, "right");
      return;
    }
    setCursorAtElement(parent, parent.getChildrenSize());
    return;
  }

  // Exiting a fraction row - SELECT the parent fraction
  if ($isFractionNode(parent)) {
    selectFraction(parent, "right");
    return;
  }

  // Exiting an exponent row - always select the parent exponent
  // (left/right doesn't navigate between base and exponent - use up/down for that)
  if ($isExponentNode(parent)) {
    selectExponent(parent, "right");
    return;
  }

  // Exiting main expression row
  if ($isMathExpressionNode(parent)) {
    exitMathRight(parent);
  }
}

// ===== ENTER ROW (for UP/DOWN) =====

function enterRow(row: RowNode, savedX: number | null, editor: LexicalEditor): void {
  if (savedX !== null) {
    const position = findClosestPositionAtX(editor, row, savedX);
    if (position) {
      setCursor(position.node, position.offset);
      return;
    }
  }

  // Fallback to start
  const firstLeaf = getFirstLeaf(row);
  if (firstLeaf) {
    setCursor(firstLeaf, 0);
  } else {
    setCursorAtElement(row, 0);
  }
}

// ===== HELPERS =====

function findMathExpression(node: LexicalNode): MathExpressionNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isMathExpressionNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

function findParentRow(node: LexicalNode): RowNode | GroupNode | null {
  let current: LexicalNode | null = node.getParent();
  while (current) {
    if ($isRowNode(current) || $isGroupNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

function findContainingFraction(node: LexicalNode): FractionNode | null {
  let current: LexicalNode | null = node.getParent();
  while (current) {
    if ($isFractionNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

function findContainingExponent(node: LexicalNode): ExponentNode | null {
  let current: LexicalNode | null = node.getParent();
  while (current) {
    if ($isExponentNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

/** Check if node is inside the base row of an exponent */
function isInExponentBase(node: LexicalNode, exponent: ExponentNode): boolean {
  let current: LexicalNode | null = node;
  while (current && current !== exponent) {
    if (current === exponent.base) return true;
    current = current.getParent();
  }
  return false;
}

/** Check if node is inside the exponent (superscript) row of an exponent */
function isInExponentRow(node: LexicalNode, exponent: ExponentNode): boolean {
  let current: LexicalNode | null = node;
  while (current && current !== exponent) {
    if (current === exponent.exponent) return true;
    current = current.getParent();
  }
  return false;
}

/**
 * Find the level-0 fraction: the outermost fraction that contains the node and is a direct
 * child of the math expression's root row. Vertical movement (up/down) never leaves this fraction.
 */
function findLevel0Fraction(node: LexicalNode, mathExpr: MathExpressionNode): FractionNode | null {
  const rootRow = mathExpr.root;
  let current: LexicalNode | null = node;
  while (current && current !== mathExpr) {
    const parent = current.getParent();
    if (parent === rootRow && $isFractionNode(current)) {
      return current;
    }
    current = parent;
  }
  return null;
}

/** Find the immediate containing fraction and whether we're in its numerator or denominator */
function findContainingFractionRow(node: LexicalNode): { fraction: FractionNode; isNumerator: boolean } | null {
  let current: LexicalNode | null = node;
  let child: LexicalNode | null = null;

  while (current) {
    if ($isFractionNode(current)) {
      // Found a fraction - check if child was numerator or denominator
      if (child) {
        const isNumerator = child === current.numerator;
        return { fraction: current, isNumerator };
      }
      return null;
    }
    child = current;
    current = current.getParent();
  }
  return null;
}

function isInRow(node: LexicalNode, targetRow: RowNode): boolean {
  let current: LexicalNode | null = node;
  while (current) {
    if (current === targetRow) return true;
    current = current.getParent();
  }
  return false;
}

function getFirstLeaf(node: LexicalNode): LexicalNode | null {
  if ($isNumberNode(node) || $isOperatorNode(node)) return node;
  if ($isFractionNode(node)) return getFirstLeaf(node.numerator);
  if ($isElementNode(node)) {
    const first = node.getFirstChild();
    return first ? getFirstLeaf(first) : null;
  }
  return null;
}

function getLastLeaf(node: LexicalNode): LexicalNode | null {
  if ($isNumberNode(node) || $isOperatorNode(node)) return node;
  if ($isFractionNode(node)) return getLastLeaf(node.numerator); // Use numerator for horizontal traversal
  if ($isElementNode(node)) {
    const last = node.getLastChild();
    return last ? getLastLeaf(last) : null;
  }
  return null;
}

function getLeafLength(node: LexicalNode): number {
  if ($isNumberNode(node) || $isOperatorNode(node)) {
    return node.getTextContentSize();
  }
  return 0;
}

function setCursor(node: LexicalNode, offset: number): void {
  const selection = $createRangeSelection();
  selection.anchor.set(node.getKey(), offset, "text");
  selection.focus.set(node.getKey(), offset, "text");
  $setSelection(selection);
}

/** Set cursor from a position; use element selection for empty rows (RowNode/GroupNode). */
function setCursorFromPosition(node: LexicalNode, offset: number): void {
  if ($isRowNode(node) || $isGroupNode(node)) {
    setCursorAtElement(node, offset);
  } else {
    setCursor(node, offset);
  }
}

function setCursorAtElement(node: LexicalNode, offset: number): void {
  const selection = $createRangeSelection();
  selection.anchor.set(node.getKey(), offset, "element");
  selection.focus.set(node.getKey(), offset, "element");
  $setSelection(selection);
}

function exitMathLeft(mathExpr: MathExpressionNode): void {
  // Select the expression instead of exiting immediately
  selectMathExpression(mathExpr, "left");
}

function exitMathRight(mathExpr: MathExpressionNode): void {
  // Select the expression instead of exiting immediately
  selectMathExpression(mathExpr, "right");
}

/** Actually exit the math expression to the left (place cursor before it) */
function exitMathExpressionLeft(mathExpr: MathExpressionNode): void {
  const parent = mathExpr.getParent();
  if (!parent) return;
  const index = mathExpr.getIndexWithinParent();
  const selection = $createRangeSelection();
  selection.anchor.set(parent.getKey(), index, "element");
  selection.focus.set(parent.getKey(), index, "element");
  $setSelection(selection);
}

/** Actually exit the math expression to the right (place cursor after it) */
function exitMathExpressionRight(mathExpr: MathExpressionNode): void {
  const parent = mathExpr.getParent();
  if (!parent) return;
  const index = mathExpr.getIndexWithinParent();
  const selection = $createRangeSelection();
  selection.anchor.set(parent.getKey(), index + 1, "element");
  selection.focus.set(parent.getKey(), index + 1, "element");
  $setSelection(selection);
}

/**
 * LEFT from math expression selection:
 * - If selected "from right": enter expression at end
 * - If selected "from left": go to text before expression or stay
 */
function handleLeftFromMathExpressionSelection(mathExpr: MathExpressionNode): void {
  if (currentSelectionSide === "right") {
    // Enter the expression at the end
    enterMathExpressionAtEnd(mathExpr);
  } else {
    // Try to go to previous sibling (text before expression), otherwise stay
    const prevSibling = mathExpr.getPreviousSibling();
    if (prevSibling && $isTextNode(prevSibling)) {
      const len = prevSibling.getTextContentSize();
      setCursor(prevSibling, len);
    }
    // No prev sibling or not text - stay selected
  }
}

/**
 * RIGHT from math expression selection:
 * - If selected "from left": enter expression at start
 * - If selected "from right": go to text after expression or stay
 */
function handleRightFromMathExpressionSelection(mathExpr: MathExpressionNode): void {
  if (currentSelectionSide === "left") {
    // Enter the expression at the start
    enterMathExpressionAtStart(mathExpr);
  } else {
    // Try to go to next sibling (text after expression), otherwise stay
    const nextSibling = mathExpr.getNextSibling();
    if (nextSibling && $isTextNode(nextSibling)) {
      setCursor(nextSibling, 0);
    }
    // No next sibling or not text - stay selected
  }
}

function enterMathExpressionAtStart(mathExpr: MathExpressionNode): void {
  const rootRow = mathExpr.root;
  const firstChild = rootRow.getFirstChild();

  if ($isFractionNode(firstChild)) {
    // First child is a fraction - select it from left
    selectFraction(firstChild, "left");
  } else if ($isExponentNode(firstChild)) {
    // First child is an exponent - select it from left
    selectExponent(firstChild, "left");
  } else if (firstChild && ($isNumberNode(firstChild) || $isOperatorNode(firstChild))) {
    // Position at start (position 0)
    setCursor(firstChild, 0);
  } else {
    // Empty root row
    setCursorAtElement(rootRow, 0);
  }
}

function enterMathExpressionAtEnd(mathExpr: MathExpressionNode): void {
  const rootRow = mathExpr.root;
  const lastChild = rootRow.getLastChild();

  if ($isFractionNode(lastChild)) {
    // Last child is a fraction - select it from right
    selectFraction(lastChild, "right");
  } else if ($isExponentNode(lastChild)) {
    // Last child is an exponent - select it from right
    selectExponent(lastChild, "right");
  } else if (lastChild && ($isNumberNode(lastChild) || $isOperatorNode(lastChild))) {
    setCursor(lastChild, lastChild.getTextContentSize());
  } else {
    // Empty root row
    setCursorAtElement(rootRow, rootRow.getChildrenSize());
  }
}
