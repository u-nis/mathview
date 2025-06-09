import { Cursor, Fraction, Row, Symbol } from '../Types'
import { getAdjacentNodes, getIndex, insertNode, moveNode } from './helperFunctons'
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
    // console.log('Left:', left)
    // console.log('Right:', right)

    const fractionNode: Fraction = {
        type: 'fraction',
        numerator: null,
        denominator: null,
        parent: cursor.parent,
        id: createId()
    }
    const numeratorNode: Row = {
        type: 'row',
        children: [],
        parent: fractionNode,
        id: createId()
    }
    const denominatorNode: Row = {
        type: 'row',
        children: [],
        parent: fractionNode,
        id: createId()
    }
    fractionNode.numerator = numeratorNode
    fractionNode.denominator = denominatorNode

    const cursorIndex = getIndex(cursor)
    let leftIndex = cursorIndex - 1

    // Move all consecutive number nodes to the left of the cursor into the numerator node

    const left = getAdjacentNodes(cursor).left;
    if (left.type === 'symbol'){
        const siblings = cursor.parent.children

        // Collect indices of consecutive number nodes to the left
        const numbers: Symbol[] = []
        while (leftIndex >= 0) {
            const node = siblings[leftIndex]
            if (node.type === 'symbol' && typeof node.value === 'string' && /^[0-9]$/.test(node.value)) {
                numbers.unshift(node) // unshift to preserve order
                leftIndex--
            } else {
                break
            }
        }

        // Move each number node into the numerator node
        console.log('Number indices:', numbers)
        for (let i = 0; i < numbers.length; i++) {
            const numberNode = numbers[i]
            moveNode(numberNode, numeratorNode, numeratorNode.children.length)
        }

    moveNode(fractionNode, cursor.parent, cursorIndex)
    moveNode(cursor, denominatorNode, 0)
    }

    else if (left.type === 'fraction'){
        console.log('Left is a fraction')
    moveNode(fractionNode, cursor.parent, cursorIndex)
        moveNode(left,numeratorNode,0)
        moveNode(cursor, denominatorNode, 0)
    }

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
