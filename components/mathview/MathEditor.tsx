"use client"
import React, { useEffect, useRef, useState } from 'react'
import MathInput from './MathInput'
import MathRender from './mathview/Render/MathRender'
import { Row, Cursor } from './Types'
import styles from './MathEditor.module.css'

let id = 1;
export const createId = () => {
    id++;
    return id.toString();
}

const MathEditor = () => {
    const rootRef = useRef<Row | null>(null)
    const [cursor, setCursor] = useState<Cursor | null>(null)
    const inputRef = useRef<HTMLDivElement>(null)

    // Initialize root and cursor on mount
    useEffect(() => {
        const root: Row = {
            id: '0',
            type: 'row',
            children: [],
            parent: null
        }
        rootRef.current = root

        const newCursor: Cursor = {
            id: '1',
            type: 'cursor',
            parent: root,
            root: root
        }
        setCursor(newCursor)
        root.children = [newCursor]
    }, [])

    const handleContainerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        inputRef.current?.focus()
    }

    if (!cursor || !rootRef.current) {
        return null
    }

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.container}
                onMouseDown={handleContainerMouseDown}
            >
                <MathRender cursor={cursor} />
                <MathInput cursor={cursor} setCursor={setCursor} ref={inputRef} />
            </div>
        </div>
    )
}

export default MathEditor