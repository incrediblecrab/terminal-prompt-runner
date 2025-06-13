# Terminal Prompt Runner - VS Code Extension

## Project Overview
A VS Code extension that allows users to create, manage, and run text prompts in the VS Code terminal. Provides a dedicated tree view for organizing and executing terminal commands with a user-friendly interface.

## Technology Stack
- TypeScript
- VS Code Extension API
- Tree Data Provider
- Terminal integration
- Custom prompt editor

## Architecture
- `src/extension.ts` - Main extension entry point and command registration
- `src/promptProvider.ts` - Tree view provider for managing terminal prompts
- `src/promptEditor.ts` - Custom editor for creating and editing prompts
- `src/types.ts` - Type definitions for prompt data structures

## Key Features
- Create and manage terminal prompts with custom names
- Tree view interface for prompt organization
- Direct execution of prompts in VS Code terminal
- In-line editing capabilities
- Persistent storage of prompts
- Quick access toolbar actions

## Development Commands
- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch for changes and recompile
- `npm run lint` - Run ESLint with TypeScript support
- `npm run test` - Run tests
- `npm run vscode:prepublish` - Prepare for publishing

## User Interface
The extension adds a "Terminal Prompts" view to the VS Code Explorer with:
- Tree view showing all saved prompts
- Toolbar buttons for adding prompts and refreshing
- Context menu options for editing, deleting, and running prompts
- Welcome message when no prompts are saved

## Commands
- `terminalPromptRunner.addPrompt` - Add new terminal prompt
- `terminalPromptRunner.editPrompt` - Edit existing prompt
- `terminalPromptRunner.deletePrompt` - Delete selected prompt
- `terminalPromptRunner.runPrompt` - Execute prompt in terminal
- `terminalPromptRunner.refresh` - Refresh the prompt list

## Testing
The project includes a `TESTING.md` file with testing documentation and procedures.

## Usage
1. Open the "Terminal Prompts" view in VS Code Explorer
2. Click "Add Prompt" to create a new terminal command
3. Enter a name and command text for your prompt
4. Use the play button to execute prompts in the terminal
5. Edit or delete prompts using the context menu options