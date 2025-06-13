import * as vscode from 'vscode';
import { PromptProvider } from './promptProvider';
import { PromptEditor } from './promptEditor';
import { Prompt } from './types';

export function activate(context: vscode.ExtensionContext) {
    const promptProvider = new PromptProvider(context);
    
    const treeView = vscode.window.createTreeView('terminalPromptRunner', {
        treeDataProvider: promptProvider,
        showCollapseAll: false
    });
    
    context.subscriptions.push(treeView);

    context.subscriptions.push(
        vscode.commands.registerCommand('terminalPromptRunner.addPrompt', () => {
            try {
                const availablePrompts = promptProvider.getPrompts();
                PromptEditor.createOrShow(
                    context.extensionUri,
                    undefined,
                    async (name: string, content: string, chainNext?: string) => {
                        try {
                            await promptProvider.addPrompt(name, content, chainNext);
                            vscode.window.showInformationMessage(`Prompt "${name}" created successfully`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error creating prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    },
                    availablePrompts
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Error opening prompt editor: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('terminalPromptRunner.editPrompt', (prompt: Prompt) => {
            try {
                const availablePrompts = promptProvider.getPrompts();
                PromptEditor.createOrShow(
                    context.extensionUri,
                    prompt,
                    async (name: string, content: string, chainNext?: string) => {
                        try {
                            await promptProvider.editPrompt(prompt.id, name, content, chainNext);
                            vscode.window.showInformationMessage(`Prompt "${name}" updated successfully`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error updating prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    },
                    availablePrompts
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Error opening prompt editor: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('terminalPromptRunner.deletePrompt', async (prompt: Prompt) => {
            try {
                const answer = await vscode.window.showWarningMessage(
                    `Are you sure you want to delete "${prompt.name}"?`,
                    'Yes',
                    'No'
                );
                
                if (answer === 'Yes') {
                    await promptProvider.deletePrompt(prompt.id);
                    vscode.window.showInformationMessage(`Prompt "${prompt.name}" deleted`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error deleting prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        })
    );

    async function runPromptChain(prompt: Prompt, terminal?: vscode.Terminal, isChained: boolean = false): Promise<void> {
        const currentPrompt = promptProvider.getPrompt(prompt.id);
        if (!currentPrompt) {
            vscode.window.showErrorMessage('Prompt not found');
            return;
        }

        if (!currentPrompt.content.trim()) {
            vscode.window.showErrorMessage('Prompt has no commands to execute');
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : undefined;

        // Use existing terminal or create new one
        const activeTerminal = terminal || vscode.window.createTerminal({
            name: isChained ? `Chain: ${currentPrompt.name}` : `Run: ${currentPrompt.name}`,
            cwd: cwd
        });

        activeTerminal.show();

        const commands = currentPrompt.content.split('\n').filter(line => line.trim());
        
        if (commands.length === 0) {
            vscode.window.showErrorMessage('No valid commands found in prompt');
            return;
        }

        // Execute commands
        for (let i = 0; i < commands.length; i++) {
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const command = commands[i].trim();
            activeTerminal.sendText(command);
        }

        // Show status message
        const chainInfo = currentPrompt.chainNext ? ' (will chain on success)' : '';
        vscode.window.showInformationMessage(`${isChained ? 'Chained' : 'Running'} prompt: ${currentPrompt.name} (${commands.length} commands)${chainInfo}`);

        // Check for chaining if this prompt has a next prompt
        if (currentPrompt.chainNext) {
            // Wait for commands to complete, then run next prompt
            // This is a simple approach - assumes commands succeed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const nextPrompt = promptProvider.getPrompt(currentPrompt.chainNext);
            if (nextPrompt) {
                vscode.window.showInformationMessage(`Chaining to: ${nextPrompt.name}`);
                await runPromptChain(nextPrompt, activeTerminal, true);
            } else {
                vscode.window.showWarningMessage(`Chain target prompt not found: ${currentPrompt.chainNext}`);
            }
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('terminalPromptRunner.runPrompt', async (prompt: Prompt) => {
            try {
                await runPromptChain(prompt);
            } catch (error) {
                vscode.window.showErrorMessage(`Error running prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('terminalPromptRunner.refresh', () => {
            promptProvider.refresh();
        })
    );
}

export function deactivate() {}