/**
 * Pipeline 命令 - 列出分组下的流水线
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineGroupPipelineTable } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ListPipelineGroupPipelinesOptions } from '../../types/cli';
import { isValidPage, isValidPerPage } from '../../utils/validators';

export function createGroupPipelinesCommand(): Command {
  return new Command('group-pipelines')
    .description('List pipelines in a group')
    .argument('<groupId>', 'Pipeline group ID')
    .option('-n, --name <name>', 'Filter by pipeline name')
    .option('-s, --status <status>', 'Filter by status (SUCCESS,RUNNING,FAIL,CANCELED,WAITING)')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '10')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (groupId: string, options: ListPipelineGroupPipelinesOptions) => {
      try {
        await listGroupPipelines(groupId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list group pipelines:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listGroupPipelines(
  groupId: string,
  options: ListPipelineGroupPipelinesOptions
): Promise<void> {
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

  logger.verbose(`Fetching pipelines for group ${groupId}...`);

  const response = await withProgress('Fetching group pipelines...', async () => {
    return client.listPipelineGroupPipelines({
      groupId: parseInt(groupId),
      pipelineName: options.name,
      statusList: options.status,
      page,
      perPage,
    });
  });

  if (response.data.length === 0) {
    logger.info('No pipelines found in this group');
    return;
  }

  const outputFormat = options.json ? 'json' : options.output || 'table';

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(response.data));
      break;
    default:
      console.log(formatPipelineGroupPipelineTable(response.data));
  }

  logger.verbose(
    `Showing ${response.data.length} of ${response.pagination.total} pipelines (page ${response.pagination.page}/${response.pagination.totalPages})`
  );

  if (response.pagination.hasNextPage) {
    logger.info(
      `\nTo see more, run: yunxiao pipeline group-pipelines ${groupId} --page=${page + 1}`
    );
  }
}
