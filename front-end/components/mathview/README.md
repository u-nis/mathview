# MathView Component

A mathematical expression editor component built with React and TypeScript.

## Structure

```
mathview/
├── core/                    # Core types, constants, and utilities
│   ├── types.ts            # All type definitions
│   ├── constants.ts        # Centralized constants
│   └── utils.ts            # Utility functions
├── Logic/                   # Business logic
│   ├── handleInput.ts      # Input handling
│   ├── navigation.ts       # Cursor navigation
│   └── edit.ts             # Node insertion/editing
├── Render/                  # Rendering components
│   ├── MathRender.tsx      # Main renderer
│   └── MathRender.module.css
├── MathEditor.tsx          # Main editor component
├── MathInput.tsx           # Input handling component
└── MathEditor.module.css   # Editor styles
```

## Core Components

### Types (`core/types.ts`)

- `BaseNode`: Base type for all nodes
- `Row`: Container for child nodes
- `Symbol`: Mathematical symbols and numbers
- `Fraction`: Fraction structure with numerator/denominator
- `Exponent`: Exponent structure with base/raised
- `Cursor`: Cursor position tracking
- `MathViewConfig`: Configuration interface
- `ExitCallbacks`: Navigation callbacks

### Constants (`core/constants.ts`)

- `MATH_EDITOR_CONSTANTS`: Default configuration values
- `MATH_EVENTS`: Custom event names
- `NODE_TYPES`: Node type constants
- `NAVIGATION_KEYS`: Keyboard navigation keys
- `MATH_OPERATORS`: Mathematical operators

### Utils (`core/utils.ts`)

- `createId()`: Generate unique node IDs
- `getIndex()`: Get node index in parent
- `moveNode()`: Move node to new position
- `insertNode()`: Insert node at cursor
- `getAdjacentNodes()`: Get nodes adjacent to cursor
- `moveCursorToNode()`: Move cursor to specific node
- `formatNode()`: Format node for debugging

## Logic Components

### Input Handling (`Logic/handleInput.ts`)

Handles all user input including:

- Navigation keys (arrows, backspace, space)
- Mathematical symbols and numbers
- Fraction and exponent operators

### Navigation (`Logic/navigation.ts`)

Manages cursor movement:

- `moveLeft()`: Move cursor left
- `moveRight()`: Move cursor right
- `moveUp()`: Move cursor up (TODO)
- `moveDown()`: Move cursor down (TODO)

### Editing (`Logic/edit.ts`)

Handles node creation and insertion:

- `insertSymbol()`: Insert mathematical symbols
- `insertFraction()`: Create fraction structure
- `insertExponent()`: Create exponent structure
- `deleteAtCursor()`: Delete at cursor (TODO)

## Main Components

### MathEditor (`MathEditor.tsx`)

The main editor component that:

- Manages the node tree structure
- Handles cursor positioning
- Provides API for external control
- Integrates input and rendering

### MathInput (`MathInput.tsx`)

Handles keyboard input and delegates to the input handling logic.

### MathRender (`Render/MathRender.tsx`)

Renders the mathematical expression tree with proper spacing and styling.

## Usage

```tsx
import MathEditor from "./components/mathview/MathEditor";

function App() {
  return (
    <MathEditor
      config={{
        fontSize: "20px",
        fontFamily: "Times New Roman",
      }}
      onExitLeft={() => console.log("Exited left")}
      onExitRight={() => console.log("Exited right")}
    />
  );
}
```

## API

The MathEditor exposes these methods via ref:

- `insert(input)`: Insert a character or symbol
- `focus()`: Focus the editor
- `setCursorToStart()`: Move cursor to start
- `setCursorToEnd()`: Move cursor to end
- `setFontSize(px)`: Set font size
- `removeCursor()`: Remove cursor from display
- `restoreCursorAtStart()`: Restore cursor at start
- `restoreCursorAtEnd()`: Restore cursor at end

## Integration with Lexical

The MathView component integrates with Lexical through the `MathNode` decorator node, which:

- Embeds MathEditor in Lexical documents
- Handles navigation between Lexical and MathView
- Manages cursor placement and selection
- Supports font size synchronization
