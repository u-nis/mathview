import { Node, Row, Symbol, Fraction, Cursor } from '../Types'

const indent = (str: string, level: number) => {
    return '  '.repeat(level) + str
}

const formatNode = (node: Node, level: number = 0): string => {
    switch (node.type) {
        case 'row':
            return formatRow(node as Row, level)
        case 'symbol':
            return formatSymbol(node as Symbol, level)
        case 'fraction':
            return formatFraction(node as Fraction, level)
        case 'cursor':
            return formatCursor(node as Cursor, level)
        default:
            return indent(`Unknown node type: ${(node as any).type}`, level)
    }
}

const formatRow = (row: Row, level: number): string => {
    const lines = [
        indent(`Row(id: ${row.id})`, level),
        indent('children:', level)
    ]

    row.children.forEach(child => {
        lines.push(formatNode(child, level + 1))
    })

    return lines.join('\n')
}

const formatSymbol = (symbol: Symbol, level: number): string => {
    return indent(`Symbol(id: ${symbol.id}, value: "${symbol.value}")`, level)
}

const formatFraction = (fraction: Fraction, level: number): string => {
    const lines = [
        indent(`Fraction(id: ${fraction.id})`, level),
        indent('numerator:', level)
    ]
    lines.push(formatNode(fraction.numerator, level + 1))
    lines.push(indent('denominator:', level))
    lines.push(formatNode(fraction.denominator, level + 1))
    return lines.join('\n')
}

const formatCursor = (cursor: Cursor, level: number): string => {
    return indent(`Cursor(id: ${cursor.id})`, level)
}

export const logNode = (node: Node) => {
    console.log('\nNode Structure:')
    console.log(formatNode(node))
    console.log('\n')
}

export const logNodeTree = (root: Node) => {
    console.log('\nNode Tree:')
    console.log(formatNode(root))
    console.log('\n')
} 