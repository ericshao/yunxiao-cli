/**
 * 添加评论命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { isValidWorkitemId } from '../../utils/validators';

interface AddCommentOptions {
  content?: string;
  parentId?: string;
}

export function createAddCommand(): Command {
  const cmd = new Command('add');

  cmd
    .description('Add a comment to a workitem')
    .argument('<workitem-id>', 'Workitem ID (e.g., PROJ-123)')
    .option('-c, --content <text>', 'Comment content')
    .option('-p, --parent-id <id>', 'Parent comment ID (for replies)')
    .action(async (workitemId: string, options: AddCommentOptions) => {
      try {
        // 验证工作项 ID
        if (!isValidWorkitemId(workitemId)) {
          throw new Error(
            `Invalid workitem ID format: ${workitemId}. Expected format: PROJECTCODE-NUMBER`
          );
        }

        const client = await getAuthenticatedClient();

        // 获取评论内容
        let content = options.content;
        if (!content) {
          const answer = await inquirer.prompt([
            {
              type: 'editor',
              name: 'content',
              message: 'Enter comment (will open editor):',
              validate: (input: string) => (input.trim() ? true : 'Comment content is required'),
            },
          ]);
          content = answer.content;
        }

        if (!content || !content.trim()) {
          throw new Error('Comment content is required');
        }

        // 显示预览
        logger.info('\nComment to add:');
        logger.info(`  Workitem: ${chalk.cyan(workitemId)}`);
        if (options.parentId) {
          logger.info(`  Reply to: ${chalk.cyan(options.parentId)}`);
        }
        const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
        logger.info(`  Content:\n${chalk.gray(preview)}`);

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Add this comment?',
            default: true,
          },
        ]);

        if (!confirm) {
          logger.info('Cancelled.');
          return;
        }

        // 添加评论
        const spinner = ora('Adding comment...').start();
        try {
          const response = await client.createWorkitemComment(workitemId, {
            content,
            parentId: options.parentId,
          });
          spinner.succeed(`Comment added successfully: ${chalk.green(response.id)}`);

          // 提示查看评论列表
          logger.info(`\nView comments: ${chalk.cyan(`yunxiao comment list ${workitemId}`)}`);
        } catch (error) {
          spinner.fail('Failed to add comment');
          throw error;
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error: ${error.message}`);
        } else {
          logger.error('An unknown error occurred');
        }
        process.exit(1);
      }
    });

  return cmd;
}
