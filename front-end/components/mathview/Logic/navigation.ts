import { Cursor } from '../core/types'
import { getAdjacentNodes, getIndex, moveNode } from '../core/utils'

/**
 * Moves cursor to the left
 */
import { ExitCallbacks, Fraction, Exponent, Row, Node } from '../core/types'

// Local type guards and helpers to avoid unsafe parent traversals
const isFraction = (n: unknown): n is Fraction =>
    !!n && typeof n === 'object' && (n as any).type === 'fraction'

const isExponent = (n: unknown): n is Exponent =>
    !!n && typeof n === 'object' && (n as any).type === 'exponent'

const isRow = (n: unknown): n is Row =>
    !!n && typeof n === 'object' && (n as any).type === 'row'

const hasParent = (n: { parent?: unknown } | null | undefined): n is { parent: Row | Fraction | Exponent | null } =>
    !!n && 'parent' in n

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
    } else if ((cursor.parent === cursor.root || (hasParent(cursor.parent) && cursor.parent.parent === null)) && left === null) {
        // At the leftmost boundary of the root node: exit to host editor
        exits?.onExitLeft?.()
    } else if (hasParent(cursor.parent) && isFraction(cursor.parent.parent)) {
        const fraction = cursor.parent.parent
        const parentOfFraction = hasParent(fraction) ? fraction.parent : null
        if (parentOfFraction && isRow(parentOfFraction)) {
            const fracIndex = getIndex(fraction);
            moveNode(cursor, parentOfFraction, fracIndex - 1);
        }
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
    } else if ((cursor.parent === cursor.root || (hasParent(cursor.parent) && cursor.parent.parent === null)) && right === null) {
        // At the rightmost boundary of the root node: exit to host editor
        exits?.onExitRight?.()
    } else if (hasParent(cursor.parent) && isFraction(cursor.parent.parent)) {
        // At the end of the fraction, move to the parent row
        const fraction = cursor.parent.parent
        const parentOfFraction = hasParent(fraction) ? fraction.parent : null
        if (parentOfFraction && isRow(parentOfFraction)) {
            const fracIndex = getIndex(fraction);
            moveNode(cursor, parentOfFraction, fracIndex + 1);
        }
        setCursor({ ...cursor })
    }
}

export const moveUp = (cursor: Cursor, setCursor: (cursor: Cursor) => void): void => {
    const currentRow = cursor.parent

    // Helper: find the container row that holds the structure alongside this row
    const getContainerRow = (row: Row): Row | null => {
        if (!hasParent(row)) return null
        const p = row.parent
        if (isRow(p)) return p
        if (isFraction(p) || isExponent(p)) {
            const gp = hasParent(p) ? p.parent : null
            return isRow(gp) ? gp : null
        }
        return null
    }

    // Helper: find an exponent in the same container that references this row
    const findEnclosingExponentInRow = (container: Row, row: Row): Exponent | null => {
        for (const child of container.children) {
            if (isExponent(child)) {
                if (child.base === row || child.raised === row) {
                    return child
                }
            }
        }
        return null
    }

    // 1) If cursor is in the denominator of a fraction, move to the numerator:
    //    choose the column index, clamp to the closest existing child above, and if that child is a fraction, descend into its denominator
    if (hasParent(currentRow) && isFraction(currentRow.parent) && currentRow.parent.denominator === currentRow) {
        const fraction = currentRow.parent
        const numerator = fraction.numerator
        const total = numerator.children.length
        const rawCol = Math.max(0, getIndex(cursor))
        if (total === 0) {
            moveNode(cursor, numerator, 0)
            setCursor({ ...cursor })
            return
        }
        const col = Math.max(0, Math.min(rawCol, total - 1))

        const resolveDirectlyAboveRow = (startRow: Row, c: number): Row => {
            let current: Row = startRow
            while (true) {
                if (c < 0) return current
                if (c >= current.children.length) return current
                const candidate: Node = current.children[c]
                if (isFraction(candidate)) {
                    current = candidate.denominator
                    continue
                }
                return current
            }
        }

        const targetRow = resolveDirectlyAboveRow(numerator, col)
        const targetIndex = Math.min(col, targetRow.children.length)
        moveNode(cursor, targetRow, targetIndex)
        setCursor({ ...cursor })
        return
    }

    // 2) If cursor is in the base of an exponent, move to the raised (column-preserving)
    {
        const container = getContainerRow(currentRow)
        if (container) {
            const exp = findEnclosingExponentInRow(container, currentRow)
            if (exp && exp.base === currentRow) {
                const raised = exp.raised
                const cursorIndexInBase = Math.max(0, getIndex(cursor))
                const targetIndex = Math.min(cursorIndexInBase, raised.children.length)
                moveNode(cursor, raised, targetIndex)
                setCursor({ ...cursor })
                return
            }
        }
    }

    // 3) If cursor is in the numerator of a fraction AND that fraction sits in the denominator of a parent fraction,
    //    go to whatever is directly above: compute the column index of the inner fraction inside the outer denominator,
    //    move to the outer numerator at that index, then repeatedly descend into denominators if fractions are stacked above.
    if (hasParent(currentRow) && isFraction(currentRow.parent) && currentRow.parent.numerator === currentRow) {
        const innerFraction = currentRow.parent
        const container = hasParent(innerFraction) ? innerFraction.parent : null
        if (container && isRow(container) && hasParent(container) && isFraction(container.parent) && container.parent.denominator === container) {
            const outerFraction = container.parent
            const outerNumerator = outerFraction.numerator

            // Column position of the inner fraction within the outer denominator row
            const columnIndex = Math.max(0, getIndex(innerFraction))

            // Resolve the row directly above following any stacked fractions' denominators
            const resolveDirectlyAboveRow = (startRow: Row, col: number): Row => {
                let current: Row = startRow
                // Walk while the element at the column is a fraction; descend into its denominator
                while (true) {
                    if (col < 0) return current
                    if (col >= current.children.length) return current
                    const candidate: Node = current.children[col]
                    if (isFraction(candidate)) {
                        current = candidate.denominator
                        continue
                    }
                    return current
                }
            }

            const targetRow = resolveDirectlyAboveRow(outerNumerator, columnIndex)
            const targetIndex = Math.min(columnIndex, targetRow.children.length)
            moveNode(cursor, targetRow, targetIndex)
            setCursor({ ...cursor })
            return
        }
    }
}

export const moveDown = (cursor: Cursor, setCursor: (cursor: Cursor) => void): void => {
    const currentRow = cursor.parent

    // Helper: find the container row that holds the structure alongside this row
    const getContainerRow = (row: Row): Row | null => {
        if (!hasParent(row)) return null
        const p = row.parent
        if (isRow(p)) return p
        if (isFraction(p) || isExponent(p)) {
            const gp = hasParent(p) ? p.parent : null
            return isRow(gp) ? gp : null
        }
        return null
    }

    // Helper: find an exponent in the same container that references this row
    const findEnclosingExponentInRow = (container: Row, row: Row): Exponent | null => {
        for (const child of container.children) {
            if (isExponent(child)) {
                if (child.base === row || child.raised === row) {
                    return child
                }
            }
        }
        return null
    }

    // 1) If cursor is in the numerator of a fraction, move to the denominator:
    //    choose the column index, clamp to the closest existing child below, and if that child is a fraction, descend into its numerator
    if (hasParent(currentRow) && isFraction(currentRow.parent) && currentRow.parent.numerator === currentRow) {
        const fraction = currentRow.parent
        const denominator = fraction.denominator
        const total = denominator.children.length
        const rawCol = Math.max(0, getIndex(cursor))
        if (total === 0) {
            moveNode(cursor, denominator, 0)
            setCursor({ ...cursor })
            return
        }
        const col = Math.max(0, Math.min(rawCol, total - 1))

        const resolveDirectlyBelowRow = (startRow: Row, c: number): Row => {
            let current: Row = startRow
            while (true) {
                if (c < 0) return current
                if (c >= current.children.length) return current
                const candidate: Node = current.children[c]
                if (isFraction(candidate)) {
                    current = candidate.numerator
                    continue
                }
                return current
            }
        }

        const targetRow = resolveDirectlyBelowRow(denominator, col)
        const targetIndex = Math.min(col, targetRow.children.length)
        moveNode(cursor, targetRow, targetIndex)
        setCursor({ ...cursor })
        return
    }

    // 2) If cursor is in the raised of an exponent, move to the base (column-preserving)
    {
        const container = getContainerRow(currentRow)
        if (container) {
            const exp = findEnclosingExponentInRow(container, currentRow)
            if (exp && exp.raised === currentRow) {
                const base = exp.base
                const cursorIndexInRaised = Math.max(0, getIndex(cursor))
                const targetIndex = Math.min(cursorIndexInRaised, base.children.length)
                moveNode(cursor, base, targetIndex)
                setCursor({ ...cursor })
                return
            }
        }
    }

    // 2b) If cursor is in the base of an exponent and that exponent sits in the raised of a parent exponent,
    //     move down to that parent exponent's base (column-preserving)
    {
        const container = getContainerRow(currentRow)
        if (container) {
            const exp = findEnclosingExponentInRow(container, currentRow)
            if (exp && exp.base === currentRow) {
                // If this base belongs to an exponent that is inside the raised row of a parent exponent
                if (hasParent(container) && isExponent(container.parent) && container.parent.raised === container) {
                    const outerExp = container.parent
                    const outerBase = outerExp.base
                    const cursorIndexInBase = Math.max(0, getIndex(cursor))
                    const targetIndex = Math.min(cursorIndexInBase, outerBase.children.length)
                    moveNode(cursor, outerBase, targetIndex)
                    setCursor({ ...cursor })
                    return
                }
            }
        }
    }

    // 3) If cursor is in the denominator of a fraction AND that fraction sits in the numerator of a parent fraction,
    //    go to whatever is directly below: compute the column index of the inner fraction inside the outer numerator,
    //    move to the outer denominator at that index, then repeatedly descend into numerators if fractions are stacked below.
    if (hasParent(currentRow) && isFraction(currentRow.parent) && currentRow.parent.denominator === currentRow) {
        const innerFraction = currentRow.parent
        const container = hasParent(innerFraction) ? innerFraction.parent : null
        if (container && isRow(container) && hasParent(container) && isFraction(container.parent) && container.parent.numerator === container) {
            const outerFraction = container.parent
            const outerDenominator = outerFraction.denominator

            // Column position of the inner fraction within the outer numerator row
            const columnIndex = Math.max(0, getIndex(innerFraction))

            // Resolve the row directly below following any stacked fractions' numerators
            const resolveDirectlyBelowRow = (startRow: Row, col: number): Row => {
                let current: Row = startRow
                // Walk while the element at the column is a fraction; descend into its numerator
                while (true) {
                    if (col < 0) return current
                    if (col >= current.children.length) return current
                    const candidate: Node = current.children[col]
                    if (isFraction(candidate)) {
                        current = candidate.numerator
                        continue
                    }
                    return current
                }
            }

            const targetRow = resolveDirectlyBelowRow(outerDenominator, columnIndex)
            const targetIndex = Math.min(columnIndex, targetRow.children.length)
            moveNode(cursor, targetRow, targetIndex)
            setCursor({ ...cursor })
            return
        }
    }
}
