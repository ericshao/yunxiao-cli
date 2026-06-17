/**
 * Pipeline 命令 - 更新流水线
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withProgress } from '../../utils/progress';
import { UpdatePipelineOptions } from '../../types/cli';
import chalk from 'chalk';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update a pipeline')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('-n, --name <name>', 'Pipeline name (max 60 characters)')
    .option('-c, --content <content>', 'Pipeline YAML content')
    .option('-f, --file <file>', 'Read pipeline YAML content from file')
    .action(async (pipelineId: string, options: UpdatePipelineOptions) => {
      try {
        await updatePipeline(pipelineId, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to update pipeline:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function updatePipeline(pipelineId: string, options: UpdatePipelineOptions): Promise<void> {
  const client = await getAuthenticatedClient();

  // 确定 content
  let content = options.content;
  if (options.file) {
    try {
      content = readFileSync(options.file, 'utf-8');
      logger.verbose(`Read pipeline content from file: ${options.file}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to read file: ${error.message}`);
      }
      process.exit(1);
    }
  }

  // 验证必需参数
  if (!options.name) {
    logger.error('Pipeline name is required (--name)');
    process.exit(1);
  }

  if (!content) {
    logger.error('Pipeline content is required (--content or --file)');
    process.exit(1);
  }

  if (options.name.length > 60) {
    logger.error('Pipeline name must not exceed 60 characters');
    process.exit(1);
  }

  logger.verbose(`Updating pipeline ${pipelineId}...`);

  const result = await withProgress('Updating pipeline...', async () => {
    return client.updatePipeline(pipelineId, {
      name: options.name!,
      content: content!,
    });
  });

  if (result) {
    logger.info(chalk.green(`Pipeline ${pipelineId} updated successfully`));
  } else {
    logger.error('Failed to update pipeline');
    process.exit(1);
  }
}
