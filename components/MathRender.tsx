import React from 'react'
import { Cursor, Node, Symbol, Row } from './Types'
import styles from './MathRender.module.css';

interface MathRenderProps {
    cursor: Cursor
}

const renderNode = (node: Node): React.ReactNode => {
    switch (node.type) {
        case 'symbol':
            const symbol = node as Symbol;
            // Convert symbols to proper mathematical ones
            let displayValue = symbol.value;
            if (symbol.value === '*') displayValue = '·';
            if (symbol.value === '-') displayValue = '−'; // Proper minus sign (U+2212)

            const isNumber = /^[0-9]$/.test(symbol.value);
            const needsSpace = !isNumber; // Add space if it's not a number

            return <span className={`text-xl ${needsSpace ? 'ml-1 mr-1' : ''}`}>{displayValue}</span>
        case 'row':
            const row = node as Row;
            return row.children.map((child) => (
                <React.Fragment key={child.id}>
                    {renderNode(child)}
                </React.Fragment>
            ))
        case 'cursor':
            return <span className={`${styles.cursor} ${styles.blink}`}>{'\u200b'}</span>
        default:
            return null
    }
}

const MathRender = ({ cursor }: MathRenderProps) => {
    return (
        <div className="p-4 min-h-[50px] border border-gray-200 rounded flex items-center">
            {renderNode(cursor.root)}
        </div>
    )
}

export default MathRender
