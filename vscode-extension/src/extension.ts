/// <reference types="vscode" />
import * as vscode from 'vscode';
import { CodeReviewProvider } from './CodeReviewView';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodenexAI extension is now active!');

  // Register the code review view
  const codeReviewProvider = new CodeReviewProvider();
  vscode.window.registerTreeDataProvider('codeReview', codeReviewProvider);
  context.globalState.update('codeReviewProvider', codeReviewProvider);

  // Register command to show the code review view
  const showCodeReviewCommand = vscode.commands.registerCommand('codenexai.showCodeReview', () => {
    vscode.commands.executeCommand('workbench.view.extension.codenexai#codeReview');
  });
  context.subscriptions.push(showCodeReviewCommand);

  // --- Analyze Code Command ---
  const analyzeCodeCommand = vscode.commands.registerCommand('codenexai.analyzeCode', async () => {
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

    console.log('Selected code:', selectedText);
  });
  context.subscriptions.push(analyzeCodeCommand);
}

export function deactivate() {
  console.log('CodenexAI extension deactivated.');
}
