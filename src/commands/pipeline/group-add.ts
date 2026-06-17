/**
 * Pipeline 命令 - 将流水线加入流水线分组
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { formatJson } from '../../formatters/json';
import { AddToPipelineGroupOptions } from '../../types/cli';

export function createGroupAddCommand(): Command {
  return new Command('group-add')
    .description('Add pipelines to a pipeline group')
    .argument('<groupId>', 'Pipeline group ID, use 0 for ungrouped')
    .argument('<pipelineIds...>', 'Pipeline IDs')
    .option('--json', 'Output as JSON')
    .action(async (groupId: string, pipelineIds: string[], options: AddToPipelineGroupOptions) => {
      try {
        await addToGroup(groupId, pipelineIds, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to add pipelines to group:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function addToGroup(
  groupId: string,
  pipelineIds: string[],
  options: AddToPipelineGroupOptions
): Promise<void> {
  const parsedGroupId = parseInt(groupId, 10);
  if (Number.isNaN(parsedGroupId) || parsedGroupId < 0) {
    logger.error('Invalid group ID');
    process.exit(1);
  }

  const normalizedPipelineIds = pipelineIds.flatMap((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );

  if (normalizedPipelineIds.length === 0) {
    logger.error('At least one pipeline ID is required');
    process.exit(1);
  }

  const client = await getAuthenticatedClient();
  const pipelineIdsParam = normalizedPipelineIds.join(',');

  logger.verbose(`Adding pipelines ${pipelineIdsParam} to group ${parsedGroupId}...`);

  const success = await withProgress(
    'Adding pipelines to group...',
    async () => {
      return client.addToPipelineGroup({
        groupId: parsedGroupId,
        pipelineIds: pipelineIdsParam,
      });
    },
    { silent: options.json }
  );

  const result = {
    groupId: parsedGroupId,
    pipelineIds: normalizedPipelineIds,
    success,
  };

  if (options.json) {
    console.log(formatJson(result));
    if (!success) {
      process.exit(1);
    }
    return;
  }

  if (!success) {
    logger.error('Add to pipeline group request was rejected');
    process.exit(1);
  }

  logger.info(chalk.green('Pipelines added to group successfully!'));
  logger.info(`Group ID: ${chalk.cyan(parsedGroupId.toString())}`);
  logger.info(`Pipeline IDs: ${chalk.cyan(normalizedPipelineIds.join(', '))}`);
}
