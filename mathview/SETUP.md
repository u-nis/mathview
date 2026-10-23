# MathView Setup

MathView has no database and no login. Everything the user works on is kept
in their own browser:

| What | Where |
| --- | --- |
| Documents (editor tabs) | `localStorage` → `mathview:docs`, `mathview:doc:<id>` |
| Workspace layout (window positions, sizes, zoom, which tabs are open) | `localStorage` → `mathview:workspace` |
| Reference images / PDFs | IndexedDB → database `mathview`, store `files` |

Clearing site data in the browser erases all of it.

## Install & run

```bash
bun install   # also copies pdf.js's worker to public/pdf.worker.min.mjs
bun dev
```

## PDF export (optional)

Server-side PDF export uses Browserless.

1. Sign up at https://browserless.io (free tier: 1000 PDFs/month)
2. Add the key to `.env.local`:
   ```
   BROWSERLESS_API_KEY=your_api_key_here
   ```
3. `bun dev`, add content, File → Export → PDF
