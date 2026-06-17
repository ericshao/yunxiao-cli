/**
 * Workitem 命令 - 列表查看
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { configManager } from '../../utils/config';
import { formatWorkitemTable } from '../../formatters/table';
import { formatWorkitemJson } from '../../formatters/json';
import { formatWorkitemCSV } from '../../formatters/csv';
import { formatWorkitemMarkdown } from '../../formatters/markdown';
import { withProgress } from '../../utils/progress';
import { ListWorkitemOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('List workitems')
    .option('-s, --status <status>', 'Filter by status')
    .option('-a, --assigned-to <user>', 'Filter by assignee (@me for current user)')
    .option('-t, --type <type>', 'Filter by workitem type')
    .option('-l, --labels <labels...>', 'Filter by labels')
    .option('--sprint <sprint>', 'Filter by sprint')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '20')
    .option('-o, --output <format>', 'Output format (table|json|csv|markdown)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (options: ListWorkitemOptions) => {
      try {
        await listWorkitems(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list workitems:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listWorkitems(options: ListWorkitemOptions): Promise<void> {
  const client = await getAuthenticatedClient();
  const defaults = configManager.getDefaults();

  // 验证参数
  const page = parseInt(options.page?.toString() || '1');
  const perPage = parseInt(options.perPage?.toString() || '20');

  if (!isValidPage(page)) {
    logger.error('Invalid page number');
    process.exit(1);
  }

  if (!isValidPerPage(perPage)) {
    logger.error('Invalid per-page value (must be 1-100)');
    process.exit(1);
  }

  // 获取项目 ID
  const projectId = defaults.project_id;
  if (!projectId) {
    logger.error('No default project configured');
    logger.info('Set default project with: yunxiao config set defaults.project_id <project-id>');
    process.exit(1);
  }

  logger.verbose(`Fetching workitems from project ${projectId}...`);

  // 构建过滤条件
  const conditions: any[] = [];

  if (options.status) {
    conditions.push({
      fieldIdentifier: 'status',
      operator: 'EQUALS',
      value: [options.status],
      className: 'string',
      format: 'single',
    });
  }

  if (options.assignedTo) {
    const assigneeValue =
      options.assignedTo === '@me' ? defaults.organization_id : options.assignedTo;
    conditions.push({
      fieldIdentifier: 'assignedTo',
      operator: 'EQUALS',
      value: [assigneeValue],
      className: 'string',
      format: 'single',
    });
  }

  if (options.type) {
    conditions.push({
      fieldIdentifier: 'workitemType',
      operator: 'EQUALS',
      value: [options.type],
      className: 'string',
      format: 'single',
    });
  }

  // 查询工作项
  const response = await withProgress('Fetching workitems...', async () => {
    return client.searchWorkitems({
      spaceId: projectId,
      category: 'Req,Task,Bug,Defect',
      page,
      perPage,
      conditions:
        conditions.length > 0 ? JSON.stringify({ conditionGroups: [conditions] }) : undefined,
    });
  });

  if (response.data.length === 0) {
    logger.info('No workitems found');
    return;
  }

  // 输出格式化
  const outputFormat = options.json ? 'json' : options.output || 'table';

  switch (outputFormat) {
    case 'json':
      console.log(formatWorkitemJson(response.data));
      break;
    case 'csv':
      console.log(formatWorkitemCSV(response.data));
      break;
    case 'markdown':
      console.log(formatWorkitemMarkdown(response.data));
      break;
    default:
      console.log(formatWorkitemTable(response.data));
  }

  // 分页信息
  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} workitems (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (response.pagination.hasNextPage) {
    logger.info(`\nTo see more, run: yunxiao workitem list --page=${page + 1}`);
  }
}
