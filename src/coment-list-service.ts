/**
 * 评论列表service
 */
import * as fs from 'fs';
import { window, workspace } from 'vscode';

export class CommentListService {
  constructor(private workspaceRoot: string) {}

  async fetchList() {
    console.log('============>这里获取评审列表');
  }
}
