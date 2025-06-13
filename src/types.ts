export interface Prompt {
    id: string;
    name: string;
    content: string;
    chainNext?: string; // ID of next prompt to run on success
    createdAt: number;
    updatedAt: number;
}