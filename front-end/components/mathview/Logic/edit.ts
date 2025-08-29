import { Cursor, Exponent, Fraction, Row, MathSymbol } from '../core/types'
import { getAdjacentNodes, getIndex, insertNode, moveNode, createId } from '../core/utils'


// Handle basic symbol insertion (+, -, *, /)
/**
 * Inserts a symbol at the cursor position
 */
export const insertSymbol = (input: string, cursor: Cursor): void => {
    const symbolNode: MathSymbol = {
        type: 'symbol',
        value: input,
        parent: cursor.parent,
        id: createId()
    }

    insertNode(symbolNode, cursor)
}


/**
 * Inserts an exponent at the cursor position
 */
export const insertExponent = (input: string, cursor: Cursor): void => {
    const baseNode: Row = {
        type: 'row',
        children: [],
        parent: cursor.parent,
        id: createId()
    }
    const raisedNode: Row = {
        type: 'row',
        children: [],
        parent: cursor.parent,
        id: createId()
    }
    const exponentNode: Exponent = {
        type: 'exponent',
        base: baseNode,
        raised: raisedNode,
        parent: cursor.parent,
        id: createId()
    }
    moveNode(getAdjacentNodes(cursor).left, baseNode, 0)
    insertNode(exponentNode, cursor)
    moveNode(cursor, raisedNode, 1)
}


/**
 * Inserts a fraction at the cursor position
 */
export const insertFraction = (cursor: Cursor): void => {
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
        const numbers: MathSymbol[] = []
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
        for (let i = 0; i < numbers.length; i++) {
            const numberNode = numbers[i]
            moveNode(numberNode, numeratorNode, numeratorNode.children.length)
        }

        moveNode(fractionNode, cursor.parent, cursorIndex)
        moveNode(cursor, denominatorNode, 0)
    } else if (left.type === 'fraction') {
        moveNode(fractionNode, cursor.parent, cursorIndex)
        moveNode(left, numeratorNode, 0)
        moveNode(cursor, denominatorNode, 0)
    }

}



export const deleteAtCursor = (cursor: Cursor): void => {
    // TODO: Implement deletion logic
}
