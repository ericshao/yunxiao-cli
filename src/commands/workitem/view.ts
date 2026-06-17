/**
 * Workitem 命令 - 详情查看
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatWorkitemDetail } from '../../formatters/table';
import { formatWorkitemJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ViewWorkitemOptions } from '../../types/cli';
import { isValidWorkitemId } from '../../utils/validators';

export function createViewCommand(): Command {
  return new Command('view')
    .description('View workitem details')
    .argument('<id>', 'Workitem ID (e.g., CLOD-1013)')
    .option('--json', 'Output as JSON')
    .option('--web', 'Open in web browser')
    .option('--comments', 'Include comments')
    .option('--activities', 'Include activities')
    .action(async (id: string, options: ViewWorkitemOptions) => {
      try {
        await viewWorkitem(id, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to view workitem:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function viewWorkitem(id: string, options: ViewWorkitemOptions): Promise<void> {
  // 验证工作项 ID
  if (!isValidWorkitemId(id)) {
    logger.error(`Invalid workitem ID: ${id}`);
    logger.info('Expected format: PROJECTCODE-NUMBER (e.g., CLOD-1013)');
    process.exit(1);
  }

  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching workitem ${id}...`);

  // 获取工作项详情
  const workitem = await withProgress(
    `Fetching workitem ${id}...`,
    async () => {
      return client.getWorkitem(id);
    },
    { silent: options.json }
  );

  // 输出格式化
  if (options.json) {
    console.log(formatWorkitemJson(workitem));
  } else {
    console.log(formatWorkitemDetail(workitem));
  }

  // 获取评论
  if (options.comments) {
    logger.verbose('Fetching comments...');
    const comments = await client.getWorkitemComments(id);

    if (comments.length > 0) {
      logger.section(`评论 (${comments.length})`);
      for (const comment of comments) {
        logger.item(comment.user.name, comment.content.substring(0, 100));
      }
    } else {
      logger.info('No comments');
    }
  }

  // 获取活动历史
  if (options.activities) {
    logger.verbose('Fetching activities...');
    const activities = await client.getWorkitemActivities(id);

    if (activities.length > 0) {
      logger.section(`活动历史 (${activities.length})`);
      for (const activity of activities.slice(0, 10)) {
        logger.item(activity.operator.name, activity.actionType);
      }
    } else {
      logger.info('No activities');
    }
  }

  // Web 浏览器打开
  if (options.web) {
    // TODO: 实现浏览器打开功能
    logger.warn('--web option not yet implemented');
  }
}
