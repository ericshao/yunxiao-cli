/**
 * Pipeline 命令 - 列出流水线分组
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineGroupTable } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ListPipelineGroupsOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createGroupListCommand(): Command {
  return new Command('group-list')
    .description('List pipeline groups')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '10')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (options: ListPipelineGroupsOptions) => {
      try {
        await listGroups(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list pipeline groups:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listGroups(options: ListPipelineGroupsOptions): Promise<void> {
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

  logger.verbose('Fetching pipeline groups...');

  const outputFormat = options.json ? 'json' : options.output || 'table';

  const response = await withProgress(
    'Fetching pipeline groups...',
    async () => {
      return client.listPipelineGroups({ page, perPage });
    },
    { silent: outputFormat === 'json' }
  );

  if (response.data.length === 0) {
    if (outputFormat === 'json') {
      console.log(formatJson([]));
      return;
    }

    logger.info('No pipeline groups found');
    return;
  }

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(response.data));
      break;
    default:
      console.log(formatPipelineGroupTable(response.data));
  }

  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} groups (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (outputFormat === 'table' && response.pagination.hasNextPage) {
    logger.info(`\nTo see more, run: yunxiao pipeline group-list --page=${page + 1}`);
  }
}
