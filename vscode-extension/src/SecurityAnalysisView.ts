import * as vscode from 'vscode';
import { analyzeCodeSecurity } from './extension';

export class SecurityAnalysisProvider implements vscode.TreeDataProvider<SecurityAnalysisItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SecurityAnalysisItem | undefined | null | void> = new vscode.EventEmitter<SecurityAnalysisItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SecurityAnalysisItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() { }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SecurityAnalysisItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SecurityAnalysisItem): Thenable<SecurityAnalysisItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const code = editor.document.getText(selection);
        if (code) {
          return analyzeCodeSecurity(code).then((analysis: string) => {
            return [
              new SecurityAnalysisItem(analysis, vscode.TreeItemCollapsibleState.None, { command: 'codenexai.generateDocumentation', title: 'Generate Documentation' })
            ];
          });
        } else {
          return Promise.resolve([new SecurityAnalysisItem("No code selected", vscode.TreeItemCollapsibleState.None)]);
        }
      } else {
        return Promise.resolve([new SecurityAnalysisItem("No active text editor", vscode.TreeItemCollapsibleState.None)]);
      }
    }
  }
}

export class SecurityAnalysisItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  contextValue = 'securityAnalysisItem';
}
