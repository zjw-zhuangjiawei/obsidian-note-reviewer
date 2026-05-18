# Note Reviewer

FSRS-based spaced repetition for whole Obsidian notes. No UI — four rating commands and your YAML frontmatter.

## Concept

Open a note, read it, press a hotkey to rate it. The plugin writes FSRS scheduling state into the note's YAML frontmatter.

```yaml
---
fsrs-due: '2026-05-20T08:00:00.000Z'
fsrs-state: 2
fsrs-stability: 3.42
fsrs-difficulty: 0.23
---
```

## Installation

Requires Bun. Clone into `<vault>/.obsidian/plugins/obsidian-note-reviewer/`:

```bash
bun install
bun run build
```

Then enable **Note Reviewer** in **Settings -> Community plugins**.

## Usage

Open a note, read it, then rate it with one of four commands:

| Command         | Suggested hotkey |
| --------------- | ---------------- |
| Rate: Again (1) | `Ctrl+Shift+1`   |
| Rate: Hard (2)  | `Ctrl+Shift+2`   |
| Rate: Good (3)  | `Ctrl+Shift+3`   |
| Rate: Easy (4)  | `Ctrl+Shift+4`   |

Go to **Settings -> Hotkeys** and bind these to your preferred keys.

On first rating, the plugin injects `fsrs-due`, `fsrs-state`, `fsrs-stability`, and `fsrs-difficulty` into the note's YAML frontmatter. On subsequent ratings, those fields are updated. Body text is never touched.

## How it works

| Step               | What happens                                                       |
| ------------------ | ------------------------------------------------------------------ |
| Rate active note   | Plugin reads `app.metadataCache.getFileCache(file).frontmatter`    |
| Compute next state | `fsrs.js` takes (current state, rating) and returns new state      |
| Write back         | `app.fileManager.processFrontMatter()` updates only the YAML block |

No disk reads. No file IDs. No external database.

## Build

```bash
bun install          # install deps
bun run dev          # watch mode
bun run build        # production build
```

## License

MIT
