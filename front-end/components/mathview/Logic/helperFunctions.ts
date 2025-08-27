import { Cursor, Node, Row } from '../Types'

/**
 * Gets the index of a node within its parent's children array
 */
export const getIndex = (node: Node): number => {
    if (!node.parent) {
        return 0
    }

    return node.parent.children.findIndex(child => child.id === node.id)
}

/**
 * Inserts a node at the cursor position
 */
export const insertNode = (node: Node, cursor: Cursor): void => {
    const index = getIndex(cursor)
    cursor.parent.children.splice(index, 0, node)
}

/**
 * Gets the adjacent nodes to the left and right of the given node
 */
export const getAdjacentNodes = (node: Node): { left: Node | null, right: Node | null } => {
    if (!node.parent) {
        return { left: null, right: null }
    }

    const index = getIndex(node)
    const children = node.parent.children

    return {
        left: index > 0 ? children[index - 1] : null,
        right: index < children.length - 1 ? children[index + 1] : null
    }
}

/**
 * Moves a node to a new parent at the specified index
 */
export const moveNode = (node: Node, newParent: Row, index: number): void => {
    // Remove node from its current parent
    if (node.parent) {
        const oldChildren = node.parent.children
        const oldIndex = oldChildren.findIndex(child => child.id === node.id)
        if (oldIndex !== -1) {
            oldChildren.splice(oldIndex, 1)
        }
    }

    // Set new parent
    node.parent = newParent

    // Insert node into new parent's children at the specified index
    newParent.children.splice(index, 0, node)
}

/**
 * Moves cursor to a specific node position
 */
export const moveCursorToNode = (cursor: Cursor, targetNode: Node, setCursor: (cursor: Cursor) => void): void => {
    if (!targetNode.parent || targetNode.parent.type !== 'row') {
        return
    }

    const parent = targetNode.parent as Row
    const targetIndex = getIndex(targetNode)
    
    // Move cursor to the position right after the clicked node
    moveNode(cursor, parent, targetIndex + 1)
    setCursor({ ...cursor })
}
