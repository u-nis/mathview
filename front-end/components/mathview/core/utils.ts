import { Node, Cursor, Row, Symbol, Fraction, Exponent } from './types';

/**
 * Creates a unique ID for nodes
 */
export const createId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Gets the index of a node within its parent's children array
 */
export const getIndex = (node: Node): number => {
  if (!node.parent) return -1;
  return node.parent.children.findIndex(child => child.id === node.id);
};

/**
 * Moves a node to a new parent at a specific index
 */
export const moveNode = (node: Node, newParent: Row, index: number): void => {
  // Remove from current parent
  if (node.parent) {
    const currentIndex = getIndex(node);
    if (currentIndex !== -1) {
      node.parent.children.splice(currentIndex, 1);
    }
  }

  // Add to new parent
  node.parent = newParent;
  newParent.children.splice(index, 0, node);
};

/**
 * Inserts a node at the cursor position
 */
export const insertNode = (node: Node, cursor: Cursor): void => {
  const index = getIndex(cursor);
  if (index !== -1) {
    moveNode(node, cursor.parent, index);
  }
};

/**
 * Gets adjacent nodes to the cursor
 */
export const getAdjacentNodes = (cursor: Cursor): { left: Node | null; right: Node | null } => {
  const index = getIndex(cursor);
  if (index === -1) return { left: null, right: null };

  const parent = cursor.parent;
  const left = index > 0 ? parent.children[index - 1] : null;
  const right = index < parent.children.length - 1 ? parent.children[index + 1] : null;

  return { left, right };
};

/**
 * Moves cursor to a specific node
 */
export const moveCursorToNode = (cursor: Cursor, targetNode: Node, setCursor: (cursor: Cursor) => void): void => {
  if (targetNode.type === 'cursor') return;

  // Find the target node's position
  let targetParent = targetNode.parent;
  let targetIndex = getIndex(targetNode);

  if (targetParent && targetIndex !== -1) {
    moveNode(cursor, targetParent, targetIndex + 1);
    setCursor({ ...cursor });
  }
};

/**
 * Formats a node for debugging (simplified version)
 */
export const formatNode = (node: Node, level: number = 0): string => {
  const indent = (str: string, level: number): string => '  '.repeat(level) + str;
  
  if (node.type === 'cursor') {
    return indent(`Cursor(id: ${node.id})`, level);
  }
  
  if (node.type === 'symbol') {
    return indent(`Symbol(id: ${node.id}, value: "${node.value}")`, level);
  }
  
  if (node.type === 'row') {
    const children = node.children.map(child => formatNode(child, level + 1)).join('\n');
    return indent(`Row(id: ${node.id})`, level) + (children ? '\n' + children : '');
  }
  
  if (node.type === 'fraction') {
    const numerator = formatNode(node.numerator, level + 1);
    const denominator = formatNode(node.denominator, level + 1);
    return indent(`Fraction(id: ${node.id})`, level) + '\n' + numerator + '\n' + denominator;
  }
  
  if (node.type === 'exponent') {
    const base = formatNode(node.base, level + 1);
    const raised = formatNode(node.raised, level + 1);
    return indent(`Exponent(id: ${node.id})`, level) + '\n' + base + '\n' + raised;
  }
  
  return indent(`Unknown Node(id: ${node.id}, type: ${node.type})`, level);
};
