import { Cursor } from '../Types'
import { logNodeTree } from './nodeUtils'
import { insertSymbol } from './edit'
import { moveLeft, moveRight, moveUp, moveDown } from './navigation'

export const handleInput = (input: string, cursor: Cursor, setCursor: (cursor: Cursor) => void) => {
    console.log('Input:', input)
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
        console.log('Division operator')
    } else if (input === '^') {
        console.log('Exponent operator')
    }
}
