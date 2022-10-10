/**
 * 评审列表webview
 */
import { ExtensionContext, WebviewPanel, window, ViewColumn, Uri } from 'vscode';
import * as fs from 'fs';
import { CommentListService } from './coment-list-service';

export class CommentListWebview {
  // 用于展示评论列表的pane
  private panel: WebviewPanel | null = null;

  constructor(public context: ExtensionContext) {}

  /**
   * 展示webview
   * @param title webview标题
   * @returns WebviewPanel
   */
  private showPanel(title: string): WebviewPanel {
    this.panel?.dispose(); // 销毁已存在的panel, 避免重复
    this.panel = this.createWebView(title);
    this.panel.webview.html = this.getWebviewContent();
    return this.panel;
  }

  private createWebView(title: string): WebviewPanel {
    return window.createWebviewPanel(
      'text',
      title,
      { viewColumn: ViewColumn.Beside },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
  }

  getWebviewContent(): string {
    const uri = Uri.joinPath(this.context.extensionUri, 'dist', 'comment-list-webview.html');
    const pathUri = uri.with({ scheme: 'vscode-resource' });
    return fs.readFileSync(pathUri.fsPath, 'utf8');
  }

  /**
   * 查看评审意见列表
   */
  fetchProject(listServices: CommentListService) {
    const panel = this.showPanel('评审意见列表');
    listServices.fetchList();

    panel.webview.onDidReceiveMessage((message) => {
      console.log('========>comment list webview receive message', message);
    });
  }
}
