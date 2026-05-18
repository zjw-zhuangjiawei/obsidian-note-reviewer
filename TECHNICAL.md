# Technical documentation

## Data model

All FSRS state lives in a note's YAML frontmatter. No IDs, no external database.

### Frontmatter fields

```yaml
fsrs-due: '2026-05-20T08:00:00.000Z' # ISO 8601, next review due
fsrs-state: 2 # 0=New, 1=Learning, 2=Review, 3=Relearning
fsrs-stability: 3.42 # memory stability (days)
fsrs-difficulty: 0.23 # intrinsic difficulty [0, 1]
fsrs-last-review: '2026-05-18T10:00:00.000Z'
fsrs-scheduled-days: 2
fsrs-elapsed-days: 0
fsrs-reps: 3
fsrs-lapses: 0
```

### State transitions

```
                    +---------+
        +---------->|   New   |<--+
        |           +----+----+   |
        |                |        |
        |          [first rating] |
        |                |        |
        |     +----------+        |
        |     v                   |
        |  +----------+           |
        |  | Learning |           |
        |  +----+-----+           |
        |       |                 |
        |  [Good/Easy]   [Again]  |
        |       |                 |
        |  +----v-----+           |
        |  |  Review  |           |
        |  +----+-----+           |
        |       |                 |
        |  [Again]                |
        |       |                 |
        |  +----v--------+        |
        +--+ Relearning  |--------+
           +-------------+
```

### Missing fields on first rating

When a note has never been rated (no `fsrs-*` fields in frontmatter), `rateNote()` passes defaults to the FSRS engine:

| Field             | Default                                 |
| ----------------- | --------------------------------------- |
| `fsrs-due`        | `undefined` (treated as now by fsrs.js) |
| `fsrs-state`      | `undefined` (treated as New=0)          |
| `fsrs-stability`  | `undefined` (treated as 0)              |
| `fsrs-difficulty` | `undefined` (treated as 0)              |

After the first rating, all fields are written to frontmatter.

## Code flow

### Rating a note

```
User presses hotkey (e.g., Ctrl+Shift+3 for Good)
  -> addCommand callback in main.ts
    -> workspace.getActiveFile()
    -> scheduler.rateNote(file, FsrsRating.Good)
      -> metadataCache.getFileCache(file).frontmatter
      -> type guards validate each field
      -> computeNextState(current, rating)
        -> new FSRS() from fsrs.js
        -> construct Card from Partial<FsrsFrontMatter>
        -> fsrs.repeat(card, new Date())
        -> return SchedulingInfo[rating].card as FsrsFrontMatter
      -> processFrontMatter(file, fn)
        -> mutate frontmatter object in-place
        -> Obsidian writes YAML back, body unchanged
```

### Module boundaries

```
main.ts
  imports: Scheduler (from scheduler.ts), FsrsRating (from types.ts)
  depends on: Obsidian Plugin API

scheduler.ts
  imports: computeNextState (from fsrs-engine.ts), FsrsFrontMatter/FsrsRating (from types.ts)
  depends on: Obsidian MetadataCache, FileManager APIs

fsrs-engine.ts
  imports: fsrs.js, FsrsFrontMatter/FsrsRating (from types.ts)
  depends on: fsrs.js (npm package)

types.ts
  no imports
  no Obsidian dependencies — pure types
```

## API usage (Obsidian)

### Reading frontmatter (in-memory only)

```typescript
const cache = this.app.metadataCache.getFileCache(file);
const frontmatter = cache?.frontmatter; // Record<string, unknown> | undefined
```

This is a zero-disk-read operation — metadata cache is maintained in memory by Obsidian.

### Writing frontmatter (YAML only)

```typescript
await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
  frontmatter['fsrs-due'] = '2026-05-20T08:00:00.000Z';
  frontmatter['fsrs-state'] = 2;
  // ...
});
```

This modifies only the YAML block. Everything after `---` is left unchanged.

## FSRS engine configuration

The FSRS instance is created with standard defaults:

```typescript
const fsrs = new FSRS({
  request_retention: 0.9,
  maximum_interval: 36500,
});
```

These are currently hard-coded. If settings are added later, they'd be passed through from `scheduler.ts` -> `computeNextState()`.

## Build pipeline

```
TypeScript source (src/*.ts)
  -> tsc --noEmit --skipLibCheck (type checking only)
  -> esbuild (bundling)
    -> main.js (single CJS bundle, obsidian APIs externalized)
```

`esbuild.config.mjs` marks `obsidian`, `electron`, and `@codemirror/*` as external — Obsidian provides these at runtime.

## Compatibility

- **Desktop**: full support.
- **Mobile**: supported (no Node/Electron APIs used, no file system access beyond Obsidian abstractions).
- **Min App Version**: 0.15.0 (uses `processFrontMatter` API).
