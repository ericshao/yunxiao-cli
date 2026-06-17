/**
 * Pipeline 命令 - 运行流水线
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { RunPipelineOptions } from '../../types/cli';
import chalk from 'chalk';

export function createRunCommand(): Command {
  return new Command('run')
    .description('Run a pipeline')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('-b, --branch <branch>', 'Running branch (repo_url:branch format)')
    .option('-e, --envs <envs>', 'Environment variables (key=value,key2=value2)')
    .option('--comment <comment>', 'Run comment')
    .option('--params <params>', 'Raw JSON params string (overrides other options)')
    .action(async (pipelineId: string, options: RunPipelineOptions) => {
      try {
        await runPipeline(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to run pipeline:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function runPipeline(pipelineId: string, options: RunPipelineOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  // 构建 params
  let paramsStr: string | undefined;

  if (options.params) {
    // 直接使用原始 JSON 参数
    paramsStr = options.params;
  } else {
    const paramsObj: Record<string, unknown> = {};

    if (options.branch) {
      // 格式: repo_url:branch
      const parts = options.branch.split(':');
      if (parts.length >= 2) {
        const branch = parts.pop()!;
        const repo = parts.join(':');
        paramsObj.runningBranchs = { [repo]: branch };
      }
    }

    if (options.envs) {
      const envs: Record<string, string> = {};
      options.envs.split(',').forEach((pair) => {
        const [key, ...valueParts] = pair.split('=');
        if (key && valueParts.length > 0) {
          envs[key.trim()] = valueParts.join('=').trim();
        }
      });
      if (Object.keys(envs).length > 0) {
        paramsObj.envs = envs;
      }
    }

    if (options.comment) {
      paramsObj.comment = options.comment;
    }

    if (Object.keys(paramsObj).length > 0) {
      paramsStr = JSON.stringify(paramsObj);
    }
  }

  logger.verbose(`Running pipeline ${pipelineId}...`);

  const runId = await withProgress('Running pipeline...', async () => {
    return client.createPipelineRun(pipelineId, paramsStr ? { params: paramsStr } : undefined);
  });

  logger.info(chalk.green(`Pipeline ${pipelineId} started successfully!`));
  logger.info(`Run ID: ${chalk.cyan(runId.toString())}`);
  logger.info(
    `\nView run details: ${chalk.cyan(`yunxiao pipeline run-view ${pipelineId} ${runId}`)}`
  );
  logger.info(`View latest run: ${chalk.cyan(`yunxiao pipeline run-latest ${pipelineId}`)}`);
}
