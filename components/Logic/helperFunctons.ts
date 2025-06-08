import { Cursor, Node, Row } from '../Types'

export const getIndex = (cursor: Cursor): number => {
    if (!cursor.parent) {
        return 0
    }

    // Find the index of the cursor in its parent's children
    return cursor.parent.children.findIndex(child => child.id === cursor.id)
}

export const insertNode = (node: Node, cursor: Cursor) => {
    const index = getIndex(cursor)
    cursor.parent.children.splice(index, 0, node)
}

// function to get node to left and right of input node
export const getAdjacentNodes = (node: Node): { left: Node | null, right: Node | null } => {
    if (!node.parent) {
        return { left: null, right: null }
    }

    const index = getIndex(node as Cursor)
    const children = node.parent.children

    return {
        left: index > 0 ? children[index - 1] : null,
        right: index < children.length - 1 ? children[index + 1] : null
    }
}

export const moveNode = (node: Node, newParent: Row, index: number) => {
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
