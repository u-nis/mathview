import React, { useState, useEffect } from 'react'
import { Cursor, Node, Symbol, Row, Fraction, Exponent, MathViewConfig } from '../Types'
import styles from './MathRender.module.css'

interface MathRenderProps {
    cursor: Cursor
    config?: MathViewConfig
    showCursor?: boolean
}

// Zero-width space character used by MathQuill
const U_ZERO_WIDTH_SPACE = '\u200B';

const renderNode = (node: Node, isCursorBlinking: boolean, config: MathViewConfig, showCursor: boolean, depth: number = 0): React.ReactNode => {
    switch (node.type) {
        case 'symbol':
            const symbol = node as Symbol;
            // Convert symbols to proper mathematical ones (matching MathQuill's approach)
            let displayValue = symbol.value;
            if (symbol.value === '*') displayValue = '·';
            if (symbol.value === '-') displayValue = '−'; // Proper minus sign (U+2212)

            const isNumber = /^[0-9]$/.test(symbol.value);
            const isOperator = /^[+\-*/=<>]$/.test(symbol.value);
            const isBinaryOperator = isOperator && !isNumber;

            // Apply MathQuill-style classes
            const symbolClasses = [
                styles.symbol,
                isBinaryOperator ? styles.binaryOperator : ''
            ].filter(Boolean).join(' ');

            return (
                <span 
                    key={symbol.id}
                    className={symbolClasses}
                    data-symbol={symbol.value}
                    style={{
                        color: config.fontColor
                    }}
                >
                    {displayValue}
                </span>
            );
            
        case 'row':
            const row = node as Row;
            return (
                <span key={row.id} className={styles.row}>
                    {row.children.map((child) => 
                        renderNode(child, isCursorBlinking, config, showCursor, depth)
                    )}
                </span>
            );
            
        case 'fraction':
            const fraction = node as Fraction;
            // Apply MathQuill-style nested fraction handling with proper font-size cascade
            const fractionClasses = [
                styles.fraction,
                styles.nonLeaf
            ].filter(Boolean).join(' ');
            
            return (
                <span key={fraction.id} className={fractionClasses}>
                    <span className={styles.numerator}>
                        {renderNode(fraction.numerator, isCursorBlinking, config, showCursor, depth + 1)}
                        {/* Add zero-width space if numerator is empty, like MathQuill */}
                        {!fraction.numerator.children || fraction.numerator.children.length === 0 ? U_ZERO_WIDTH_SPACE : ''}
                    </span>
                    <span className={styles.denominator}>
                        {renderNode(fraction.denominator, isCursorBlinking, config, showCursor, depth + 1)}
                        {/* Add zero-width space if denominator is empty, like MathQuill */}
                        {!fraction.denominator.children || fraction.denominator.children.length === 0 ? U_ZERO_WIDTH_SPACE : ''}
                    </span>
                    {/* Zero-width space for positioning, exactly as MathQuill does */}
                    <span style={{ display: 'inline-block', width: 0 }}>{U_ZERO_WIDTH_SPACE}</span>
                </span>
            );

        case 'exponent':
            const exponent = node as Exponent;
            // MathQuill's exact exponent rendering approach
            const expClasses = [
                styles.exponent,
                styles.nonLeaf
            ].filter(Boolean).join(' ');
            
            return (
                <span key={exponent.id} className={expClasses}>
                    {renderNode(exponent.base, isCursorBlinking, config, showCursor, depth)}
                    <span className={styles.exponentContent}>
                        {renderNode(exponent.raised, isCursorBlinking, config, showCursor, depth + 1)}
                        {/* Add zero-width space if exponent is empty */}
                        {!exponent.raised.children || exponent.raised.children.length === 0 ? U_ZERO_WIDTH_SPACE : ''}
                    </span>
                </span>
            );
            
        case 'cursor':
            // Only render cursor if showCursor is true
            if (!showCursor) {
                return null;
            }
            
            // Critical: The cursor uses MathQuill's exact positioning approach
            // - border-left: 1px solid creates the visual cursor
            // - margin-left: -1px prevents it from displacing other content
            // - position: relative with z-index: 1 ensures proper layering
            // - The zero-width space ensures the cursor has content for proper positioning
            return (
                <span 
                    key="cursor"
                    className={`${styles.cursor} ${isCursorBlinking ? styles.blink : ''}`}
                    style={{
                        borderLeftColor: config.cursorColor,
                    }}
                >
                    {U_ZERO_WIDTH_SPACE}
                </span>
            );
            
        default:
            return null;
    }
}

const MathRender = ({ cursor, config, showCursor = true }: MathRenderProps) => {
    const [isCursorBlinking, setIsCursorBlinking] = useState(true);
    const defaultConfig: MathViewConfig = {
        fontFamily: 'Times New Roman, serif',
        fontSize: '16px',
        fontColor: '#000000',
        backgroundColor: 'transparent',
        cursorColor: '#000000',
        ...config
    };

    useEffect(() => {
        // MathQuill uses 500ms intervals for cursor blinking
        const interval = setInterval(() => {
            setIsCursorBlinking(prev => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Determine if the root block is empty (excluding cursor)
    const nonCursorChildren = cursor.root.type === 'row' ? 
        cursor.root.children.filter(child => child.type !== 'cursor') : [];
    const isEmpty = cursor.root.type === 'row' && nonCursorChildren.length === 0;
    
    // Apply MathQuill-style root classes
    const rootClasses = [
        styles.rootBlock,
        isEmpty ? styles.empty : ''
    ].filter(Boolean).join(' ');

    return (
        <span className={rootClasses} aria-hidden="true">
            {renderNode(cursor.root, isCursorBlinking, defaultConfig, showCursor, 0)}
            {/* MathQuill's approach: always ensure non-zero width even when empty */}
            {isEmpty ? U_ZERO_WIDTH_SPACE : ''}
        </span>
    );
}

export default MathRender
