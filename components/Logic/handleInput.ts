import { Cursor } from '../Types'
import { logNodeTree } from './nodeUtils'
import { insertFraction, insertSymbol } from './edit'
import { moveLeft, moveRight, moveUp, moveDown } from './navigation'

export const handleInput = (input: string, cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    logNodeTree(cursor.root)

    // Handle arrow keys
    if (input === 'ArrowLeft') {
        moveLeft(cursor, setCursor)
        return
    }
    if (input === 'ArrowRight') {
        moveRight(cursor, setCursor)
        return
    }
    if (input === 'ArrowUp') {
        moveUp(cursor, setCursor)
        return
    }
    if (input === 'ArrowDown') {
        moveDown(cursor, setCursor)
        return
    }

    // Handle other inputs
    if (['+', '-', '*'].includes(input) || /^[0-9]$/.test(input)) {
        insertSymbol(input, cursor)
        // Force a re-render by creating a new cursor object
        setCursor({ ...cursor })
    } else if (input === '/') {
        insertFraction(cursor)
        setCursor({ ...cursor })
    } else if (input === '^') {
        console.log('Exponent operator')
    }
}
