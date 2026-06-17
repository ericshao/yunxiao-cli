/**
 * Pipeline 命令 - 查询流水线任务运行日志
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { formatJson } from '../../formatters/json';
import { ViewPipelineJobRunLogOptions } from '../../types/cli';

export function createJobLogCommand(): Command {
  return new Command('job-log')
    .description('View a pipeline job run log')
    .argument('<pipelineId>', 'Pipeline ID')
    .argument('<runId>', 'Pipeline Run ID')
    .argument('<jobId>', 'Job ID')
    .option('--json', 'Output as JSON')
    .action(
      async (
        pipelineId: string,
        runId: string,
        jobId: string,
        options: ViewPipelineJobRunLogOptions
      ) => {
        try {
          await viewJobLog(pipelineId, runId, jobId, options);
        } catch (error) {
          if (error instanceof Error) {
            logger.error('Failed to view pipeline job log:', error.message);
            logger.debug(error.stack || '');
          }
          process.exit(1);
        }
      }
    );
}

async function viewJobLog(
  pipelineId: string,
  runId: string,
  jobId: string,
  options: ViewPipelineJobRunLogOptions
): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Fetching pipeline job log ${pipelineId}#${runId}#${jobId}...`);

  const log = await withProgress(
    'Fetching pipeline job log...',
    async () => {
      return client.getPipelineJobRunLog(pipelineId, runId, jobId);
    },
    { silent: options.json }
  );

  if (options.json) {
    console.log(formatJson(log));
    return;
  }

  process.stdout.write(log.content || '');
  if (log.content && !log.content.endsWith('\n')) {
    process.stdout.write('\n');
  }

  if (log.more) {
    logger.info(
      chalk.yellow(
        `More log content is available after offset ${log.last}. Re-run later or use --json to inspect pagination metadata.`
      )
    );
  }
}
