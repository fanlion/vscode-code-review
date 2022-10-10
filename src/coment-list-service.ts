/**
 * 评论列表service
 */
import request from './utils/request';
import { ProjectItem } from './interfaces';

export class CommentListService {
  constructor(private workspaceRoot: string) {}

  async fetchList() {
    const url = '/user_operate/queryUserBindedProjects?userId=huangrw2';
    return request.get<any, ProjectItem[]>(url);
  }
}
