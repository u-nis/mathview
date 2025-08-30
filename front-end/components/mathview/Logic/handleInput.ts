import { Cursor, ExitCallbacks } from '../core/types'
import { insertExponent, insertFraction, insertSymbol } from './edit'
import { moveLeft, moveRight, moveUp, moveDown } from './navigation'
import { NAVIGATION_KEYS, MATH_OPERATORS, FRACTION_OPERATOR, EXPONENT_OPERATOR } from '../core/constants'

export const handleInput = (
    input: string,
    cursor: Cursor,
    setCursor: (cursor: Cursor) => void,
    exits?: ExitCallbacks
): void => {

    // Handle navigation keys
    switch (input) {
        case NAVIGATION_KEYS.ARROW_LEFT:
            moveLeft(cursor, setCursor, exits)
            return
        case NAVIGATION_KEYS.ARROW_RIGHT:
            moveRight(cursor, setCursor, exits)
            return
        case NAVIGATION_KEYS.ARROW_UP:
            moveUp(cursor, setCursor)
            return
        case NAVIGATION_KEYS.ARROW_DOWN:
            moveDown(cursor, setCursor)
            return
        case NAVIGATION_KEYS.BACKSPACE:
            // TODO: Implement deletion logic
            return
        case NAVIGATION_KEYS.SPACE:
            // Optional: treat space as exit to the right for convenience
            exits?.onExitRight?.()
            return
    }

    // Handle mathematical inputs
    if (MATH_OPERATORS.includes(input as any) || /^[0-9]$/.test(input)) {
        console.log('symbol', input)
        insertSymbol(input, cursor)
        setCursor({ ...cursor })
    } else if (input === FRACTION_OPERATOR) {
        insertFraction(cursor)
        setCursor({ ...cursor })
    } else if (input === EXPONENT_OPERATOR) {
        insertExponent(input, cursor)
        setCursor({ ...cursor })
    } 
}
