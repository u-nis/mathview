import React, { useEffect, forwardRef } from 'react'
import { Cursor } from './Types'
import { handleInput } from './Logic/handleInput'

interface MathInputProps {
    cursor: Cursor
    setCursor: (cursor: Cursor) => void
}

const MathInput = forwardRef<HTMLDivElement, MathInputProps>(({ cursor, setCursor }, ref) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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

        const element = ref as React.RefObject<HTMLDivElement>
        if (element?.current) {
            element.current.addEventListener('keydown', handleKeyDown)
            return () => element.current?.removeEventListener('keydown', handleKeyDown)
        }
    }, [cursor, ref, setCursor])

    return (
        <div
            ref={ref}
            className="w-full h-12 outline-none"
            tabIndex={0}
            role="textbox"
            aria-label="Math input"
        />
    )
})

MathInput.displayName = 'MathInput'

export default MathInput
