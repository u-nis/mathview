import { Cursor, Symbol } from '../Types'
import { getIndex, insertNode } from './helperFunctons'
import { createId } from '../MathEditor'


// Handle basic symbol insertion (+, -, *, /)
export const insertSymbol = (input: string, cursor: Cursor) => {
    // TODO: Implement symbol insertion logic
    const symbolNode: Symbol = {
        type: 'symbol',
        value: input,
        parent: cursor.parent,
        id: createId()
    }

    console.log('Inserting symbol:', input, symbolNode.id)
    insertNode(symbolNode, cursor)
}



// Handle fraction insertion
export const insertFraction = (cursor: Cursor) => {
    // TODO: Implement fraction insertion logic
    console.log('Inserting fraction')
}

// Handle exponent insertion
export const insertExponent = (cursor: Cursor) => {
    // TODO: Implement exponent insertion logic
    console.log('Inserting exponent')
}

// Handle deletion
export const deleteAtCursor = (cursor: Cursor) => {
    // TODO: Implement deletion logic
    console.log('Deleting at cursor')
}
