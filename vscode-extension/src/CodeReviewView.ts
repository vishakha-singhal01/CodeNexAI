import * as vscode from 'vscode';
import { ESLint } from 'eslint';

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

  async getChildren(element?: CodeReviewItem): Promise<CodeReviewItem[]> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return [];
    }

    const document = editor.document;
    const text = document.getText();

    const eslint = new ESLint();
    const results = await eslint.lintText(text);

    const codeReviewItems: CodeReviewItem[] = [];
    for (const result of results) {
      for (const message of result.messages) {
        const item = new CodeReviewItem(
          `${message.ruleId}: ${message.message} (${message.line}:${message.column})`,
          vscode.TreeItemCollapsibleState.None,
          {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [document.uri, { selection: new vscode.Range(message.line - 1, message.column - 1, message.line - 1, message.column) }]
          }
        );
        codeReviewItems.push(item);
      }
    }

    return codeReviewItems;
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
