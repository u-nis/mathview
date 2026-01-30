# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server with Turbopack
bun run build    # Production build
bun run lint     # Run ESLint
```

Package manager is Bun (v1.1.38).

## Architecture

MathView is a rich text editor built with Next.js 15 and Lexical, featuring a custom math expression system.

### Core Structure

- `app/page.tsx` - Main page rendering TopBar and Editor
- `components/Lexical/Editor/Editor.tsx` - Main editor component configuring LexicalComposer with all plugins and nodes
- `components/Lexical/Editor/ToolBar.tsx` - Toolbar with grouped controls (undo/redo, block type, font, text formatting)
- `components/Lexical/Editor/plugins/` - Rich text plugins (FontSize, TextColor, Alignment, etc.)

### Math Expression System

The custom math editor uses a hierarchical node structure, all under `components/Lexical/Math/`:

**Nodes** (`nodes/`):
- `MathExpressionNode` - Root container, inline element wrapping a RowNode
- `RowNode` - Horizontal container holding math elements
- `NumberNode` - TextNode subclass, only accepts digits
- `OperatorNode` - TextNode subclass, only accepts `+`, `-`, `*`, `=`, `(`, `)`
- `FractionNode` - ElementNode with two RowNode children (numerator, denominator)
- `GroupNode` - Parenthesized expression, content rendered between `()` via CSS

**Plugins** (`plugins/`):
- `InsertMathPlugin` - Detects `$$` pattern to create MathExpressionNode
- `MathInputPlugin` - Handles keyboard input within math: digits, operators, `/` for fractions, backspace, enter/escape to exit
- `MathNavigationPlugin` - Arrow key navigation respecting math structure (left/right through content, up/down between fraction parts)

**Styling** (`math.css`):
- Uses `data-lexical-math` attributes for CSS selectors
- Fractions use flexbox column layout with border for fraction bar
- Groups render parentheses via `::before`/`::after` pseudo-elements

### Key Patterns

- All Lexical nodes follow the pattern: class extending ElementNode/TextNode, static `getType()`, `clone()`, `importJSON()`, `exportJSON()`, `createDOM()`, `updateDOM()`
- Factory functions use `$create*Node()` naming convention
- Type guards use `$is*Node()` naming convention
- Plugins use `useLexicalComposerContext()` hook and register commands via `editor.registerCommand()`
