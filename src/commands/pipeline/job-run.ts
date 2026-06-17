/**
 * Pipeline 命令 - 手动运行流水线任务
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { formatJson } from '../../formatters/json';
import { ExecutePipelineJobRunOptions } from '../../types/cli';

export function createJobRunCommand(): Command {
  return new Command('job-run')
    .description('Manually run a pipeline job')
    .argument('<pipelineId>', 'Pipeline ID')
    .argument('<runId>', 'Pipeline Run ID')
    .argument('<jobId>', 'Job ID')
    .option('--json', 'Output as JSON')
    .action(
      async (
        pipelineId: string,
        runId: string,
        jobId: string,
        options: ExecutePipelineJobRunOptions
      ) => {
        try {
          await runJob(pipelineId, runId, jobId, options);
        } catch (error) {
          if (error instanceof Error) {
            logger.error('Failed to run pipeline job:', error.message);
            logger.debug(error.stack || '');
          }
          process.exit(1);
        }
      }
    );
}

async function runJob(
  pipelineId: string,
  runId: string,
  jobId: string,
  options: ExecutePipelineJobRunOptions
): Promise<void> {
  const client = await getAuthenticatedClient();

  logger.verbose(`Running pipeline job ${pipelineId}#${runId}#${jobId}...`);

  const success = await withProgress(
    'Running pipeline job...',
    async () => {
      return client.executePipelineJobRun(pipelineId, runId, jobId);
    },
    { silent: options.json }
  );

  const result = {
    pipelineId,
    pipelineRunId: runId,
    jobId,
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
    logger.error('Pipeline job run request was rejected');
    process.exit(1);
  }

  logger.info(chalk.green('Pipeline job started successfully!'));
  logger.info(`Pipeline ID: ${chalk.cyan(pipelineId)}`);
  logger.info(`Run ID: ${chalk.cyan(runId)}`);
  logger.info(`Job ID: ${chalk.cyan(jobId)}`);
  logger.info(
    `\nView job log: ${chalk.cyan(`yunxiao pipeline job-log ${pipelineId} ${runId} ${jobId}`)}`
  );
}
