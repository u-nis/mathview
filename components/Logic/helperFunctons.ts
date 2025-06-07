import { Cursor, Node } from '../Types'

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