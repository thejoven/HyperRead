# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript app (`main.tsx`, `electron-app.tsx`), feature folders: `app/`, `components/`, `contexts/`, `lib/`, `styles/`, `types/`.
- `electron/`: Electron main process and preload (`main.js`, `preload.js`).
- `public/`: Static assets bundled by Vite. `logo/` and `build/` hold app icons and electron-builder resources.
- Build outputs: `dist/` (Vite), `release/` (installers). Docs and examples live under `docs/`.

## Build, Test, and Development Commands
- `npm install` - install dependencies.
- `npm run dev` - start Vite dev server for the renderer only.
- `npm run dev:electron` - run Vite and Electron together for local development.
- `npm run start` - production build (`dist/`) then launch Electron.
- `npm run dist` - package app for current platform to `release/`.
- `npm run dist-all` - package macOS, Windows, Linux (requires host tooling).
- `npm run lint` - run ESLint; use `--fix` to auto-format.

## Coding Style & Naming Conventions
- Language: TypeScript + React, Tailwind CSS.
- Indentation: 2 spaces; avoid trailing whitespace; keep lines <= 120 chars.
- Components: PascalCase filenames and exports (e.g., `src/components/ReaderPane.tsx`).
- Hooks/utilities/types: kebab-case files (e.g., `src/lib/markdown-utils.ts`, `src/hooks/use-theme.ts`).
- Prefer functional components and hooks; keep components focused and presentational where possible.
- Linting: configured via `eslint.config.mjs` (Next/TS rules). Run `npm run lint -- --fix` before committing.

## Testing Guidelines
- No formal automated test suite yet. For changes, include a manual test plan in the PR (steps, expected results, platforms).
- If adding tests, prefer Vitest + React Testing Library; name files `*.test.ts(x)` colocated with sources.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Examples: `feat: add sidebar width resize`, `fix: correct drag-and-drop on macOS`.
- PRs should include: concise description, linked issues, screenshots/GIFs for UI changes, and manual test steps.
- Ensure `npm run dev:electron` works without errors and packaging via `npm run dist` succeeds locally.

## Security & Configuration Tips
- Do not commit secrets; prefer local env files (e.g., `.env.production`).
- Keep renderer sandboxed; add IPC only via `electron/preload.js` with `contextBridge`.
- Asset paths: reference via Vite (`public/`) or import; avoid absolute filesystem paths.
