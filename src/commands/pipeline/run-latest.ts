/**
 * Pipeline 命令 - 查看最近一次运行
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineRunDetail } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ViewPipelineRunOptions } from '../../types/cli';

export function createRunLatestCommand(): Command {
  return new Command('run-latest')
    .description('View the latest pipeline run')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('--json', 'Output as JSON')
    .action(async (pipelineId: string, options: ViewPipelineRunOptions) => {
      try {
        await viewLatestRun(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to get latest pipeline run:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function viewLatestRun(pipelineId: string, options: ViewPipelineRunOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching latest run for pipeline ${pipelineId}...`);

  const run = await withProgress('Fetching latest pipeline run...', async () => {
    return client.getLatestPipelineRun(pipelineId);
  });

  if (options.json) {
    console.log(formatJson(run));
  } else {
    console.log(formatPipelineRunDetail(run));
  }
}
