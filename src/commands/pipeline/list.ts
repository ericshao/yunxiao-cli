/**
 * Pipeline 命令 - 列表查看
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineTable } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ListPipelineOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('List pipelines')
    .option('-n, --name <name>', 'Filter by pipeline name')
    .option('-s, --status <status>', 'Filter by status (SUCCESS,RUNNING,FAIL,CANCELED,WAITING)')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '10')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (options: ListPipelineOptions) => {
      try {
        await listPipelines(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list pipelines:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listPipelines(options: ListPipelineOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  // 验证参数
  const page = parseInt(options.page?.toString() || '1');
  const perPage = parseInt(options.perPage?.toString() || '10');

  if (!isValidPage(page)) {
    logger.error('Invalid page number');
    process.exit(1);
  }

  if (!isValidPerPage(perPage)) {
    logger.error('Invalid per-page value (must be 1-100)');
    process.exit(1);
  }

  logger.verbose('Fetching pipelines...');

  const outputFormat = options.json ? 'json' : options.output || 'table';

  // 查询流水线
  const response = await withProgress(
    'Fetching pipelines...',
    async () => {
      return client.listPipelines({
        pipelineName: options.name,
        statusList: options.status,
        page,
        perPage,
      });
    },
    { silent: outputFormat === 'json' }
  );

  if (response.data.length === 0) {
    if (outputFormat === 'json') {
      console.log(formatJson([]));
      return;
    }

    logger.info('No pipelines found');
    return;
  }

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(response.data));
      break;
    default:
      console.log(formatPipelineTable(response.data));
  }

  // 分页信息
  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} pipelines (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (outputFormat === 'table' && response.pagination.hasNextPage) {
    logger.info(`\nTo see more, run: yunxiao pipeline list --page=${page + 1}`);
  }
}
