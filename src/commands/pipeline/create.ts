/**
 * Pipeline 命令 - 创建流水线
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { formatJson } from '../../formatters/json';
import { CreatePipelineOptions } from '../../types/cli';

const MAX_PIPELINE_NAME_LENGTH = 60;

export function createCreateCommand(): Command {
  return new Command('create')
    .description('Create a pipeline')
    .requiredOption('-n, --name <name>', 'Pipeline name (max 60 characters)')
    .option('-c, --content <content>', 'Pipeline YAML content')
    .option('-f, --file <file>', 'Read pipeline YAML content from file')
    .option('--json', 'Output as JSON')
    .action(async (options: CreatePipelineOptions) => {
      try {
        await createPipeline(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to create pipeline:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function createPipeline(options: CreatePipelineOptions): Promise<void> {
  const content = readPipelineContent(options);

  if (!content) {
    logger.error('Pipeline content is required (--content or --file)');
    process.exit(1);
  }

  if (options.name!.length > MAX_PIPELINE_NAME_LENGTH) {
    logger.error(`Pipeline name must not exceed ${MAX_PIPELINE_NAME_LENGTH} characters`);
    process.exit(1);
  }

  const client = await getAuthenticatedClient();

  logger.verbose(`Creating pipeline ${options.name}...`);

  const pipelineId = await withProgress(
    'Creating pipeline...',
    async () => {
      return client.createPipeline({
        name: options.name!,
        content,
      });
    },
    { silent: options.json }
  );

  if (options.json) {
    console.log(formatJson({ pipelineId }));
    return;
  }

  logger.info(chalk.green('Pipeline created successfully!'));
  logger.info(`Pipeline ID: ${chalk.cyan(pipelineId.toString())}`);
  logger.info(`\nView pipeline: ${chalk.cyan(`yunxiao pipeline view ${pipelineId}`)}`);
}

function readPipelineContent(options: CreatePipelineOptions): string | undefined {
  if (!options.file) {
    return options.content;
  }

  try {
    const content = readFileSync(options.file, 'utf-8');
    logger.verbose(`Read pipeline content from file: ${options.file}`);
    return content;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Failed to read file: ${error.message}`);
    }
    process.exit(1);
  }
}
