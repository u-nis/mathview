import { Cursor } from '../Types'
import { logNodeTree } from './nodeUtils'
import { insertExponent, insertFraction, insertSymbol } from './edit'
import { moveLeft, moveRight, moveUp, moveDown } from './navigation'

// Constants for better maintainability
const NAVIGATION_KEYS = {
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    BACKSPACE: 'Backspace',
    SPACE: ' '
} as const

const MATH_OPERATORS = ['+', '-', '*'] as const
const FRACTION_OPERATOR = '/' as const
const EXPONENT_OPERATOR = '^' as const

export const handleInput = (input: string, cursor: Cursor, setCursor: (cursor: Cursor) => void): void => {
    logNodeTree(cursor.root)
    console.log('input', input)

    // Handle navigation keys
    switch (input) {
        case NAVIGATION_KEYS.ARROW_LEFT:
            moveLeft(cursor, setCursor)
            return
        case NAVIGATION_KEYS.ARROW_RIGHT:
            moveRight(cursor, setCursor)
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
            const event = new CustomEvent('math-navigate-right', {
                detail: { nodeKey: (window as any).currentMathNodeKey }
            });
            document.dispatchEvent(event);
            return
    }

    // Handle mathematical inputs
    if (MATH_OPERATORS.includes(input as any) || /^[0-9]$/.test(input)) {
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
