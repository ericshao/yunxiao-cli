/**
 * Pipeline 命令 - 详情查看
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineDetail } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import { withProgress } from '../../utils/progress';
import { ViewPipelineOptions } from '../../types/cli';

export function createViewCommand(): Command {
  return new Command('view')
    .description('View pipeline details')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('--json', 'Output as JSON')
    .action(async (pipelineId: string, options: ViewPipelineOptions) => {
      try {
        await viewPipeline(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to view pipeline:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function viewPipeline(pipelineId: string, options: ViewPipelineOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching pipeline ${pipelineId}...`);

  const pipeline = await withProgress(`Fetching pipeline ${pipelineId}...`, async () => {
    return client.getPipeline(pipelineId);
  });

  // 输出格式化
  if (options.json) {
    console.log(formatJson(pipeline));
  } else {
    console.log(formatPipelineDetail(pipeline));
  }
}
