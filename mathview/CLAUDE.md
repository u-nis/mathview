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

MathView is a full-stack rich text editor built with Next.js 16 and Lexical, featuring a custom math expression system and a draggable workspace of editor + image/PDF reference windows. There is no backend database or login: documents, layout and reference files are persisted in the browser (localStorage + IndexedDB).

### Project Structure

All source code lives in `src/`:

```
src/
├── app/                    # Next.js App Router
│   ├── api/export-pdf/    # Browserless PDF generation
│   └── page.tsx           # Main page (TopBar + Workspace)
├── components/
│   ├── Document/          # DocumentProvider (localStorage docs), DocumentTitle
│   ├── Lexical/           # Editor and math system
│   ├── TopBar/            # Menu bar
│   └── Workspace/         # Grid canvas, editor window, image/PDF panels, sidebars
└── lib/storage/           # localStorage + IndexedDB helpers
```

### Core Editor

- `src/app/page.tsx` - Main page rendering TopBar and Workspace
- `src/components/Workspace/Workspace.tsx` - Grid canvas; editor window (uniform scale resize), image/PDF panels (free resize + zoom), left sidebar = document tabs, right sidebar = reference tabs (click toggles minimize, × closes). Windows never overlap and keep a `GAP` margin (`geometry.ts`)
- `src/components/Lexical/Editor/Editor.tsx` - Main editor with LexicalComposer
- `src/components/Lexical/Editor/ToolBar.tsx` - Toolbar controls
- `src/components/Lexical/Editor/Plugins/` - Editor plugins

### Math Expression System

Custom math editor under `src/components/Lexical/Math/`:

**Nodes** (`nodes/`):
- `MathExpressionNode` - Root container, inline element wrapping a RowNode
- `RowNode` - Horizontal container holding math elements
- `NumberNode` - TextNode subclass, only accepts digits
- `OperatorNode` - TextNode subclass, only accepts `+`, `-`, `*`, `=`, `(`, `)`
- `FractionNode` - ElementNode with two RowNode children (numerator, denominator)
- `GroupNode` - Parenthesized expression, content rendered between `()` via CSS

**Plugins** (`plugins/`):
- `InsertMathPlugin` - Detects `$$` pattern to create MathExpressionNode
- `MathInputPlugin` - Handles keyboard input within math
- `MathNavigationPlugin` - Arrow key navigation respecting math structure

### Persistence (browser only)

- **Documents**: `DocumentProvider` + `DocumentSyncPlugin` autosave Lexical JSON to localStorage
- **Layout**: `mathview:workspace` in localStorage
- **Reference files**: IndexedDB (`src/lib/storage/fileStore.ts`); PDFs rendered with pdfjs-dist, worker copied to `public/` by `scripts/copy-pdf-worker.mjs`
- **PDF Export**: Server-side via Browserless (`src/app/api/export-pdf/`)

See `SETUP.md` for backend configuration instructions.

### Key Patterns

- Lexical nodes: class extending ElementNode/TextNode with `getType()`, `clone()`, `importJSON()`, `exportJSON()`, `createDOM()`, `updateDOM()`
- Factory functions: `$create*Node()` naming
- Type guards: `$is*Node()` naming
- Plugins: `useLexicalComposerContext()` hook + `editor.registerCommand()`
- Path alias: `@/` maps to `src/`
