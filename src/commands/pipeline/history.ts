/**
 * Pipeline 命令 - 查看任务执行历史
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineJobHistoryTable } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { PipelineHistoryOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createHistoryCommand(): Command {
  return new Command('history')
    .description('View pipeline job execution history')
    .argument('<pipelineId>', 'Pipeline ID')
    .requiredOption('--category <category>', 'Job category (e.g., DEPLOY)')
    .requiredOption('--identifier <identifier>', 'Job identifier')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '10')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (pipelineId: string, options: PipelineHistoryOptions) => {
      try {
        await listHistory(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list pipeline job history:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listHistory(pipelineId: string, options: PipelineHistoryOptions): Promise<void> {
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

  logger.verbose(`Fetching job history for pipeline ${pipelineId}...`);

  const response = await withProgress('Fetching pipeline job history...', async () => {
    return client.listPipelineJobHistorys({
      pipelineId,
      category: options.category!,
      identifier: options.identifier!,
      page,
      perPage,
    });
  });

  if (response.data.length === 0) {
    logger.info('No job history found');
    return;
  }

  // 输出格式化
  const outputFormat = options.json ? 'json' : options.output || 'table';

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(response.data));
      break;
    default:
      console.log(formatPipelineJobHistoryTable(response.data));
  }

  // 分页信息
  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} records (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (response.pagination.hasNextPage) {
    logger.info(
      `\nTo see more, run: yunxiao pipeline history ${pipelineId} --category ${options.category} --identifier ${options.identifier} --page=${page + 1}`
    );
  }
}
