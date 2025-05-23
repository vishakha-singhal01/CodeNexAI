import * as vscode from 'vscode';
import * as path from 'path';
import axios, { AxiosInstance } from 'axios';
import MarkdownIt from 'markdown-it';

const apiClient: AxiosInstance = axios.create();

// --- Code Analysis Function ---
async function analyzeCode(code: string, reviewInstructions: string, filePath: string): Promise<{ message: string; line: number }[]> {
    const issues: { message: string; line: number }[] = [];

    // Detect console.log statements
    const consoleLogRegex = /console\.log\((.*)\);/g;
    let match;
    while ((match = consoleLogRegex.exec(code)) !== null) {
        issues.push({ message: 'Remove console.log statement', line: code.substring(0, match.index).split('\n').length });
    }

    // Detect TODO comments
    const todoRegex = /TODO:(.*)/g;
    while ((match = todoRegex.exec(code)) !== null) {
        issues.push({ message: 'Address TODO comment', line: code.substring(0, match.index).split('\n').length });
    }

    // Detect eval statements
    const evalRegex = /eval\((.*)\)/g;
    while ((match = evalRegex.exec(code)) !== null) {
        issues.push({ message: 'Remove eval statement (potential security vulnerability)', line: code.substring(0, match.index).split('\n').length });
    }

    // Check for missing unit tests
    if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts') && !filePath.endsWith('.test.ts')) {
        const testFilePath = filePath.replace('.ts', '.test.ts');
        try {
            const exists = await vscode.workspace.fs.stat(vscode.Uri.file(testFilePath));
        } catch (e) {
            issues.push({ message: 'Missing unit test file', line: 1 });
        }
    }

    return issues;
}

// --- Diff Analysis Function ---
async function analyzeDiff(diffContent: string, reviewInstructions: string): Promise<{ message: string; line: number }[]> {
    const issues: { message: string; line: number }[] = [];

    // Detect console.log statements
    const consoleLogRegex = /console\.log\((.*)\);/g;
    let match;
    while ((match = consoleLogRegex.exec(diffContent)) !== null) {
        issues.push({ message: 'Remove console.log statement', line: diffContent.substring(0, match.index).split('\n').length });
    }

    // Detect TODO comments
    const todoRegex = /TODO:(.*)/g;
    while ((match = todoRegex.exec(diffContent)) !== null) {
        issues.push({ message: 'Address TODO comment', line: diffContent.substring(0, match.index).split('\n').length });
    }

    // Detect eval statements
    const evalRegex = /eval\((.*)\)/g;
    while ((match = evalRegex.exec(diffContent)) !== null) {
        issues.push({ message: 'Remove eval statement (potential security vulnerability)', line: diffContent.substring(0, match.index).split('\n').length });
    }

    return issues;
}

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
    } catch (error) {
        await context.secrets.delete('codenexai.email');
        await context.secrets.delete('codenexai.password');
        vscode.window.showErrorMessage('CodenexAI: Your session has expired. Please log in again.');
        await vscode.commands.executeCommand('codenexai.login');
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
                vscode.window.showErrorMessage('CodenexAI: Login failed. Invalid credentials.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`CodenexAI: Login failed. ${error}`);
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

    // --- Code Review Command ---
    const codeReviewCommand = vscode.commands.registerCommand('codenexai.codeReview', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('CodenexAI: No active text editor found.');
            return;
        }

        const document = editor.document;
        const filePath = document.fileName;
        const code = document.getText();
        const reviewInstructions = vscode.workspace.getConfiguration('codenexai').get<string>('reviewInstructions') || '';

        console.log('Review instructions:', reviewInstructions);

        const issues = await analyzeCode(code, reviewInstructions, filePath);

        // Execute ESLint
        const { exec } = require('child_process');
        const eslintPath = path.join(vscode.workspace.rootPath || '', 'node_modules', '.bin', 'eslint');
        exec(`"${eslintPath}" "${filePath}"`, { cwd: vscode.workspace.rootPath }, async (err: any, stdout: string, stderr: string) => {
            if (err) {
                console.error(err);
                vscode.window.showErrorMessage(`CodenexAI: Code review failed. ${stderr}`);
                return;
            }

            // Display ESLint results in a webview panel
            const panel = vscode.window.createWebviewPanel(
                'codenexaiCodeReview',
                'CodenexAI Code Review',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Generate HTML for the issues with line numbers
            let issuesHtml = '<ul style="list-style-type: none; padding-left: 0;">';
            issues.forEach(issue => {
                issuesHtml += `<li style="margin-bottom: 0.5rem;">Line ${issue.line}: ${issue.message}</li>`;
            });
            issuesHtml += '</ul>';

            // Construct the HTML content for the webview panel
            panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodenexAI Code Review</title>
            </head>
            <body>
                <h1>Code Review Issues</h1>
                ${issuesHtml}
                <h2>ESLint Output</h2>
                <pre>${stdout}</pre>
            </body>
            </html>`;
        });
    });
    context.subscriptions.push(codeReviewCommand);

    // --- Review Diff Command ---
    const reviewDiffCommand = vscode.commands.registerCommand('codenexai.reviewDiff', async () => {
        const diffFilePath = await vscode.window.showInputBox({ prompt: 'Enter the path to the .diff file' });

        if (!diffFilePath) {
            vscode.window.showErrorMessage('CodenexAI: Diff file path is required.');
            return;
        }

        try {
            const diffUri = vscode.Uri.file(diffFilePath);
            const diffContent = (await vscode.workspace.fs.readFile(diffUri)).toString();

            // Analyze the diff content
            const reviewInstructions = vscode.workspace.getConfiguration('codenexai').get<string>('reviewInstructions') || '';
            console.log('Review instructions:', reviewInstructions);

            const issues = await analyzeDiff(diffContent, reviewInstructions);

            // Display the results in a webview panel
            const panel = vscode.window.createWebviewPanel(
                'codenexaiDiffReview',
                'CodenexAI Diff Review',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            const issuesHtml = issues.map((issue: { message: string; line: number }) => `<li>${issue.message} (Line: ${issue.line})</li>`).join('');

            panel.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodenexAI Diff Review</title>
            </head>
            <body>
                <h1>Diff Review Issues</h1>
                <ul>${issuesHtml}</ul>
                <h2>Diff Content</h2>
                <pre>${diffContent}</pre>
            </body>
            </html>`;

        } catch (error: any) {
            vscode.window.showErrorMessage(`CodenexAI: Failed to review diff. ${error}`);
        }
    });
    context.subscriptions.push(reviewDiffCommand);

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
            try {
                const response = await apiClient.post(GENERATE_DOCS_URL, {
                    code: selectedText,
                    email,
                    password
                });

                if (response.status === 200 && response.data.documentation) {
                    const markdownContent = response.data.documentation;
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

                    panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodenexAI Documentation</title>
    <style>
        body {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        pre {
            background-color: #f6f8fa;
            padding: 16px;
            overflow: auto;
            border-radius: 6px;
        }
        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 85%;
        }
        pre code {
            font-size: 100%;
        }
        blockquote {
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            padding: 0 1em;
        }
        table {
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
                } else {
                    vscode.window.showErrorMessage(`CodenexAI: Failed to generate documentation. Status: ${response.status}`);
                }
            } catch (error: any) {
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
}

// --- Deactivate Function ---
export function deactivate() {
    console.log('CodenexAI extension deactivated.');
}
