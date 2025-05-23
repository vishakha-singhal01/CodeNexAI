/// <reference types="vscode" />
import * as vscode from 'vscode';

export class CodeReviewProvider implements vscode.TreeDataProvider<CodeReviewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<CodeReviewItem | undefined | null | void> = new vscode.EventEmitter<CodeReviewItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<CodeReviewItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CodeReviewItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CodeReviewItem): Thenable<CodeReviewItem[]> {
    // Use git log --oneline to get the commit history with one-line descriptions
    return new Promise((resolve, reject) => {
      const command = 'git log --oneline';
      const exec = require('child_process').exec;
      exec(command, { cwd: vscode.workspace.rootPath }, (err: any, stdout: string, stderr: string) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }

        const commits = stdout.split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            return new CodeReviewItem(
              line,
              vscode.TreeItemCollapsibleState.None
            );
          });
        resolve(commits);
      });
    });
  }
}

export class CodeReviewItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  contextValue = 'codeReviewItem';
}
