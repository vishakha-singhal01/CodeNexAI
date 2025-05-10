import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios'; // Using AxiosInstance for potential cookie jar setup
import MarkdownIt from 'markdown-it';

// It's good practice to use a more robust cookie solution for production.
// For example, using axios-cookiejar-support and tough-cookie:
// import { CookieJar } from 'tough-cookie';
// import { wrapper } from 'axios-cookiejar-support';
// const jar = new CookieJar();
// const apiClient: AxiosInstance = wrapper(axios.create({ jar }));
// For this example, we'll use a simpler approach and rely on withCredentials if server supports it,
// or a manual cookie string for demonstration if not. A proper cookie jar is recommended.
const apiClient: AxiosInstance = axios.create();

const API_BASE_URL = 'https://code-whisper-docs.onrender.com';
const LOGIN_URL = `${API_BASE_URL}/api/auth/login`;
const GENERATE_DOCS_URL = `${API_BASE_URL}/api/generate-docs`;

// Store session state (e.g., a session cookie string or a flag)
// This is a simplified way to manage session state for the example.
// In a real extension, you might store an actual session token or rely on the cookie jar.
let activeSessionCookie: string | null = null;


async function ensureLoggedIn(context: vscode.ExtensionContext): Promise<boolean> {
    // If we think we have an active session cookie, try to use it.
    // A more robust check would be to have a /api/auth/current_user endpoint
    // to verify the session is still valid before proceeding.
    if (activeSessionCookie) {
        return true;
    }

    let email = await context.secrets.get('codenexai.email');
    let password = await context.secrets.get('codenexai.password');

    if (!email) {
        email = await vscode.window.showInputBox({
            prompt: 'Enter your CodenexAI email',
            ignoreFocusOut: true
        });
        if (!email) {
            vscode.window.showErrorMessage('CodenexAI: Email is required to log in.');
            return false;
        }
        await context.secrets.store('codenexai.email', email);
    }

    if (!password) {
        password = await vscode.window.showInputBox({
            prompt: 'Enter your CodenexAI password',
            password: true,
            ignoreFocusOut: true
        });
        if (!password) {
            vscode.window.showErrorMessage('CodenexAI: Password is required to log in.');
            return false;
        }
        await context.secrets.store('codenexai.password', password);
    }

    try {
        vscode.window.showInformationMessage('CodenexAI: Attempting to log in...');
        const response = await apiClient.post(LOGIN_URL, { email, password }, {
            // For session cookies to work across sites (like from VS Code to your server),
            // your server needs to set cookies with SameSite=None; Secure=true
            // and have proper CORS headers (Access-Control-Allow-Credentials: true).
            // `withCredentials: true` tells axios to send cookies from the browser context if applicable,
            // but for Node.js based extensions, manual cookie handling or a cookie jar is often needed.
            // If your server sets HttpOnly cookies, they won't be accessible via document.cookie in a browser
            // but should be handled by the HTTP client if it supports cookie jars.
        });

        if (response.status === 200 && response.data.user) {
            // Attempt to capture the session cookie(s)
            // This is a common but potentially fragile way if multiple cookies are set.
            // A proper cookie jar (like tough-cookie with axios-cookiejar-support) is more reliable.
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader && Array.isArray(setCookieHeader)) {
                activeSessionCookie = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
            } else if (typeof setCookieHeader === 'string') {
                activeSessionCookie = (setCookieHeader as string).split(';')[0]; // Explicit type assertion
            }

            if (!activeSessionCookie) {
                // This might happen if the server doesn't send a cookie or it's not captured.
                // Or if the cookie is HttpOnly and not meant to be accessed by client script
                // (though the HTTP client should still send it on subsequent requests if using a jar).
                vscode.window.showWarningMessage('CodenexAI: Login seemed successful, but session cookie was not captured. Subsequent requests might fail. Ensure your server sets cookies correctly for cross-origin requests if needed.');
                // For now, we'll assume login was successful if status is 200 and user data is present.
                // The real test is if the next authenticated request works.
            }

            vscode.window.showInformationMessage(`CodenexAI: Logged in as ${response.data.user.displayName || response.data.user.email}!`);
            return true;
        } else {
            vscode.window.showErrorMessage(`CodenexAI Login Failed: ${response.data.message || 'Unknown login error.'}`);
            activeSessionCookie = null;
            return false;
        }
    } catch (error: unknown) {
        activeSessionCookie = null;
        if (axios.isAxiosError(error) && error.response) {
            vscode.window.showErrorMessage(`CodenexAI Login Failed: ${error.response.data?.message || error.response.statusText}`);
        } else if (error instanceof Error) {
            vscode.window.showErrorMessage(`CodenexAI Login Failed: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('CodenexAI Login Failed: An unknown error occurred.');
        }
        // Optionally clear stored credentials on persistent failure after a few tries
        // await context.secrets.delete('codenexai.email');
        // await context.secrets.delete('codenexai.password');
        return false;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('CodenexAI extension is now active!');

    const disposable = vscode.commands.registerCommand('codenexai.generateDocumentation', async () => {
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
            return; // Stop if login fails or is cancelled
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodenexAI: Generating documentation...",
            cancellable: false
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            try {
                const headers: Record<string, string> = {};
                if (activeSessionCookie) {
                    headers['Cookie'] = activeSessionCookie;
                }

                const response = await apiClient.post(GENERATE_DOCS_URL,
                    { code: selectedText },
                    { headers }
                );

                if (response.status === 200 && response.data.documentation) {
                    const markdownContent = response.data.documentation;
                    const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });
                    const htmlContent = mdParser.render(markdownContent);

                    const panel = vscode.window.createWebviewPanel(
                        'codenexaiDocumentation', // Identifies the type of the webview. Used internally
                        'CodenexAI Documentation', // Title of the panel displayed to the user
                        vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
                        {
                            enableScripts: true, // Enable JavaScript in the webview
                            // Optionally, restrict the webview to only loading content from your extension's directory.
                            // localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
                        }
                    );

                    // Basic HTML structure with some styling
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
                            /* Add more styles as needed, or link to a stylesheet */
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
                    if (error.response.status === 401) {
                        vscode.window.showErrorMessage('CodenexAI: Authentication failed or session expired. Please try again to re-login.');
                        activeSessionCookie = null;
                        // Optionally clear stored credentials
                        // await context.secrets.delete('codenexai.email');
                        // await context.secrets.delete('codenexai.password');
                    } else {
                        vscode.window.showErrorMessage(`CodenexAI Error: ${error.response.data?.error || error.response.data?.message || error.response.statusText}`);
                    }
                } else if (error instanceof Error) {
                    vscode.window.showErrorMessage(`CodenexAI Network Error: ${error.message}`);
                } else {
                    vscode.window.showErrorMessage('CodenexAI: An unknown error occurred while generating documentation.');
                }
            }
        });
    });

    context.subscriptions.push(disposable);

    // Command to clear stored credentials (for testing/logout)
    const clearCredentialsCommand = vscode.commands.registerCommand('codenexai.clearCredentials', async () => {
        await context.secrets.delete('codenexai.email');
        await context.secrets.delete('codenexai.password');
        activeSessionCookie = null;
        vscode.window.showInformationMessage('CodenexAI: Stored credentials and session cleared.');
    });
    context.subscriptions.push(clearCredentialsCommand);
}

export function deactivate() {
    // Clean up resources if needed
    activeSessionCookie = null;
    console.log('CodenexAI extension deactivated.');
}
