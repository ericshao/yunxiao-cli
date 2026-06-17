/**
 * Pipeline 命令 - 列出运行实例
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineRunTable } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ListPipelineRunsOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createRunsCommand(): Command {
  return new Command('runs')
    .description('List pipeline runs')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('-s, --status <status>', 'Filter by status (SUCCESS|RUNNING|FAIL)')
    .option(
      '-t, --trigger-mode <mode>',
      'Filter by trigger mode (1=manual,2=timer,3=push,5=pipeline,6=webhook)'
    )
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '10')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (pipelineId: string, options: ListPipelineRunsOptions) => {
      try {
        await listRuns(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list pipeline runs:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listRuns(pipelineId: string, options: ListPipelineRunsOptions): Promise<void> {
  const client = await getAuthenticatedClient();

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

  logger.verbose(`Fetching runs for pipeline ${pipelineId}...`);

  const outputFormat = options.json ? 'json' : options.output || 'table';

  const response = await withProgress(
    'Fetching pipeline runs...',
    async () => {
      return client.listPipelineRuns({
        pipelineId,
        page,
        perPage,
        status: options.status,
        triggerMode: options.triggerMode ? parseInt(options.triggerMode) : undefined,
      });
    },
    { silent: outputFormat === 'json' }
  );

  if (response.data.length === 0) {
    if (outputFormat === 'json') {
      console.log(formatJson([]));
      return;
    }

    logger.info('No pipeline runs found');
    return;
  }

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(response.data));
      break;
    default:
      console.log(formatPipelineRunTable(response.data));
  }

  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} runs (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (outputFormat === 'table' && response.pagination.hasNextPage) {
    logger.info(`\nTo see more, run: yunxiao pipeline runs ${pipelineId} --page=${page + 1}`);
  }
}
