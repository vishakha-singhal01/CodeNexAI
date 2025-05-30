import * as vscode from 'vscode';
import { CodeSearchResult } from './types';
import axios, { AxiosInstance } from 'axios';
import MarkdownIt from 'markdown-it';
// import markdownItGitHub from 'markdown-it-github-flavored-markdown';

const apiClient: AxiosInstance = axios.create();

const API_BASE_URL = 'https://code-whisper-docs.onrender.com';
const GENERATE_DOCS_URL = `${API_BASE_URL}/api/generate-docs`;

// --- Refactored ensureLoggedIn ---
async function ensureLoggedIn(context: vscode.ExtensionContext): Promise<boolean> {
    const email = await context.secrets.get('codenexai.email');
    const password = await context.secrets.get('codenexai.password');

    if (!email || !password) {
        const action = await vscode.window.showWarningMessage(
            'CodenexAI: You are not logged in. Please log in to use this feature.',
            'Login',
            'Cancel'
        );
        if (action === 'Login') {
            await vscode.commands.executeCommand('codenexai.login');
        }
        return false;
    }

    try {
        const response = await apiClient.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        if (response.status === 200) {
            return true;
        } else {
            await context.secrets.delete('codenexai.email');
            await context.secrets.delete('codenexai.password');
            vscode.window.showErrorMessage('CodenexAI: Invalid credentials. Please log in again.');
            await vscode.commands.executeCommand('codenexai.login');
            return false;
        }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText || "Server error " + error.response.status}`);
            } else if (error instanceof Error) {
                vscode.window.showErrorMessage(`CodenexAI Network Error: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('CodenexAI: An unknown error occurred while generating documentation.');
            }
            return false;
        }
    }

// --- Activate Function ---
export function activate(context: vscode.ExtensionContext) {
    console.log('CodenexAI extension is now active!');

    // --- Login Command ---
    const loginCommand = vscode.commands.registerCommand('codenexai.login', async () => {
        const email = await vscode.window.showInputBox({ prompt: 'Enter your email' });
        if (!email) {
            vscode.window.showErrorMessage('Email is required.');
            return;
        }

        const password = await vscode.window.showInputBox({ prompt: 'Enter your password', password: true });
        if (!password) {
            vscode.window.showErrorMessage('Password is required.');
            return;
        }

        try {
            const response = await apiClient.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            if (response.status === 200) {
                await context.secrets.store('codenexai.email', email);
                await context.secrets.store('codenexai.password', password);
                vscode.window.showInformationMessage('CodenexAI: Successfully logged in!');
            } else {
            vscode.window.showErrorMessage(`CodenexAI: Login failed. Invalid credentials.`);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText || "Server error " + error.response.status}`);
            } else if (error instanceof Error) {
                vscode.window.showErrorMessage(`CodenexAI: Login failed. ${error.message}`);
            } else {
                vscode.window.showErrorMessage('CodenexAI: An unknown error occurred while generating documentation.');
            }
        }
    });
    context.subscriptions.push(loginCommand);

    // --- Logout Command ---
    const logoutCommand = vscode.commands.registerCommand('codenexai.logout', async () => {
        await context.secrets.delete('codenexai.email');
        await context.secrets.delete('codenexai.password');
        vscode.window.showInformationMessage('CodenexAI: Successfully logged out.');
    });
    context.subscriptions.push(logoutCommand);

    // --- Generate Documentation Command ---
    const generateDisposable = vscode.commands.registerCommand('codenexai.generateDocumentation', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('CodenexAI: No active text editor found.');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (selectedText.trim() === '') {
            vscode.window.showInformationMessage('CodenexAI: No text selected.');
            return;
        }

        // Prompt the user to select a document type
        const docType = await vscode.window.showQuickPick([
            'API Documentation',
            'Codebase Documentation',
            'Tutorials/Guides',
            'Conceptual Overviews',
            'Release Notes',
            'Troubleshooting Guide',
            'Integration Guide',
            'FAQ'
        ], {
            placeHolder: 'Select document type'
        });

        if (!docType) {
            vscode.window.showErrorMessage('CodenexAI: No document type selected.');
            return;
        }

        const email = await context.secrets.get('codenexai.email');
        const password = await context.secrets.get('codenexai.password');

        if (!email || !password) {
            vscode.window.showErrorMessage('CodenexAI: Email or password not found. Please log in.');
            await vscode.commands.executeCommand('codenexai.login');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodenexAI: Generating documentation...",
            cancellable: false
        }, async () => {
            try {const response = await apiClient.post(GENERATE_DOCS_URL, {
                    code: selectedText,
                    email,
                    password,
                    docType
                });

                if (response.status === 200 && response.data.documentation) {
                    // const markdownContent = response.data.documentation;
                    const markdownContent = `## Documentation for ${docType}:\n${response.data.documentation}`;
                    const mdParser = new MarkdownIt({
                        html: true,
                        linkify: true,
                        typographer: true
                    });
                    const htmlContent = mdParser.render(markdownContent);

                    const panel = vscode.window.createWebviewPanel(
                        'codenexaiDocumentation',
                        'CodenexAI Documentation',
                        vscode.ViewColumn.Beside,
                        { enableScripts: true }
                    );

                    // Use GitHub Markdown CSS
                    panel.webview.html = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>CodenexAI Documentation</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" integrity="sha512-LX/J+LuZrwAlL46OUv0JPLZwGh+AilYrf+vKsqrfY9WfwtarpC2F9+ePATNiSuYFkywOil56nuJWuP5JEWjSQg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                        <style>
                            .markdown-body {
                                box-sizing: border-box;
                                min-width: 200px;
                                max-width: 980px;
                                margin: 0 auto;
                                padding: 45px;
                            }
                        </style>
                    </head>
                    <body class="markdown-body">
                        ${htmlContent}
                    </body>
                    </html>`;
                } else {
                    vscode.window.showErrorMessage(`CodenexAI: Failed to generate documentation. Status: ${response.status}`);
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response) {
                    vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText || "Server error " + error.response.status}`);
                } else if (error instanceof Error) {
                    vscode.window.showErrorMessage(`CodenexAI Network Error: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage('CodenexAI: An unknown error occurred while generating documentation.');
                }
            }
        });
    });
    context.subscriptions.push(generateDisposable);

    // --- Smart Search Command ---
    const smartSearchCommand = vscode.commands.registerCommand('codenexai.smartSearch', async () => {
        const query = await vscode.window.showInputBox({ prompt: 'Enter your search query' });
        if (!query) {
            vscode.window.showErrorMessage('Search query is required.');
            return;
        }

        vscode.window.showInformationMessage(`CodenexAI: Searching for "${query}"...`);

        try {
            const response: { status: number; data: CodeSearchResult[] } = await apiClient.post(`${API_BASE_URL}/api/code-search`, { query });

            // Create an output channel to display the results
            const outputChannel = vscode.window.createOutputChannel('CodenexAI Search Results');
            outputChannel.clear();
            outputChannel.show(true);

            if (response.status === 200) {
                const results: CodeSearchResult[] = response.data;

                if (Array.isArray(results) && results.length > 0) {
                    results.forEach((result: CodeSearchResult) => {
                        outputChannel.appendLine(`${result.id}: ${result.content}`);
                    });
                } else {
                    console.log({aa: response.status})
                    console.log({aa: response.data})
                    outputChannel.appendLine('No results found.');
                }
            } else {
                vscode.window.showErrorMessage(`CodenexAI: Failed to search. Status: ${response.status}`);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText || "Server error " + error.response.status}`);
            } else if (error instanceof Error) {
                vscode.window.showErrorMessage(`CodenexAI: Search failed. ${error.message}`);
            } else {
                vscode.window.showErrorMessage(`CodenexAI: Search failed. ${error}`);
            }
        }
    });
    context.subscriptions.push(smartSearchCommand);
}

// --- Deactivate Function ---
export function deactivate() {
    console.log('CodenexAI extension deactivated.');
}
