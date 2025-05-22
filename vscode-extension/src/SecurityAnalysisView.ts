import * as vscode from 'vscode';

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
          return vscode.commands.executeCommand<{ email?: string, password?: string }>('codenexai.getEmailAndPassword').then(credentials => {
            if (credentials && credentials.email && credentials.password) {
              return fetch('https://code-whisper-docs.onrender.com/api/analyze', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`
                },
                body: JSON.stringify({ code })
              })
              .then(response => response.json())
              .then((data: any) => {
                const analysis = data.result;
                return [
                  new SecurityAnalysisItem(analysis, vscode.TreeItemCollapsibleState.None, { command: 'codenexai.generateDocumentation', title: 'Generate Documentation' })
                ];
              });
            } else {
              vscode.window.showErrorMessage('CodenexAI: Email and password are required to perform security analysis.');
              return [new SecurityAnalysisItem("Email and password are required", vscode.TreeItemCollapsibleState.None)];
            }
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
