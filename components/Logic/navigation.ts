import { Cursor } from '../Types'
import { getAdjacentNodes, getIndex, moveNode } from './helperFunctons'

export const moveLeft = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    const currentIndex = getIndex(cursor)
    const left = getAdjacentNodes(cursor).left;
    if (currentIndex > 0) {
        if (left.type === 'fraction') {
            moveNode(cursor, left.numerator , left.numerator.children.length);
            setCursor({ ...cursor })
        }
        else{ // left is not a fraction
        // Move cursor one position left
        cursor.parent.children.splice(currentIndex - 1, 0, cursor)
        cursor.parent.children.splice(currentIndex + 1, 1)
        setCursor({ ...cursor })
        }
    }
    else if (cursor.parent.parent.type === 'fraction') {
        const fracindex = getIndex(cursor.parent.parent);
        moveNode(cursor, cursor.parent.parent.parent, fracindex-1);
        setCursor({ ...cursor })
    }
}

export const moveRight = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    const currentIndex = getIndex(cursor);
    const right = getAdjacentNodes(cursor).right;
    if (currentIndex < cursor.parent.children.length - 1) {
        if (right.type === 'fraction') {
            moveNode(cursor, right.numerator, 0);
            setCursor({ ...cursor })
        }
        else{ // right is not a fraction
        // Move cursor one position right
        cursor.parent.children.splice(currentIndex + 2, 0, cursor)
        cursor.parent.children.splice(currentIndex, 1)
        setCursor({ ...cursor })
        }
    }
    else if (cursor.parent.parent.type === 'fraction') { // at the end of the fraction, move to the parent
        const fracindex = getIndex(cursor.parent.parent);
        moveNode(cursor, cursor.parent.parent.parent, fracindex+1);
        setCursor({ ...cursor })
    }
}

export const moveUp = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    // TODO: Implement vertical navigation
    console.log('Move up')
}

export const moveDown = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    // TODO: Implement vertical navigation
    console.log('Move down')
}
