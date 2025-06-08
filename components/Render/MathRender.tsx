import React, { useState, useEffect } from 'react'
import { Cursor, Node, Symbol, Row, Fraction } from '../Types'
import styles from './MathRender.module.css'

interface MathRenderProps {
    cursor: Cursor
}

const renderNode = (node: Node, isCursorBlinking: boolean): React.ReactNode => {
    switch (node.type) {
        case 'symbol':
            const symbol = node as Symbol;
            // Convert symbols to proper mathematical ones
            let displayValue = symbol.value;
            if (symbol.value === '*') displayValue = '·';
            if (symbol.value === '-') displayValue = '−'; // Proper minus sign (U+2212)

            const isNumber = /^[0-9]$/.test(symbol.value);
            const needsSpace = !isNumber; // Add space if it's not a number

            return <span className={`text-xl ${needsSpace ? 'ml-1 mr-1' : ''}`} style={{ fontFamily: "'Times New Roman', serif" }}>{displayValue}</span>
        case 'row':
            const row = node as Row;
            return row.children.map((child) => (
                <React.Fragment key={child.id}>
                    {renderNode(child, isCursorBlinking)}
                </React.Fragment>
            ))
        case 'fraction':
            const fraction = node as Fraction;
            return (
                <span className={styles.fraction}>
                    <span className={styles.numerator}>{renderNode(fraction.numerator, isCursorBlinking)}</span>
                    <span className={styles.denominator}>{renderNode(fraction.denominator, isCursorBlinking)}</span>
                </span>
            )
        case 'cursor':
            return <span className={`${styles.cursor} ${isCursorBlinking ? styles.blink : ''}`}>{'\u200b'}</span>
        default:
            return null
    }
}

const MathRender = ({ cursor }: MathRenderProps) => {
    const [isCursorBlinking, setIsCursorBlinking] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsCursorBlinking(prev => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-3 border border-gray-200 rounded flex items-center" style={{ fontFamily: "'Times New Roman', serif" }}>
            {renderNode(cursor.root, isCursorBlinking)}
        </div>
    )
}

export default MathRender
