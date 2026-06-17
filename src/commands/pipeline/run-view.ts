/**
 * Pipeline 命令 - 查看运行实例详情
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatPipelineRunDetail } from '../../formatters/table';
import { formatJson } from '../../formatters/json';
import {
  formatPipelineRunSummary,
  summarizePipelineRun,
} from '../../formatters/pipeline-run-summary';
import { withProgress } from '../../utils/progress';
import { ViewPipelineRunOptions } from '../../types/cli';

export function createRunViewCommand(): Command {
  return new Command('run-view')
    .description('View a pipeline run details')
    .argument('<pipelineId>', 'Pipeline ID')
    .argument('<runId>', 'Pipeline Run ID')
    .option('--json', 'Output as JSON')
    .option('--summary', 'Output a concise run summary without verbose params/results')
    .action(async (pipelineId: string, runId: string, options: ViewPipelineRunOptions) => {
      try {
        await viewRun(pipelineId, runId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to view pipeline run:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function viewRun(
  pipelineId: string,
  runId: string,
  options: ViewPipelineRunOptions
): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching pipeline run ${pipelineId}#${runId}...`);

  const run = await withProgress(
    `Fetching pipeline run...`,
    async () => {
      return client.getPipelineRun(pipelineId, runId);
    },
    { silent: options.json }
  );

  if (options.summary) {
    const summary = summarizePipelineRun(run);
    console.log(options.json ? formatJson(summary) : formatPipelineRunSummary(summary));
  } else if (options.json) {
    console.log(formatJson(run));
  } else {
    console.log(formatPipelineRunDetail(run));
  }
}
