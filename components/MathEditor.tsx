"use client"
import React, { useEffect, useRef, useState } from 'react'
import MathInput from './MathInput'
import MathRender from './MathRender'
import { Row, Cursor } from './Types'

let id = 1;
export const createId = () => {
    id++;
    console.log('id', id)
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
        console.log('rootid', root.id)
        rootRef.current = root

        const newCursor: Cursor = {
            id: '1',
            type: 'cursor',
            parent: root,
            root: root
        }
        console.log('cursorid', newCursor.id)
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
        <div className="max-w-2xl mx-auto">
            <div
                className="min-h-[100px] border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-text select-none"
                onMouseDown={handleContainerMouseDown}
            >
                <MathRender cursor={cursor} />
                <MathInput cursor={cursor} setCursor={setCursor} ref={inputRef} />
            </div>
        </div>
    )
}

export default MathEditor