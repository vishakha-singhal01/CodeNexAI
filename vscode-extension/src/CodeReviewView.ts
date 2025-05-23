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
    if (element) {
      // If the element is a commit, get the changed files
      const commitHash = element.label.split(' ')[0];
      return new Promise((resolve, reject) => {
        const command = `git diff --name-status ${commitHash}`;
        const exec = require('child_process').exec;
        exec(command, { cwd: vscode.workspace.rootPath }, (err: any, stdout: string, stderr: string) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }

          const files = stdout.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
              const [status, filePath] = line.split('\t');
              return new CodeReviewItem(
                `${status} ${filePath}`,
                vscode.TreeItemCollapsibleState.None,
                {
                  command: 'codenexai.analyzeCode',
                  title: 'Analyze Code',
                  arguments: [vscode.Uri.file(vscode.workspace.rootPath + '/' + filePath)]
                }
              );
            });
          resolve(files);
        });
      });
    } else {
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
              const commitHash = line.split(' ')[0];
              return new CodeReviewItem(
                line,
                vscode.TreeItemCollapsibleState.Collapsed
              );
            });
          resolve(commits);
        });
      });
    }
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
