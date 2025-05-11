import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';
import MarkdownIt from 'markdown-it';

const apiClient: AxiosInstance = axios.create();

const API_BASE_URL = 'https://code-whisper-docs.onrender.com'; // Keep your API base URL
const GENERATE_DOCS_URL = `${API_BASE_URL}/api/generate-docs`;
// const LOGIN_URL = `${API_BASE_URL}/api/auth/login`; // No longer used by extension

// --- New Constants for Web Auth ---
const AUTH_TOKEN_KEY = 'codenexai.authToken';
const CODENEXAI_PUBLISHER_NAME = 'CodeNexAI';
const CODENEXAI_EXTENSION_NAME = 'codenexai-documentation';
// IMPORTANT: You need to create this page on your server.
const CODENEXAI_WEB_LOGIN_URL = 'https://codenexai.com/vscode-auth-start';
const CALLBACK_URI_PATH = '/auth-callback';
// --- End New Constants ---

// --- Auth Token Manager ---
class AuthTokenManager {
    static async getToken(context: vscode.ExtensionContext): Promise<string | undefined> {
        return await context.secrets.get(AUTH_TOKEN_KEY);
    }

    static async setToken(context: vscode.ExtensionContext, token: string): Promise<void> {
        await context.secrets.store(AUTH_TOKEN_KEY, token);
    }

    static async deleteToken(context: vscode.ExtensionContext): Promise<void> {
        await context.secrets.delete(AUTH_TOKEN_KEY);
    }
}
// --- End Auth Token Manager ---

// --- URI Handler for Auth Callback ---
class CodenexUriHandler implements vscode.UriHandler {
    constructor(private context: vscode.ExtensionContext) {}

    public async handleUri(uri: vscode.Uri): Promise<void> {
        if (uri.path === CALLBACK_URI_PATH) {
            try {
                const queryParams = new URLSearchParams(uri.query);
                const token = queryParams.get('token');

                if (token) {
                    await AuthTokenManager.setToken(this.context, token);
                    vscode.window.showInformationMessage('CodenexAI: Successfully logged in!');
                    // Optionally, trigger a command or refresh state here
                } else {
                    vscode.window.showErrorMessage('CodenexAI: Login callback received without a token.');
                }
            } catch (error) {
                console.error('Error handling URI callback:', error);
                vscode.window.showErrorMessage('CodenexAI: Error processing login callback.');
            }
        } else {
            vscode.window.showWarningMessage(`CodenexAI: Received unhandled URI: ${uri.toString()}`);
        }
    }
}
// --- End URI Handler ---

// --- Refactored ensureLoggedIn ---
async function ensureLoggedIn(context: vscode.ExtensionContext): Promise<boolean> {
    const token = await AuthTokenManager.getToken(context);

    if (!token) {
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

    // Optional: Add a quick API call here to verify the token with your backend.
    // If verification fails, delete the token and prompt for login again.
    // For example:
    // try {
    //     await apiClient.get(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    //     return true;
    // } catch (error) {
    //     await AuthTokenManager.deleteToken(context);
    //     vscode.window.showErrorMessage('CodenexAI: Your session has expired. Please log in again.');
    //     await vscode.commands.executeCommand('codenexai.login');
    //     return false;
    // }

    return true; // Assume token presence means logged in for now
}
// --- End Refactored ensureLoggedIn ---

export function activate(context: vscode.ExtensionContext) {
    console.log('CodenexAI extension is now active!');

    // Register URI Handler
    const uriHandler = new CodenexUriHandler(context);
    context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

    // --- New Login Command ---
    const loginCommand = vscode.commands.registerCommand('codenexai.login', async () => {
        const callbackUri = vscode.Uri.from({
            scheme: 'vscode',
            authority: `${CODENEXAI_PUBLISHER_NAME}.${CODENEXAI_EXTENSION_NAME}`,
            path: CALLBACK_URI_PATH
        }).toString(true); // true to skip encoding

        const loginUrl = `${CODENEXAI_WEB_LOGIN_URL}?redirect_uri=${encodeURIComponent(callbackUri)}`;
        vscode.window.showInformationMessage(`CodenexAI: Redirecting to login page: ${CODENEXAI_WEB_LOGIN_URL}`);
        await vscode.env.openExternal(vscode.Uri.parse(loginUrl));
    });
    context.subscriptions.push(loginCommand);
    // --- End New Login Command ---

    // --- New Logout Command ---
    const logoutCommand = vscode.commands.registerCommand('codenexai.logout', async () => {
        await AuthTokenManager.deleteToken(context);
        // Clear old email/password if they exist from previous auth method (optional, for cleanup)
        await context.secrets.delete('codenexai.email');
        await context.secrets.delete('codenexai.password');
        vscode.window.showInformationMessage('CodenexAI: Successfully logged out.');
    });
    context.subscriptions.push(logoutCommand);
    // --- End New Logout Command ---

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

        const isLoggedIn = await ensureLoggedIn(context);
        if (!isLoggedIn) {
            return; // Stop if login fails or is cancelled/redirected
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodenexAI: Generating documentation...",
            cancellable: false
        }, async () => {
            try {
                const token = await AuthTokenManager.getToken(context);
                if (!token) {
                    // This should ideally be caught by ensureLoggedIn, but as a safeguard:
                    vscode.window.showErrorMessage('CodenexAI: Authentication token not found. Please log in.');
                    await vscode.commands.executeCommand('codenexai.login');
                    return;
                }

                const headers: Record<string, string> = {
                    'Authorization': `Bearer ${token}`
                };

                const response = await apiClient.post(GENERATE_DOCS_URL,
                    { code: selectedText },
                    { headers }
                );

                if (response.status === 200 && response.data.documentation) {
                    const markdownContent = response.data.documentation;
                    const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });
                    const htmlContent = mdParser.render(markdownContent);

                    const panel = vscode.window.createWebviewPanel(
                        'codenexaiDocumentation',
                        'CodenexAI Documentation',
                        vscode.ViewColumn.Beside,
                        { enableScripts: true }
                    );

                    panel.webview.html = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>CodenexAI Documentation</title>
                        <style>
                            body { padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; }
                            h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
                            pre { background-color: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; }
                            code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 85%; }
                            pre code { font-size: 100%; }
                            blockquote { color: #6a737d; border-left: 0.25em solid #dfe2e5; padding: 0 1em; margin-left: 0; }
                            table { border-collapse: collapse; }
                            th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                    </html>`;

                } else {
                    vscode.window.showErrorMessage(`CodenexAI: Failed to generate documentation. Status: ${response.status}`);
                }

            } catch (error: unknown) {
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 401 || error.response.status === 403) {
                        vscode.window.showErrorMessage('CodenexAI: Authentication failed or session expired. Please log in again.');
                        await AuthTokenManager.deleteToken(context); // Clear potentially bad token
                        await vscode.commands.executeCommand('codenexai.login');
                    } else {
                        vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText || `Server error ${error.response.status}`}`);
                    }
                } else if (error instanceof Error) {
                    vscode.window.showErrorMessage(`CodenexAI Network Error: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage('CodenexAI: An unknown error occurred while generating documentation.');
                }
            }
        });
    });
    context.subscriptions.push(generateDisposable);

    // Remove or repurpose the old clearCredentials command if it exists
    // For example, if you had a 'codenexai.clearCredentials', you might remove its registration
    // or make it an alias for 'codenexai.logout'.
    // The new logout command already clears the token.
}

export function deactivate() {
    // Clean up resources if needed
    // activeSessionCookie is no longer used.
    console.log('CodenexAI extension deactivated.');
}
