import { Cursor } from '../core/types'
import { getAdjacentNodes, getIndex, moveNode } from '../core/utils'

/**
 * Moves cursor to the left
 */
import { ExitCallbacks } from '../core/types'

export const moveLeft = (cursor: Cursor, setCursor: (cursor: Cursor) => void, exits?: ExitCallbacks): void => {
    const currentIndex = getIndex(cursor)
    const left = getAdjacentNodes(cursor).left;
    
    if (currentIndex > 0) {
        if (left.type === 'fraction') {
            moveNode(cursor, left.numerator, left.numerator.children.length);
            setCursor({ ...cursor })
        } else {
            // Move cursor one position left
            cursor.parent.children.splice(currentIndex - 1, 0, cursor)
            cursor.parent.children.splice(currentIndex + 1, 1)
            setCursor({ ...cursor })
        }
    } else if (cursor.parent.id === 'root' && left === null) {
        // At the leftmost boundary of the root node: exit to host editor
        exits?.onExitLeft?.()
    } else if (cursor.parent.parent?.type === 'fraction') {
        const fracIndex = getIndex(cursor.parent.parent);
        moveNode(cursor, cursor.parent.parent.parent!, fracIndex - 1);
        setCursor({ ...cursor })
    }
}

/**
 * Moves cursor to the right
 */
export const moveRight = (cursor: Cursor, setCursor: (cursor: Cursor) => void, exits?: ExitCallbacks): void => {
    const currentIndex = getIndex(cursor);
    const right = getAdjacentNodes(cursor).right;
    
    if (currentIndex < cursor.parent.children.length - 1) {
        if (right.type === 'fraction') {
            moveNode(cursor, right.numerator, 0);
            setCursor({ ...cursor })
        } else {
            // Move cursor one position right
            cursor.parent.children.splice(currentIndex + 2, 0, cursor)
            cursor.parent.children.splice(currentIndex, 1)
            setCursor({ ...cursor })
        }
    } else if (cursor.parent.id === 'root' && right === null) {
        // At the rightmost boundary of the root node: exit to host editor
        exits?.onExitRight?.()
    } else if (cursor.parent.parent?.type === 'fraction') {
        // At the end of the fraction, move to the parent
        const fracIndex = getIndex(cursor.parent.parent);
        moveNode(cursor, cursor.parent.parent.parent!, fracIndex + 1);
        setCursor({ ...cursor })
    }
}

export const moveUp = (cursor: Cursor, setCursor: (cursor: Cursor) => void): void => {
    // TODO: Implement vertical navigation
}

export const moveDown = (cursor: Cursor, setCursor: (cursor: Cursor) => void): void => {
    // TODO: Implement vertical navigation
}
