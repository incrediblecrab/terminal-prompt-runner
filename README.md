# terminal-prompt-runner

![Version](https://img.shields.io/visual-studio-marketplace/v/maxs-lab-of-things.terminal-prompt-runner) ![MLoT](https://img.shields.io/badge/MLoT-ai-blue)

Terminal Prompt Runner is a VS Code extension for saving named terminal command prompts and running them from an Explorer view. It is published on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=maxs-lab-of-things.terminal-prompt-runner) as `maxs-lab-of-things.terminal-prompt-runner`; the published version is 1.5.1, matching this repository.

![Demo](https://raw.githubusercontent.com/incrediblecrab/mlot-developer-media/main/gifs/terminal-prompt-runner.gif)

**Objective:** keep repeatable terminal command sequences close to the workspace and run them without retyping multi-line prompts.

**Inputs:** VS Code 1.74.0 or later. Prompts are stored in VS Code workspace state and run in a VS Code terminal whose current working directory is the first workspace folder when one is open.

**Files:**

- [`src/`](src/): the TypeScript extension source, prompt tree provider, prompt editor webview and types
- [`package.json`](package.json): extension metadata, commands, view contributions and npm scripts
- [`TESTING.md`](TESTING.md): testing notes
- [`CHANGELOG.md`](CHANGELOG.md): release history
- [`icon.png`](icon.png): Marketplace icon
- [`tsconfig.json`](tsconfig.json): TypeScript compiler settings

**Try it:** install the published build with `ext install maxs-lab-of-things.terminal-prompt-runner`. For local development, run `npm install`, then `npm run compile`, and launch the extension host from VS Code.

## Usage

Open the "Terminal Prompts" view in Explorer. Use the toolbar to add a prompt or refresh the view.

A prompt has a name, one or more command lines and an optional next prompt. The tree sorts prompts by most recently updated. If a prompt chains to another prompt, the tree label shows the next prompt's name.

Run a prompt from its inline play action. The extension opens a VS Code terminal, sends each nonblank line with `sendText` and waits briefly between lines. When a prompt has a chain target, the extension waits two seconds and then sends the next prompt's commands to the same terminal; it does not inspect the shell exit status before chaining.

Use the inline edit and delete actions to manage saved prompts. Prompt names must be unique case-insensitively, and prompt content cannot be empty.

## Commands

| Command | Title | Where it appears |
| --- | --- | --- |
| `terminalPromptRunner.addPrompt` | Add Prompt | Terminal Prompts view title |
| `terminalPromptRunner.refresh` | Refresh | Terminal Prompts view title |
| `terminalPromptRunner.editPrompt` | Edit Prompt | Prompt inline menu |
| `terminalPromptRunner.deletePrompt` | Delete Prompt | Prompt inline menu |
| `terminalPromptRunner.runPrompt` | Run Prompt | Prompt inline menu |

## Settings

Terminal Prompt Runner does not contribute VS Code settings.

## Development

- `npm run compile`: compile TypeScript with `tsc -p ./`
- `npm run watch`: compile in watch mode
- `npm run lint`: run ESLint on `src`
- `npm run test`: run the VS Code extension test runner from `out/test/runTest.js`

Do not publish from this repository unless the package metadata and Marketplace release are intentionally being updated. This package does not define `package` or `publish` npm scripts.

## Links

- [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=maxs-lab-of-things.terminal-prompt-runner)
- [Demo video](https://youtu.be/AxriOnDiGhk)
- [MLoT product page](https://mlot.ai/terminal-prompt-runner/)
- [Privacy policy](https://mlot.ai/privacy/)
- Publisher: [Max's Lab of Things](https://mlot.ai/)

## License

MIT. See [`LICENSE`](LICENSE).
