/**
 * 列出评论命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { isValidWorkitemId } from '../../utils/validators';
import { formatDate } from '../../utils/date';
import { withProgress } from '../../utils/progress';
import { WorkitemComment } from '../../types/yunxiao';
import wrapAnsi from 'wrap-ansi';

interface ListCommentsOptions {
  json?: boolean;
}

export function createListCommand(): Command {
  const cmd = new Command('list');

  cmd
    .alias('ls')
    .description('List comments for a workitem')
    .argument('<workitem-id>', 'Workitem ID (e.g., PROJ-123)')
    .option('-j, --json', 'Output as JSON')
    .action(async (workitemId: string, options: ListCommentsOptions) => {
      try {
        // 验证工作项 ID
        if (!isValidWorkitemId(workitemId)) {
          throw new Error(
            `Invalid workitem ID format: ${workitemId}. Expected format: PROJECTCODE-NUMBER`
          );
        }

        const client = await getAuthenticatedClient();

        // 获取评论列表
        const comments = await withProgress(
          'Fetching comments...',
          async () => {
            return client.getWorkitemComments(workitemId);
          },
          { silent: options.json }
        );

        if (comments.length === 0) {
          if (options.json) {
            console.log(JSON.stringify([], null, 2));
            return;
          }

          logger.info(chalk.yellow('\nNo comments found.'));
          return;
        }

        // 输出格式
        if (options.json) {
          console.log(JSON.stringify(comments, null, 2));
        } else {
          // 表格格式
          const table = new Table({
            head: [
              chalk.cyan('ID'),
              chalk.cyan('User'),
              chalk.cyan('Content'),
              chalk.cyan('Created'),
              chalk.cyan('Top'),
            ],
            colWidths: [15, 15, 50, 20, 8],
            wordWrap: true,
          });

          // 构建评论树
          const commentMap = new Map<string, WorkitemComment>();
          const rootComments: WorkitemComment[] = [];

          comments.forEach((comment) => {
            commentMap.set(comment.id, comment);
            if (!comment.parentId) {
              rootComments.push(comment);
            }
          });

          // 递归添加评论及回复
          const addComment = (comment: WorkitemComment, indent = 0) => {
            const prefix = '  '.repeat(indent);
            const content = wrapAnsi(
              comment.content.length > 200
                ? comment.content.substring(0, 200) + '...'
                : comment.content,
              48
            );

            table.push([
              comment.id,
              `${prefix}${comment.user.name}`,
              content,
              formatDate(comment.gmtCreate),
              comment.top ? chalk.yellow('★') : '',
            ]);

            // 添加回复
            const replies = comments.filter((c) => c.parentId === comment.id);
            replies.forEach((reply) => addComment(reply, indent + 1));
          };

          // 添加所有根评论
          rootComments.forEach((comment) => addComment(comment));

          console.log(table.toString());
          logger.info(
            `\nTotal: ${chalk.cyan(comments.length)} comment(s), ${chalk.cyan(rootComments.length)} top-level`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error: ${error.message}`);
        } else {
          logger.error('An unknown error occurred');
        }
        process.exit(1);
      }
    });

  return cmd;
}
