/**
 * Pipeline 命令 - 查看流水线分组详情
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineGroupDetail } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { GlobalOptions } from '../../types/cli';

export function createGroupViewCommand(): Command {
  return new Command('group-view')
    .description('View pipeline group details')
    .argument('<groupId>', 'Pipeline group ID')
    .option('--json', 'Output as JSON')
    .action(async (groupId: string, options: GlobalOptions) => {
      try {
        await viewGroup(groupId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to view pipeline group:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function viewGroup(groupId: string, options: GlobalOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching pipeline group ${groupId}...`);

  const group = await withProgress(
    `Fetching pipeline group ${groupId}...`,
    async () => {
      return client.getPipelineGroup(groupId);
    },
    { silent: options.json }
  );

  if (options.json) {
    console.log(formatJson(group));
  } else {
    console.log(formatPipelineGroupDetail(group));
  }
}
