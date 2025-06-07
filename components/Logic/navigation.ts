import { Cursor } from '../Types'
import { getIndex } from './helperFunctons'

export const moveLeft = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    console.log('moveLeft')
    const currentIndex = getIndex(cursor)
    if (currentIndex > 0) {
        // Move cursor one position left
        cursor.parent.children.splice(currentIndex - 1, 0, cursor)
        cursor.parent.children.splice(currentIndex + 1, 1)
        setCursor({ ...cursor })
    }
}

export const moveRight = (cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    const currentIndex = getIndex(cursor)
    if (currentIndex < cursor.parent.children.length - 1) {
        // Move cursor one position right
        cursor.parent.children.splice(currentIndex + 2, 0, cursor)
        cursor.parent.children.splice(currentIndex, 1)
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
