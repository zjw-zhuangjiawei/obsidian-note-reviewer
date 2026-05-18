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
fsrs-last-review: '2026-05-18T08:00:00.000Z'
fsrs-scheduled-days: 2
fsrs-elapsed-days: 0
fsrs-reps: 3
fsrs-lapses: 0
---
```

## Installation

### BRAT (recommended)

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) via the community plugin browser
2. Open **BRAT -> Add Beta plugin**
3. Paste this repo URL: `https://github.com/zhuangjiawei/obsidian-note-reviewer`
4. Enable **Note Reviewer** in **Settings -> Community plugins**

### Manual

Requires [Bun](https://bun.sh). Clone into `<vault>/.obsidian/plugins/obsidian-note-reviewer/`:

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

On first rating, the plugin injects all 9 FSRS fields into the note's YAML frontmatter. On subsequent ratings, those fields are updated. Body text is never touched.

## License

MIT
