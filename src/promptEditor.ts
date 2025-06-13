import * as vscode from 'vscode';
import { Prompt } from './types';

export class PromptEditor {
    public static currentPanel: PromptEditor | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
        prompt?: Prompt,
        onSave?: (name: string, content: string, chainNext?: string) => void,
        availablePrompts?: Prompt[]
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (PromptEditor.currentPanel) {
            PromptEditor.currentPanel._panel.reveal(column);
            PromptEditor.currentPanel._update(prompt, onSave, availablePrompts);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'promptEditor',
            prompt ? `Edit: ${prompt.name}` : 'New Prompt',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        PromptEditor.currentPanel = new PromptEditor(panel, extensionUri, prompt, onSave, availablePrompts);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        prompt?: Prompt,
        onSave?: (name: string, content: string, chainNext?: string) => void,
        availablePrompts?: Prompt[]
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update(prompt, onSave, availablePrompts);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        PromptEditor.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update(prompt?: Prompt, onSave?: (name: string, content: string, chainNext?: string) => void, availablePrompts?: Prompt[]) {
        const webview = this._panel.webview;
        this._panel.title = prompt ? `Edit: ${prompt.name}` : 'New Prompt';
        this._panel.webview.html = this._getHtmlForWebview(webview, prompt, availablePrompts);

        webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'save':
                        if (onSave) {
                            try {
                                onSave(message.name, message.content, message.chainNext);
                                this.dispose();
                            } catch (error) {
                                // Keep editor open on error - the onSave callback will show error message
                            }
                        } else {
                            this.dispose();
                        }
                        return;
                    case 'cancel':
                        this.dispose();
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview, prompt?: Prompt, availablePrompts?: Prompt[]) {

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Prompt Editor</title>
                <style>
                    body {
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        font-family: var(--vscode-font-family);
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: bold;
                    }
                    input, textarea, select {
                        width: 100%;
                        padding: 8px;
                        border: 1px solid var(--vscode-input-border);
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        font-family: var(--vscode-font-family);
                        box-sizing: border-box;
                    }
                    textarea {
                        min-height: 300px;
                        resize: vertical;
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                    }
                    .button-group {
                        display: flex;
                        gap: 10px;
                        margin-top: 20px;
                    }
                    button {
                        padding: 8px 16px;
                        border: none;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    .primary {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                    }
                    .primary:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    .secondary {
                        background-color: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                    }
                    .secondary:hover {
                        background-color: var(--vscode-button-secondaryHoverBackground);
                    }
                    .info {
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: var(--vscode-textBlockQuote-background);
                        border-left: 3px solid var(--vscode-textLink-foreground);
                    }
                </style>
            </head>
            <body>
                <div class="info">
                    Enter your terminal commands below. Each line will be executed sequentially in the terminal. Commands will run in the current workspace directory.
                </div>
                <div class="form-group">
                    <label for="name">Prompt Name:</label>
                    <input type="text" id="name" value="${prompt?.name || ''}" placeholder="Enter prompt name">
                </div>
                <div class="form-group">
                    <label for="content">Commands:</label>
                    <textarea id="content" placeholder="Enter commands (one per line)">${prompt?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="chainNext">Chain to (run on success):</label>
                    <select id="chainNext">
                        <option value="">None (don't chain)</option>
                        ${(availablePrompts || [])
                            .filter(p => p.id !== prompt?.id) // Don't allow chaining to self
                            .map(p => `<option value="${p.id}" ${prompt?.chainNext === p.id ? 'selected' : ''}>${p.name}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="button-group">
                    <button class="primary" onclick="save()">Save</button>
                    <button class="secondary" onclick="cancel()">Cancel</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function save() {
                        const name = document.getElementById('name').value.trim();
                        const content = document.getElementById('content').value.trim();
                        const chainNext = document.getElementById('chainNext').value || undefined;
                        
                        if (!name) {
                            alert('Please enter a prompt name');
                            return;
                        }
                        
                        if (!content) {
                            alert('Please enter at least one command');
                            return;
                        }
                        
                        vscode.postMessage({
                            command: 'save',
                            name: name,
                            content: content,
                            chainNext: chainNext
                        });
                    }

                    function cancel() {
                        vscode.postMessage({
                            command: 'cancel'
                        });
                    }
                </script>
            </body>
            </html>`;
    }
}