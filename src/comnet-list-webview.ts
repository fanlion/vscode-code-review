/**
 * 评审列表webview
 */
import { ExtensionContext, WebviewPanel, window, ViewColumn, Uri } from 'vscode';
import * as fs from 'fs';
import { CommentListService } from './coment-list-service';
import { ApplicationItem, ProjectItem } from './interfaces';

// 插件进程与webview通信的
enum WebViewCommands {
  PG_SEND_PROJECT_LIST = 'PLUGIN_SEND_PROJECT_LIST', // 插件进程发送项目列表
  WV_SEND_REFRESH_PROJECT_LIST = 'WV_SEND_REFRESH_PROJECT_LIST', // webview要求刷新项目列表
}

interface Message {
  command: WebViewCommands;
  message: any;
}

export class CommentListWebview {
  // 用于展示评论列表的pane
  private panel: WebviewPanel | null = null;

  // 定时器
  private interval: NodeJS.Timer | null = null;

  // 项目列表数据
  private projectList: ProjectItem[] = [];

  // 当前选中的工程
  // @ts-ignore
  private selectedProject: ProjectItem | null;

  // 当前选中的应用
  // @ts-ignore
  private selectedApplication: ApplicationItem | null;

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

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.interval = setInterval(this.updateWebView, 1000);
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

  // 定时更新webview
  private updateWebView = () => {
    if (!this.panel) {
      return;
    }
    this.panel.webview.html = this.getWebviewContent();
  };

  getWebviewContent(): string {
    const uri = Uri.joinPath(this.context.extensionUri, 'dist', 'comment-list-webview.html');
    const pathUri = uri.with({ scheme: 'vscode-resource' });
    const projectOptions = this.projectList.reduce((acc, cur) => {
      return `${acc} <option value=${cur.projectKey}>${cur.projectName}</option>`;
    }, '');

    return fs.readFileSync(pathUri.fsPath, 'utf8').replace('PROJECT_LIST_STRING', projectOptions);
  }

  /**
   * 查看评审意见列表
   */
  async fetchProject(listServices: CommentListService) {
    try {
      const panel = this.showPanel('评审意见列表');
      const result = await listServices.fetchList();
      this.projectList = result;

      // webview发送消息来的时候
      panel.webview.onDidReceiveMessage(
        (message: Message) => {
          console.log('========>comment list webview receive message', message);
        },
        undefined,
        this.context.subscriptions,
      );

      // panel卸载的时候
      panel.onDidDispose(() => {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      });

      // 把项目列表发送给webview
      const msg: Message = { command: WebViewCommands.PG_SEND_PROJECT_LIST, message: result };
      panel.webview.postMessage(msg);
    } catch (err) {
      window.showErrorMessage('获取项目列表失败');
    }
  }
}
