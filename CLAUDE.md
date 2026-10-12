# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and GitHub Copilot CLI when working in this repository.

Terminal Prompt Runner is a VS Code extension that saves named multi-line shell snippets in a "Terminal Prompts" Explorer view and runs them in an integrated terminal, optionally chaining one prompt into another. It is published on the Marketplace as `maxs-lab-of-things.terminal-prompt-runner`. The repository is public.

## Commands

```bash
npm run compile      # tsc -p ./ -> out/
npm run watch
npx vsce package     # read the printed file list before publishing
```

Run the extension with F5 from VS Code; `TESTING.md` is the manual test procedure. There are no automated tests: `npm test` runs `npm run lint` first, which fails because the repository has no ESLint config, and `out/test/runTest.js` does not exist either.

## Structure

`src/promptProvider.ts` is the tree data provider and the only owner of state: prompts are an array of `Prompt` (`src/types.ts`) in `workspaceState` under `prompts`, so they are per workspace. `src/promptEditor.ts` is the webview form for adding and editing a prompt (name, content, optional `chainNext`). `runPromptChain` in `src/extension.ts` opens a terminal in the first workspace folder, sends each non-empty line with `sendText` 100 ms apart, and, if `chainNext` is set, waits a fixed 2 seconds and runs the next prompt in the same terminal. Despite the "on success" wording in the type comment and the UI, nothing checks exit status; chaining is purely time-based.

## Releasing

`.vscodeignore` is the only control over what ships in the `.vsix`; `.gitignore` is ignored by `vsce`. `TESTING.md` is excluded by its managed block, which a standardizing script rewrites, so add project-specific exclusions outside that block. The README states the Marketplace version, so bump it with `package.json` and `CHANGELOG.md`. The publishing procedure is in `../README.md`.
