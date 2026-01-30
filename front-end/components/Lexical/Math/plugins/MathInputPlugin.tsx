"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $setSelection,
  $createRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_DOWN_COMMAND,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  LexicalNode,
  LexicalEditor,
} from "lexical";
import {
  $createNumberNode,
  $isNumberNode,
} from "../nodes/NumberNode";
import {
  $createOperatorNode,
  $isOperatorNode,
} from "../nodes/OperatorNode";
import {
  $createFractionNode,
  $isFractionNode,
} from "../nodes/FractionNode";
import { $createGroupNode, $isGroupNode, GroupNode } from "../nodes/GroupNode";
import { $isRowNode, RowNode } from "../nodes/RowNode";
import { $isMathExpressionNode } from "../nodes/MathExpressionNode";
import { getSelectionSide, type SelectionSide } from "./MathNavigationPlugin";

const DIGIT_REGEX = /^[0-9]$/;
const OPERATOR_REGEX = /^[+\-*=()]$/;
const MAX_FRACTION_DEPTH = 4;

// Track rows where auto-brackets have been dismissed
const dismissedAutoBracketsRows = new Set<string>();

export function isAutoBracketsDismissed(nodeKey: string): boolean {
  return dismissedAutoBracketsRows.has(nodeKey);
}

export function dismissAutoBrackets(nodeKey: string): void {
  dismissedAutoBracketsRows.add(nodeKey);
}

export function restoreAutoBrackets(nodeKey: string): void {
  dismissedAutoBracketsRows.delete(nodeKey);
}

/**
 * MathInputPlugin handles keyboard input within math expressions.
 * - Digits create/append to NumberNodes
 * - Operators (+, -, *, =, (, )) create OperatorNodes
 * - / creates FractionNode with previous term as numerator
 * - Backspace deletes characters/nodes
 * - Enter/Escape exits math mode
 */
export function MathInputPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Maintain dismissed auto-brackets state on DOM updates
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Re-apply dismissed class to rows after Lexical re-renders
      for (const nodeKey of dismissedAutoBracketsRows) {
        const element = editor.getElementByKey(nodeKey);
        if (element) {
          element.classList.add('auto-brackets-dismissed');
        }
      }
    });

    // Intercept ALL text insertion with critical priority
    const removeInsertTextCommand = editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (payload: InputEvent | string) => {
        // Extract text from payload
        const text = typeof payload === "string" ? payload : payload.data || "";
        if (!text) return false;

        const selection = $getSelection();

        // Handle NodeSelection (selected fraction)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const selectedFraction = nodes.find((n): n is ReturnType<typeof $createFractionNode> => $isFractionNode(n));
          if (selectedFraction) {
            const side = getSelectionSide();
            // Handle typing at selected fraction (before or after based on side)
            for (const char of text) {
              if (DIGIT_REGEX.test(char)) {
                handleInputAtFraction(selectedFraction, $createNumberNode(char), side);
              } else if (OPERATOR_REGEX.test(char)) {
                handleInputAtFraction(selectedFraction, $createOperatorNode(char), side);
              } else if (char === "/") {
                handleFractionWrap(selectedFraction, side);
              }
            }
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();

        // Check if we're inside a math expression
        if (!isInsideMathExpression(anchorNode)) return false;

        // Find the current RowNode we're in
        const currentRow = findParentRow(anchorNode);
        if (!currentRow) return false;

        // Handle each character
        for (const char of text) {
          // Handle digits
          if (DIGIT_REGEX.test(char)) {
            handleDigitInput(char, currentRow);
            continue;
          }

          // Handle operators
          if (OPERATOR_REGEX.test(char)) {
            handleOperatorInput(char, currentRow);
            continue;
          }

          // Handle fraction
          if (char === "/") {
            handleFractionInput(currentRow);
            continue;
          }
        }

        // Return true to indicate we handled it (prevents default TextNode creation)
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle Enter to exit math mode
    const removeEnterCommand = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();

        // Handle NodeSelection (selected fraction)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const selectedFraction = nodes.find((n) => $isFractionNode(n));
          if (selectedFraction) {
            event?.preventDefault();
            exitMathExpression(selectedFraction);
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        if (!isInsideMathExpression(anchorNode)) return false;

        event?.preventDefault();
        exitMathExpression(anchorNode);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle Escape to exit math mode
    const removeEscapeCommand = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        const selection = $getSelection();

        // Handle NodeSelection (selected fraction)
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const selectedFraction = nodes.find((n) => $isFractionNode(n));
          if (selectedFraction) {
            exitMathExpression(selectedFraction);
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        if (!isInsideMathExpression(anchorNode)) return false;

        exitMathExpression(anchorNode);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle backspace
    const removeBackspaceCommand = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();

        // Handle backspace when fraction is selected
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          const selectedFraction = nodes.find((n) => $isFractionNode(n));
          if (selectedFraction) {
            event?.preventDefault();
            // Delete the fraction and move cursor appropriately
            const parent = selectedFraction.getParent();
            const prevSibling = selectedFraction.getPreviousSibling();
            selectedFraction.remove();

            if (prevSibling) {
              const newSelection = $createRangeSelection();
              if ($isNumberNode(prevSibling) || $isOperatorNode(prevSibling)) {
                const len = prevSibling.getTextContentSize();
                newSelection.anchor.set(prevSibling.getKey(), len, "text");
                newSelection.focus.set(prevSibling.getKey(), len, "text");
              } else {
                newSelection.anchor.set(prevSibling.getKey(), 0, "element");
                newSelection.focus.set(prevSibling.getKey(), 0, "element");
              }
              $setSelection(newSelection);
            } else if (parent && ($isRowNode(parent) || $isGroupNode(parent))) {
              const newSelection = $createRangeSelection();
              newSelection.anchor.set(parent.getKey(), 0, "element");
              newSelection.focus.set(parent.getKey(), 0, "element");
              $setSelection(newSelection);
            }
            return true;
          }
        }

        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        if (!isInsideMathExpression(anchorNode)) return false;

        const offset = selection.anchor.offset;

        // Check if we should unwrap a GroupNode or dismiss auto-brackets
        const handled = handleBracketBackspace(anchorNode, offset, editor);
        if (handled) {
          event?.preventDefault();
          return true;
        }

        event?.preventDefault();
        handleBackspace(anchorNode, selection.anchor.offset);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Handle keydown for typing before/after selected fraction
    // This is needed because CONTROLLED_TEXT_INSERTION_COMMAND doesn't fire for NodeSelection
    const removeKeyDownCommand = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        if (!$isNodeSelection(selection)) return false;

        const nodes = selection.getNodes();
        const selectedFraction = nodes.find((n) => $isFractionNode(n));
        if (!selectedFraction) return false;

        const key = event.key;
        const side = getSelectionSide();

        // Handle digits
        if (DIGIT_REGEX.test(key)) {
          event.preventDefault();
          handleInputAtFraction(selectedFraction, $createNumberNode(key), side);
          return true;
        }

        // Handle operators
        if (OPERATOR_REGEX.test(key)) {
          event.preventDefault();
          handleInputAtFraction(selectedFraction, $createOperatorNode(key), side);
          return true;
        }

        // Handle "/" to wrap fraction
        if (key === "/") {
          event.preventDefault();
          handleFractionWrap(selectedFraction, side);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    return () => {
      removeInsertTextCommand();
      removeUpdateListener();
      removeEnterCommand();
      removeEscapeCommand();
      removeBackspaceCommand();
      removeKeyDownCommand();
    };
  }, [editor]);

  return null;
}

// ===== HELPER FUNCTIONS =====

function isInsideMathExpression(node: LexicalNode): boolean {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isMathExpressionNode(current)) return true;
    current = current.getParent();
  }
  return false;
}

/** Find parent container - either a RowNode or GroupNode */
function findParentRow(node: LexicalNode): RowNode | GroupNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isRowNode(current) || $isGroupNode(current)) return current as RowNode | GroupNode;
    current = current.getParent();
  }
  return null;
}

function findMathExpression(node: LexicalNode): LexicalNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isMathExpressionNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

/**
 * Count how many FractionNodes are ancestors of this node.
 */
function getFractionDepth(node: LexicalNode): number {
  let depth = 0;
  let current: LexicalNode | null = node.getParent();
  while (current) {
    if ($isFractionNode(current)) depth++;
    if ($isMathExpressionNode(current)) break;
    current = current.getParent();
  }
  return depth;
}

/**
 * Check if we should convert auto-brackets to a real GroupNode.
 * This happens when:
 * 1. The currentRow is a direct child of a FractionNode (numerator or denominator)
 * 2. The row has 2+ children (auto-brackets are showing)
 * 3. We're typing "(" at the start OR ")" at the end
 *
 * @returns true if conversion happened, false otherwise
 */
function tryConvertAutoBracketsToGroup(
  operator: string,
  currentRow: RowNode | GroupNode,
  anchorNode: LexicalNode,
  offset: number
): boolean {
  // Only works for RowNodes that are direct children of fractions
  if (!$isRowNode(currentRow)) return false;

  const parent = currentRow.getParent();
  if (!$isFractionNode(parent)) return false;

  // Check if row has 2+ children (auto-brackets would be showing)
  const childCount = currentRow.getChildrenSize();
  if (childCount < 2) return false;

  // Check if we're at the right position
  const isAtStart = isAtRowStart(anchorNode, offset, currentRow);
  const isAtEnd = isAtRowEnd(anchorNode, offset, currentRow);

  // "(" at start or ")" at end should trigger conversion
  if ((operator === "(" && isAtStart) || (operator === ")" && isAtEnd)) {
    // Wrap all content in a GroupNode
    const groupNode = $createGroupNode();

    // Get all children
    const children = currentRow.getChildren();

    // Insert group at the start of the row
    if (children.length > 0) {
      children[0].insertBefore(groupNode);
    } else {
      currentRow.append(groupNode);
    }

    // Move all children into the group
    for (const child of children) {
      child.remove();
      groupNode.append(child);
    }

    // Position cursor inside the group at the appropriate end
    const newSelection = $createRangeSelection();
    if (operator === "(") {
      // Typed at start, put cursor at start of group content
      newSelection.anchor.set(groupNode.getKey(), 0, "element");
      newSelection.focus.set(groupNode.getKey(), 0, "element");
    } else {
      // Typed at end, put cursor at end of group content
      newSelection.anchor.set(groupNode.getKey(), groupNode.getChildrenSize(), "element");
      newSelection.focus.set(groupNode.getKey(), groupNode.getChildrenSize(), "element");
    }
    $setSelection(newSelection);

    return true;
  }

  return false;
}

/**
 * Check if cursor is at the start of a row.
 */
function isAtRowStart(anchorNode: LexicalNode, offset: number, row: RowNode): boolean {
  // If cursor is on the row itself at position 0
  if (anchorNode === row && offset === 0) return true;

  // If cursor is at position 0 of the first child
  const firstChild = row.getFirstChild();
  if (!firstChild) return true; // Empty row

  if (anchorNode === firstChild && offset === 0) return true;

  // If the anchor is inside the first child and at position 0
  if ($isNumberNode(anchorNode) || $isOperatorNode(anchorNode)) {
    if (offset === 0) {
      // Check if this node is the first child or inside the first child
      let current: LexicalNode | null = anchorNode;
      while (current && current !== row) {
        if (current === firstChild) return true;
        if (current.getPreviousSibling()) return false; // Has siblings before
        current = current.getParent();
      }
    }
  }

  return false;
}

/**
 * Check if cursor is at the end of a row.
 */
function isAtRowEnd(anchorNode: LexicalNode, offset: number, row: RowNode): boolean {
  // If cursor is on the row itself at the end
  if (anchorNode === row && offset === row.getChildrenSize()) return true;

  // If cursor is at the end of the last child
  const lastChild = row.getLastChild();
  if (!lastChild) return true; // Empty row

  if ($isNumberNode(anchorNode) || $isOperatorNode(anchorNode)) {
    const textLength = anchorNode.getTextContentSize();
    if (offset === textLength) {
      // Check if this node is the last child or inside the last child
      let current: LexicalNode | null = anchorNode;
      while (current && current !== row) {
        if (current === lastChild) return true;
        if (current.getNextSibling()) return false; // Has siblings after
        current = current.getParent();
      }
    }
  }

  // If anchor is the last child (could be a fraction or group)
  if (anchorNode === lastChild) return true;

  return false;
}

/**
 * Handle backspace for brackets:
 * 1. If at start of GroupNode, unwrap it (remove brackets, keep content)
 * 2. If at start of fraction row with auto-brackets, dismiss them
 * @returns true if handled, false otherwise
 */
function handleBracketBackspace(
  anchorNode: LexicalNode,
  offset: number,
  editor: LexicalEditor
): boolean {
  // Check if we're at the start of a GroupNode
  const parentGroup = findParentGroup(anchorNode);
  if (parentGroup && isAtGroupStart(anchorNode, offset, parentGroup)) {
    unwrapGroup(parentGroup);
    return true;
  }

  // Check if we're at the start of a fraction row with auto-brackets
  const currentRow = findParentRow(anchorNode);
  if (currentRow && $isRowNode(currentRow)) {
    const parent = currentRow.getParent();
    if ($isFractionNode(parent)) {
      // Check if auto-brackets would be showing (2+ children, not already dismissed)
      const childCount = currentRow.getChildrenSize();
      if (childCount >= 2 && !isAutoBracketsDismissed(currentRow.getKey())) {
        // Check if at the start of the row
        if (isAtRowStart(anchorNode, offset, currentRow)) {
          // Dismiss auto-brackets
          dismissAutoBrackets(currentRow.getKey());
          // Update the DOM to add the class
          const element = editor.getElementByKey(currentRow.getKey());
          if (element) {
            element.classList.add('auto-brackets-dismissed');
          }
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Find the parent GroupNode if the cursor is inside one.
 */
function findParentGroup(node: LexicalNode): GroupNode | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isGroupNode(current)) return current;
    current = current.getParent();
  }
  return null;
}

/**
 * Check if cursor is at the start of a group.
 */
function isAtGroupStart(anchorNode: LexicalNode, offset: number, group: GroupNode): boolean {
  // If cursor is on the group itself at position 0
  if (anchorNode === group && offset === 0) return true;

  // If cursor is at position 0 of the first child
  const firstChild = group.getFirstChild();
  if (!firstChild) return true; // Empty group

  if (anchorNode === firstChild && offset === 0) return true;

  // If the anchor is inside the first child and at position 0
  if ($isNumberNode(anchorNode) || $isOperatorNode(anchorNode)) {
    if (offset === 0) {
      // Check if this node is the first child or a descendant of the first child
      let current: LexicalNode | null = anchorNode;
      while (current && current !== group) {
        if (current === firstChild) return true;
        if (current.getPreviousSibling()) return false;
        current = current.getParent();
      }
    }
  }

  return false;
}

/**
 * Unwrap a GroupNode: move all children to parent, remove the group.
 */
function unwrapGroup(group: GroupNode): void {
  const parent = group.getParent();
  if (!parent) return;

  const children = group.getChildren();
  const firstChild = children[0];

  // Insert all children before the group in the parent
  for (const child of children) {
    group.insertBefore(child);
  }

  // Remove the empty group
  group.remove();

  // Position cursor at the start of where the group was
  if (firstChild) {
    const newSelection = $createRangeSelection();
    if ($isNumberNode(firstChild) || $isOperatorNode(firstChild)) {
      newSelection.anchor.set(firstChild.getKey(), 0, "text");
      newSelection.focus.set(firstChild.getKey(), 0, "text");
    } else {
      newSelection.anchor.set(firstChild.getKey(), 0, "element");
      newSelection.focus.set(firstChild.getKey(), 0, "element");
    }
    $setSelection(newSelection);
  } else if ($isRowNode(parent) || $isGroupNode(parent)) {
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(parent.getKey(), 0, "element");
    newSelection.focus.set(parent.getKey(), 0, "element");
    $setSelection(newSelection);
  }
}

function handleDigitInput(digit: string, currentRow: RowNode | GroupNode): void {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchorNode = selection.anchor.getNode();
  const offset = selection.anchor.offset;

  // If we're in a NumberNode, insert digit at cursor position
  if ($isNumberNode(anchorNode)) {
    const currentText = anchorNode.__text;
    const newText =
      currentText.slice(0, offset) + digit + currentText.slice(offset);
    anchorNode.setTextContent(newText);
    
    // Move cursor forward
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(anchorNode.getKey(), offset + 1, "text");
    newSelection.focus.set(anchorNode.getKey(), offset + 1, "text");
    $setSelection(newSelection);
    return;
  }

  // Create a new NumberNode
  const numberNode = $createNumberNode(digit);

  if ($isOperatorNode(anchorNode)) {
    // If at end of operator, insert after; if at start, insert before
    if (offset === 0) {
      anchorNode.insertBefore(numberNode);
    } else {
      anchorNode.insertAfter(numberNode);
    }
  } else if ($isRowNode(anchorNode) || $isGroupNode(anchorNode)) {
    // Cursor is on the row/group itself, insert at the offset position
    const childAtOffset = anchorNode.getChildAtIndex(offset);
    if (childAtOffset) {
      childAtOffset.insertBefore(numberNode);
    } else {
      anchorNode.append(numberNode);
    }
  } else {
    // Fallback: append to row
    currentRow.append(numberNode);
  }

  // Select end of new number node
  const newSelection = $createRangeSelection();
  newSelection.anchor.set(numberNode.getKey(), 1, "text");
  newSelection.focus.set(numberNode.getKey(), 1, "text");
  $setSelection(newSelection);
}

function handleOperatorInput(operator: string, currentRow: RowNode | GroupNode): void {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchorNode = selection.anchor.getNode();
  const offset = selection.anchor.offset;

  // Check if we should convert auto-brackets to real GroupNode
  if (operator === "(" || operator === ")") {
    const converted = tryConvertAutoBracketsToGroup(operator, currentRow, anchorNode, offset);
    if (converted) return;
  }

  const operatorNode = $createOperatorNode(operator);

  // If cursor is in a NumberNode, we need to split it or insert before/after
  if ($isNumberNode(anchorNode)) {
    const text = anchorNode.__text;

    if (offset === 0) {
      // Insert before the number
      anchorNode.insertBefore(operatorNode);
    } else if (offset >= text.length) {
      // Insert after the number
      anchorNode.insertAfter(operatorNode);
    } else {
      // Split the number node
      const beforeText = text.slice(0, offset);
      const afterText = text.slice(offset);

      anchorNode.setTextContent(beforeText);
      const afterNode = $createNumberNode(afterText);
      anchorNode.insertAfter(operatorNode);
      operatorNode.insertAfter(afterNode);
    }
  } else if ($isOperatorNode(anchorNode)) {
    // Insert after the operator
    anchorNode.insertAfter(operatorNode);
  } else if ($isRowNode(anchorNode) || $isGroupNode(anchorNode)) {
    // Cursor is on the row/group itself, insert at the offset position
    const childAtOffset = anchorNode.getChildAtIndex(offset);
    if (childAtOffset) {
      childAtOffset.insertBefore(operatorNode);
    } else {
      anchorNode.append(operatorNode);
    }
  } else {
    // Fallback: append to row
    currentRow.append(operatorNode);
  }

  // If we inserted a bracket, try to match brackets in the row
  if (operator === "(" || operator === ")") {
    const wasMatched = matchBracketsInRow(currentRow);
    
    if (wasMatched) {
      // The bracket operator was removed during grouping
      // Find the newly created group and position cursor appropriately
      // For now, just leave selection as-is (Lexical will handle it)
      return;
    }
  }

  // Move cursor after operator
  const newSelection = $createRangeSelection();
  newSelection.anchor.set(operatorNode.getKey(), 1, "text");
  newSelection.focus.set(operatorNode.getKey(), 1, "text");
  $setSelection(newSelection);
}

/**
 * Scans a RowNode for matching bracket pairs and converts them to GroupNodes.
 * Handles nested brackets by processing innermost pairs first.
 * @returns true if any brackets were matched and grouped
 */
function matchBracketsInRow(row: RowNode | GroupNode): boolean {
  let anyMatched = false;
  // Keep matching until no more pairs are found
  let foundMatch = true;
  
  while (foundMatch) {
    foundMatch = false;
    const children = row.getChildren();
    
    // Stack to track opening brackets
    const openBracketStack: LexicalNode[] = [];
    
    for (const child of children) {
      if ($isOperatorNode(child) && child.__text === "(") {
        openBracketStack.push(child);
      } else if ($isOperatorNode(child) && child.__text === ")") {
        // Found closing bracket - match with most recent opening bracket
        if (openBracketStack.length > 0) {
          const openBracket = openBracketStack.pop()!;
          const closeBracket = child;
          
          // Collect nodes between the brackets
          const nodesToMove: LexicalNode[] = [];
          let current = openBracket.getNextSibling();
          while (current && current !== closeBracket) {
            nodesToMove.push(current);
            current = current.getNextSibling();
          }
          
          // Create the group and move content directly into it
          const groupNode = $createGroupNode();
          
          // Insert group where the open bracket was
          openBracket.insertAfter(groupNode);
          
          // Move content directly into the group (no inner RowNode)
          for (const node of nodesToMove) {
            node.remove();
            groupNode.append(node);
          }
          
          // Remove the bracket operators
          openBracket.remove();
          closeBracket.remove();
          
          foundMatch = true;
          anyMatched = true;
          break; // Restart the loop to handle any remaining brackets
        }
      }
    }
  }
  
  return anyMatched;
}

function handleFractionInput(currentRow: RowNode | GroupNode): void {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchorNode = selection.anchor.getNode();
  const offset = selection.anchor.offset;

  // Check if we're already at max nesting depth
  if (getFractionDepth(currentRow) >= MAX_FRACTION_DEPTH) {
    return; // Don't allow deeper nesting
  }

  // Create fraction
  const fractionNode = $createFractionNode();

  // Find what should become the numerator (the node/content immediately before cursor)
  let nodeBeforeCursor: LexicalNode | null = null;
  let insertionPoint: LexicalNode | null = null;

  if ($isNumberNode(anchorNode)) {
    if (offset === 0) {
      // Cursor at start of number - previous sibling becomes numerator
      nodeBeforeCursor = anchorNode.getPreviousSibling();
      insertionPoint = anchorNode; // Insert before this node
    } else if (offset >= anchorNode.getTextContentSize()) {
      // Cursor at end of number - this number becomes numerator
      nodeBeforeCursor = anchorNode;
      insertionPoint = anchorNode.getNextSibling(); // Insert after this node (before next)
    } else {
      // Cursor in middle of number - split it, left part becomes numerator
      const text = anchorNode.getTextContent();
      const leftText = text.slice(0, offset);
      const rightText = text.slice(offset);

      // Update current node to be just the right part
      anchorNode.setTextContent(rightText);

      // Create left part as numerator
      const leftNode = $createNumberNode(leftText);
      fractionNode.numerator.append(leftNode);

      // Insert fraction before the remaining right part
      anchorNode.insertBefore(fractionNode);

      // Place cursor in denominator
      const denominator = fractionNode.denominator;
      const newSelection = $createRangeSelection();
      newSelection.anchor.set(denominator.getKey(), 0, "element");
      newSelection.focus.set(denominator.getKey(), 0, "element");
      $setSelection(newSelection);
      return;
    }
  } else if ($isOperatorNode(anchorNode)) {
    // Cursor is on an operator - previous sibling becomes numerator
    nodeBeforeCursor = anchorNode.getPreviousSibling();
    insertionPoint = anchorNode; // Insert before the operator
  } else if ($isRowNode(anchorNode) || $isGroupNode(anchorNode)) {
    // Cursor is on the row/group itself
    if (offset > 0) {
      // Get the child before the cursor position
      nodeBeforeCursor = anchorNode.getChildAtIndex(offset - 1);
      insertionPoint = anchorNode.getChildAtIndex(offset); // Could be null if at end
    }
  } else if ($isFractionNode(anchorNode) || $isGroupNode(anchorNode)) {
    // Cursor on a fraction or group - it becomes the numerator
    nodeBeforeCursor = anchorNode;
    insertionPoint = anchorNode.getNextSibling();
  }

  // If we found a node to use as numerator
  if (nodeBeforeCursor && ($isNumberNode(nodeBeforeCursor) || $isFractionNode(nodeBeforeCursor) || $isGroupNode(nodeBeforeCursor))) {
    // Move it to the numerator
    nodeBeforeCursor.remove();
    fractionNode.numerator.append(nodeBeforeCursor);

    // Insert fraction at the correct position
    if (insertionPoint) {
      insertionPoint.insertBefore(fractionNode);
    } else {
      currentRow.append(fractionNode);
    }
  } else {
    // No suitable numerator found - create empty fraction at cursor position
    if (insertionPoint) {
      insertionPoint.insertBefore(fractionNode);
    } else if ($isNumberNode(anchorNode) || $isOperatorNode(anchorNode)) {
      anchorNode.insertAfter(fractionNode);
    } else {
      currentRow.append(fractionNode);
    }
  }

  // Place cursor in denominator
  const denominator = fractionNode.denominator;
  const newSelection = $createRangeSelection();
  newSelection.anchor.set(denominator.getKey(), 0, "element");
  newSelection.focus.set(denominator.getKey(), 0, "element");
  $setSelection(newSelection);
}

function handleBackspace(anchorNode: LexicalNode, offset: number): void {
  // If we're in a NumberNode
  if ($isNumberNode(anchorNode)) {
    const text = anchorNode.getTextContent();
    
    if (offset > 0) {
      // Delete character at offset
      const newText = text.slice(0, offset - 1) + text.slice(offset);
      
      if (newText.length === 0) {
        // Remove the node entirely
        const prevSibling = anchorNode.getPreviousSibling();
        const parent = anchorNode.getParent();
        anchorNode.remove();
        
        // Move cursor appropriately
        if (prevSibling) {
          const newSelection = $createRangeSelection();
          if ($isNumberNode(prevSibling) || $isOperatorNode(prevSibling)) {
            const len = prevSibling.getTextContentSize();
            newSelection.anchor.set(prevSibling.getKey(), len, "text");
            newSelection.focus.set(prevSibling.getKey(), len, "text");
          } else {
            newSelection.anchor.set(prevSibling.getKey(), 0, "element");
            newSelection.focus.set(prevSibling.getKey(), 0, "element");
          }
          $setSelection(newSelection);
        } else if (parent && $isRowNode(parent)) {
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(parent.getKey(), 0, "element");
          newSelection.focus.set(parent.getKey(), 0, "element");
          $setSelection(newSelection);
        }
      } else {
        anchorNode.setTextContent(newText);
        const newSelection = $createRangeSelection();
        newSelection.anchor.set(anchorNode.getKey(), offset - 1, "text");
        newSelection.focus.set(anchorNode.getKey(), offset - 1, "text");
        $setSelection(newSelection);
      }
    }
    return;
  }

  // If we're in an OperatorNode, delete it entirely
  if ($isOperatorNode(anchorNode)) {
    const prevSibling = anchorNode.getPreviousSibling();
    const parent = anchorNode.getParent();
    anchorNode.remove();
    
    if (prevSibling) {
      const newSelection = $createRangeSelection();
      if ($isNumberNode(prevSibling) || $isOperatorNode(prevSibling)) {
        const len = prevSibling.getTextContentSize();
        newSelection.anchor.set(prevSibling.getKey(), len, "text");
        newSelection.focus.set(prevSibling.getKey(), len, "text");
      } else {
        newSelection.anchor.set(prevSibling.getKey(), 0, "element");
        newSelection.focus.set(prevSibling.getKey(), 0, "element");
      }
      $setSelection(newSelection);
    } else if (parent && $isRowNode(parent)) {
      const newSelection = $createRangeSelection();
      newSelection.anchor.set(parent.getKey(), 0, "element");
      newSelection.focus.set(parent.getKey(), 0, "element");
      $setSelection(newSelection);
    }
    return;
  }

  // If we're in a RowNode
  if ($isRowNode(anchorNode)) {
    const lastChild = anchorNode.getLastChild();
    if (lastChild) {
      // Delete last child
      if ($isNumberNode(lastChild) || $isOperatorNode(lastChild)) {
        lastChild.remove();
      } else if ($isFractionNode(lastChild) || $isGroupNode(lastChild)) {
        // For complex nodes, move cursor inside to delete from there
        // or remove the entire thing if empty
        lastChild.remove();
      }
    } else {
      // Row is empty, try to exit up
      const parent = anchorNode.getParent();
      if ($isFractionNode(parent)) {
        const numerator = parent.numerator;
        const denominator = parent.denominator;
        const grandparent = parent.getParent();

        // Check if we're in the denominator
        if (anchorNode === denominator) {
          // Backspace on empty denominator: delete fraction, promote numerator content
          const numChildren = numerator.getChildren();
          const lastNumChild = numChildren[numChildren.length - 1];

          // Move numerator content before the fraction
          for (const child of numChildren) {
            parent.insertBefore(child);
          }

          // Remove the fraction
          parent.remove();

          // Position cursor after the promoted content
          if (lastNumChild) {
            const newSelection = $createRangeSelection();
            if ($isNumberNode(lastNumChild) || $isOperatorNode(lastNumChild)) {
              const len = lastNumChild.getTextContentSize();
              newSelection.anchor.set(lastNumChild.getKey(), len, "text");
              newSelection.focus.set(lastNumChild.getKey(), len, "text");
            } else {
              newSelection.anchor.set(lastNumChild.getKey(), lastNumChild.getChildrenSize?.() || 0, "element");
              newSelection.focus.set(lastNumChild.getKey(), lastNumChild.getChildrenSize?.() || 0, "element");
            }
            $setSelection(newSelection);
          } else if (grandparent && ($isRowNode(grandparent) || $isGroupNode(grandparent))) {
            const newSelection = $createRangeSelection();
            newSelection.anchor.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
            newSelection.focus.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
            $setSelection(newSelection);
          }
        } else if (anchorNode === numerator) {
          // Backspace on empty numerator: move to denominator if it has content, else delete fraction
          if (denominator.getChildrenSize() > 0) {
            // Move cursor to start of denominator
            const firstDenChild = denominator.getFirstChild();
            const newSelection = $createRangeSelection();
            if (firstDenChild && ($isNumberNode(firstDenChild) || $isOperatorNode(firstDenChild))) {
              newSelection.anchor.set(firstDenChild.getKey(), 0, "text");
              newSelection.focus.set(firstDenChild.getKey(), 0, "text");
            } else {
              newSelection.anchor.set(denominator.getKey(), 0, "element");
              newSelection.focus.set(denominator.getKey(), 0, "element");
            }
            $setSelection(newSelection);
          } else {
            // Both empty, remove the entire fraction
            parent.remove();
            if (grandparent && ($isRowNode(grandparent) || $isGroupNode(grandparent))) {
              const newSelection = $createRangeSelection();
              newSelection.anchor.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
              newSelection.focus.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
              $setSelection(newSelection);
            }
          }
        }
      } else if ($isGroupNode(parent)) {
        // Remove empty group
        const grandparent = parent.getParent();
        parent.remove();
        if (grandparent && $isRowNode(grandparent)) {
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
          newSelection.focus.set(grandparent.getKey(), grandparent.getChildrenSize(), "element");
          $setSelection(newSelection);
        }
      }
    }
  }
}

function exitMathExpression(node: LexicalNode): void {
  const mathExpr = findMathExpression(node);
  if (!mathExpr) return;

  // Place cursor after the math expression in the parent
  const parent = mathExpr.getParent();
  if (!parent) return;

  const index = mathExpr.getIndexWithinParent();
  const newSelection = $createRangeSelection();
  newSelection.anchor.set(parent.getKey(), index + 1, "element");
  newSelection.focus.set(parent.getKey(), index + 1, "element");
  $setSelection(newSelection);
}

/**
 * Handle typing a digit or operator at a selected fraction.
 * Inserts the new node before or after based on selection side.
 */
function handleInputAtFraction(fraction: LexicalNode, newNode: LexicalNode, side: SelectionSide): void {
  if (side === "left") {
    fraction.insertBefore(newNode);
  } else {
    fraction.insertAfter(newNode);
  }

  // Move cursor to the new node (at the end, so user can keep typing)
  const newSelection = $createRangeSelection();
  if ($isNumberNode(newNode) || $isOperatorNode(newNode)) {
    newSelection.anchor.set(newNode.getKey(), newNode.getTextContentSize(), "text");
    newSelection.focus.set(newNode.getKey(), newNode.getTextContentSize(), "text");
  }
  $setSelection(newSelection);
}

/**
 * Handle typing "/" with a selected fraction.
 * If selected from right: wraps fraction as numerator of new fraction.
 * If selected from left: wraps fraction as denominator of new fraction.
 */
function handleFractionWrap(selectedFraction: LexicalNode, side: SelectionSide): void {
  if (!$isFractionNode(selectedFraction)) return;

  // Check if wrapping would exceed max nesting depth
  // The selected fraction already has some depth, plus its own internal depth
  const currentDepth = getFractionDepth(selectedFraction);
  if (currentDepth >= MAX_FRACTION_DEPTH) {
    return; // Don't allow deeper nesting
  }

  // Create a new fraction
  const newFraction = $createFractionNode();

  // Insert the new fraction where the selected one was
  selectedFraction.insertAfter(newFraction);
  selectedFraction.remove();

  if (side === "right") {
    // Selected from right: fraction becomes numerator, cursor goes to denominator
    newFraction.numerator.append(selectedFraction);
    const denominator = newFraction.denominator;
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(denominator.getKey(), 0, "element");
    newSelection.focus.set(denominator.getKey(), 0, "element");
    $setSelection(newSelection);
  } else {
    // Selected from left: fraction becomes denominator, cursor goes to numerator
    newFraction.denominator.append(selectedFraction);
    const numerator = newFraction.numerator;
    const newSelection = $createRangeSelection();
    newSelection.anchor.set(numerator.getKey(), 0, "element");
    newSelection.focus.set(numerator.getKey(), 0, "element");
    $setSelection(newSelection);
  }
}

