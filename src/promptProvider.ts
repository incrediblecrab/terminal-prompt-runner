import * as vscode from 'vscode';
import { Prompt } from './types';

export class PromptProvider implements vscode.TreeDataProvider<Prompt> {
    private _onDidChangeTreeData: vscode.EventEmitter<Prompt | undefined | null | void> = new vscode.EventEmitter<Prompt | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Prompt | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private context: vscode.ExtensionContext
    ) {
        // Register disposable for cleanup
        context.subscriptions.push(this._onDidChangeTreeData);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Prompt): vscode.TreeItem {
        let displayName = element.name;
        if (element.chainNext) {
            const nextPrompt = this.getPromptsPrivate().find(p => p.id === element.chainNext);
            displayName += nextPrompt ? ` → ${nextPrompt.name}` : ' → [missing]';
        }
        
        const treeItem = new vscode.TreeItem(displayName, vscode.TreeItemCollapsibleState.None);
        treeItem.id = element.id;
        treeItem.tooltip = `Commands:\n${element.content}${element.chainNext ? `\n\nChains to: ${displayName.split(' → ')[1]}` : ''}`;
        treeItem.contextValue = 'prompt';
        treeItem.iconPath = element.chainNext ? new vscode.ThemeIcon('arrow-right') : new vscode.ThemeIcon('file-text');
        
        return treeItem;
    }

    getChildren(element?: Prompt): Thenable<Prompt[]> {
        if (!element) {
            return Promise.resolve(this.getPromptsPrivate());
        }
        return Promise.resolve([]);
    }

    private getPromptsPrivate(): Prompt[] {
        const prompts = this.context.workspaceState.get<Prompt[]>('prompts', []);
        return prompts.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    getPrompts(): Prompt[] {
        return this.getPromptsPrivate();
    }

    async addPrompt(name: string, content: string, chainNext?: string): Promise<void> {
        if (!name.trim()) {
            throw new Error('Prompt name cannot be empty');
        }
        if (!content.trim()) {
            throw new Error('Prompt content cannot be empty');
        }

        const prompts = this.context.workspaceState.get<Prompt[]>('prompts', []);
        
        // Check if name already exists
        if (prompts.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`A prompt with the name "${name}" already exists`);
        }

        const newPrompt: Prompt = {
            id: Date.now().toString(),
            name: name.trim(),
            content: content.trim(),
            chainNext: chainNext,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        prompts.push(newPrompt);
        await this.context.workspaceState.update('prompts', prompts);
        this.refresh();
    }

    async editPrompt(id: string, name: string, content: string, chainNext?: string): Promise<void> {
        if (!name.trim()) {
            throw new Error('Prompt name cannot be empty');
        }
        if (!content.trim()) {
            throw new Error('Prompt content cannot be empty');
        }

        const prompts = this.context.workspaceState.get<Prompt[]>('prompts', []);
        const index = prompts.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Prompt not found');
        }

        // Check if name already exists (excluding current prompt)
        if (prompts.some(p => p.id !== id && p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`A prompt with the name "${name}" already exists`);
        }

        prompts[index] = {
            ...prompts[index],
            name: name.trim(),
            content: content.trim(),
            chainNext: chainNext,
            updatedAt: Date.now()
        };
        await this.context.workspaceState.update('prompts', prompts);
        this.refresh();
    }

    async deletePrompt(id: string): Promise<void> {
        const prompts = this.context.workspaceState.get<Prompt[]>('prompts', []);
        const originalLength = prompts.length;
        const filtered = prompts.filter(p => p.id !== id);
        
        if (filtered.length === originalLength) {
            throw new Error('Prompt not found');
        }
        
        await this.context.workspaceState.update('prompts', filtered);
        this.refresh();
    }

    getPrompt(id: string): Prompt | undefined {
        const prompts = this.context.workspaceState.get<Prompt[]>('prompts', []);
        return prompts.find(p => p.id === id);
    }
}