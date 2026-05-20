# obsidian-note-reviewer — agent guide

## Project overview

- Plugin: `obsidian-note-reviewer` (Note Reviewer) — an Obsidian plugin applying FSRS spaced repetition to whole Markdown notes.
- Core concept: no UI, no IDs, no external storage. The plugin provides 4 rating commands. State is stored losslessly in each note's YAML frontmatter. The user navigates their vault with Obsidian's built-in tools and rates whatever note is open.
- Entry point: `src/main.ts` compiled to `main.js`.

## Environment and tooling

- **Runtime: Bun** — all scripts, installs, and builds use `bun`.
- **Bundler: esbuild** — configured in `esbuild.config.mjs`.
- **TypeScript** — `tsconfig.json` uses `moduleResolution: "bundler"`.

### Install

```bash
bun install
```

### Dev (watch)

```bash
bun run dev
```

### Production build

```bash
bun run build
```

## Architecture

```text
src/
  main.ts           # Plugin lifecycle, 4 command registrations
  scheduler.ts      # rateNote(): read frontmatter -> invoke FSRS -> write back
  fsrs-engine.ts    # computeNextState(): wraps the fsrs.js library
  types.ts          # FsrsFrontMatter interface, FsrsRating/FsrsState enums
```

### Plugin principle

The plugin does exactly one thing: compute the next FSRS state for the active file and write it to frontmatter. Everything else — file navigation, frontmatter visualization, sorting — is the user's domain via Obsidian's built-in tools.

### scheduler.ts

- `rateNote(file, rating)`: reads `cache.frontmatter`, builds a `Partial<FsrsFrontMatter>`, passes it to `computeNextState()`, then calls `app.fileManager.processFrontMatter()` to write back the `fsrs-*` fields.
- On first rating (no existing fsrs fields), defaults are used (state=New, stability=0, difficulty=0) and the full state is injected into YAML.
- Body content is never modified.

### fsrs-engine.ts

- `computeNextState(current, rating)`: instantiates `FSRS` from `fsrs.js`, constructs a `Card`, calls `fsrs.repeat()`, returns the resulting `FsrsFrontMatter`.

### types.ts

- `FsrsState` enum: New=0, Learning=1, Review=2, Relearning=3.
- `FsrsRating` enum: Again=1, Hard=2, Good=3, Easy=4.
- `FsrsFrontMatter` interface: `fsrs-due`, `fsrs-state`, `fsrs-stability`, `fsrs-difficulty`, `fsrs-last-review`, `fsrs-scheduled-days`, `fsrs-elapsed-days`, `fsrs-reps`, `fsrs-lapses`.

## Commands

| ID           | Name            | Behavior                  |
| ------------ | --------------- | ------------------------- |
| `rate-again` | Rate: Again (1) | Rate active file as Again |
| `rate-hard`  | Rate: Hard (2)  | Rate active file as Hard  |
| `rate-good`  | Rate: Good (3)  | Rate active file as Good  |
| `rate-easy`  | Rate: Easy (4)  | Rate active file as Easy  |

No other commands. No ribbon icon. No settings tab. No custom views.

## File and folder conventions

- Source lives in `src/`. Keep `main.ts` small (command registration only).
- Do not commit build artifacts (`main.js`, `node_modules/`).
- Release artifacts: `main.js`, `manifest.json`, `styles.css` at plugin root.

## Build and release

- `bun run build` — type-checks then bundles to `main.js`.
- `manifest.json` id: `obsidian-note-reviewer`.

### Version bump and release routine

1. Update `version` in `package.json` (e.g. `1.0.0` -> `1.1.0`).
2. Run `bun run version` — this bumps `manifest.json` and `versions.json` automatically. Check `versions.json` gets the new entry; the script skips adding it if `minAppVersion` hasn't changed, so add it manually when needed.
3. Run `bun run build` to produce fresh `main.js`.
4. Commit (`git add` all changed source + manifest + package + versions), push.
5. Tag without `v` prefix: `git tag 1.1.0`, push `--tags`.
6. Create release: `gh release create 1.1.0 main.js manifest.json styles.css --title "1.1.0"`.

## Coding conventions

- Strict TypeScript. No `any` unless interacting with Obsidian's untyped APIs.
- Error handling: `rateNote` skips if no active file. Malformed frontmatter values are caught via type guards (`typeof x === 'string'`).
- No network calls. No telemetry. Fully offline.

### Do

- Keep command IDs stable.
- Use `app.fileManager.processFrontMatter` for all YAML mutations.
- Read state exclusively from `app.metadataCache` (no disk reads).
- Use 2-space indentation.

### Don't

- Add UI components, modals, views, or ribbon icons.
- Modify file body content.
- Introduce settings or configuration without a concrete user need.
- Add a queue system or scheduler — FSRS computes state, it doesn't order notes.
