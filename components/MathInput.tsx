import React, { forwardRef } from 'react'
import { Cursor } from './Types'
import { handleInput } from './Logic/handleInput'

interface MathInputProps {
    cursor: Cursor
    setCursor: (cursor: Cursor) => void
}

const MathInput = forwardRef<HTMLDivElement, MathInputProps>(({ cursor, setCursor }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key.startsWith('Arrow')) {
            e.preventDefault()
            e.stopPropagation()
            console.log('key', e.key)
            handleInput(e.key, cursor, setCursor)
        } else if (e.key.length === 1) {
            console.log('key', e.key)
            handleInput(e.key, cursor, setCursor)
        }
    }

    return (
        <div
            ref={ref}
            className="w-full h-12 outline-none"
            tabIndex={0}
            role="textbox"
            aria-label="Math input"
            onKeyDown={handleKeyDown}
        />
    )
})

MathInput.displayName = 'MathInput'

export default MathInput
