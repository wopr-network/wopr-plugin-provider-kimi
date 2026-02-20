# wopr-plugin-provider-kimi

Kimi (Moonshot AI) provider plugin for WOPR. Auto-installs Python dependencies at runtime.

## Commands

```bash
npm run build     # tsc
npm run check     # biome check index.ts logger.ts + tsc --noEmit (run before committing)
npm run format    # biome format --write index.ts logger.ts
npm test          # vitest run
```

## Key Details

- **Runtime requirement**: Python 3.12+ must be available on the host
- Auto-installs `kimi-cli` via `uv` on first run (handled by `install-deps.mjs`)
- Implements `WOPRPlugin` from `@wopr-network/plugin-types`
- Uses OAuth (not API key) — `kimi auth login` is the setup step
- **Gotcha**: If Python 3.12+ is not available, the plugin will fail to initialize with a clear error — don't try to work around it, just surface the requirement to the user

## Plugin Contract

Imports only from `@wopr-network/plugin-types`. Never import from `@wopr-network/wopr` core.

## Issue Tracking

All issues in **Linear** (team: WOPR). Issue descriptions start with `**Repo:** wopr-network/wopr-plugin-provider-kimi`.

## Session Memory

At the start of every WOPR session, **read `~/.wopr-memory.md` if it exists.** It contains recent session context: which repos were active, what branches are in flight, and how many uncommitted changes exist. Use it to orient quickly without re-investigating.

The `Stop` hook writes to this file automatically at session end. Only non-main branches are recorded — if everything is on `main`, nothing is written for that repo.