/**
 * 更新工作项命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { isValidWorkitemId } from '../../utils/validators';
import { UpdateWorkitemRequest } from '../../types/yunxiao';

interface UpdateWorkitemOptions {
  subject?: string;
  description?: string;
  assignedTo?: string;
  status?: string;
  sprint?: string;
  labels?: string;
  interactive?: boolean;
}

export function createUpdateCommand(): Command {
  const cmd = new Command('update');

  cmd
    .description('Update an existing workitem')
    .argument('<id>', 'Workitem ID (e.g., PROJ-123)')
    .option('-s, --subject <subject>', 'Update subject')
    .option('-d, --description <desc>', 'Update description')
    .option('-a, --assigned-to <user>', 'Assign to user ID')
    .option('--status <status>', 'Update status ID')
    .option('--sprint <sprint>', 'Update sprint ID')
    .option('-l, --labels <labels>', 'Update labels (comma-separated)')
    .option('-i, --interactive', 'Use interactive mode', true)
    .action(async (workitemId: string, options: UpdateWorkitemOptions) => {
      try {
        // 验证工作项 ID
        if (!isValidWorkitemId(workitemId)) {
          throw new Error(
            `Invalid workitem ID format: ${workitemId}. Expected format: PROJECTCODE-NUMBER`
          );
        }

        const client = await getAuthenticatedClient();

        // 获取当前工作项信息
        const spinner = ora('Fetching workitem details...').start();
        let currentWorkitem;
        try {
          currentWorkitem = await client.getWorkitem(workitemId);
          spinner.succeed('Workitem fetched');
        } catch (error) {
          spinner.fail('Failed to fetch workitem');
          throw error;
        }

        // 显示当前信息
        logger.info('\nCurrent workitem:');
        logger.info(`  ID: ${chalk.cyan(currentWorkitem.serialNumber)}`);
        logger.info(`  Subject: ${chalk.cyan(currentWorkitem.subject)}`);
        logger.info(`  Status: ${chalk.yellow(currentWorkitem.status.name)}`);
        logger.info(
          `  Assigned to: ${currentWorkitem.assignedTo ? chalk.cyan(currentWorkitem.assignedTo.name) : chalk.gray('Unassigned')}`
        );
        if (currentWorkitem.sprint) {
          logger.info(`  Sprint: ${chalk.cyan(currentWorkitem.sprint.name)}`);
        }
        if (currentWorkitem.labels && currentWorkitem.labels.length > 0) {
          logger.info(`  Labels: ${chalk.cyan(currentWorkitem.labels.join(', '))}`);
        }

        // 准备更新数据
        const updates: UpdateWorkitemRequest = {};

        if (options.interactive !== false) {
          // 交互式模式
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'subject',
              message: 'New subject (leave empty to keep current):',
              default: options.subject,
            },
            {
              type: 'confirm',
              name: 'updateDescription',
              message: 'Update description?',
              default: false,
            },
            {
              type: 'editor',
              name: 'description',
              message: 'New description:',
              when: (answers: { updateDescription: boolean }) => answers.updateDescription,
              default: currentWorkitem.description || '',
            },
            {
              type: 'input',
              name: 'assignedTo',
              message: 'Assigned to (user ID, leave empty to keep current):',
              default: options.assignedTo,
            },
            {
              type: 'input',
              name: 'status',
              message: 'Status ID (leave empty to keep current):',
              default: options.status,
            },
            {
              type: 'input',
              name: 'sprint',
              message: 'Sprint ID (leave empty to keep current):',
              default: options.sprint,
            },
            {
              type: 'input',
              name: 'labels',
              message: 'Labels (comma-separated, leave empty to keep current):',
              default: options.labels,
            },
          ]);

          if (answers.subject) updates.subject = answers.subject;
          if (answers.description) updates.description = answers.description;
          if (answers.assignedTo) updates.assignedTo = answers.assignedTo;
          if (answers.status) updates.status = answers.status;
          if (answers.sprint) updates.sprint = answers.sprint;
          if (answers.labels) {
            updates.labels = answers.labels.split(',').map((l: string) => l.trim());
          }
        } else {
          // 非交互式模式
          if (options.subject) updates.subject = options.subject;
          if (options.description) updates.description = options.description;
          if (options.assignedTo) updates.assignedTo = options.assignedTo;
          if (options.status) updates.status = options.status;
          if (options.sprint) updates.sprint = options.sprint;
          if (options.labels) {
            updates.labels = options.labels.split(',').map((l) => l.trim());
          }
        }

        // 检查是否有更新
        if (Object.keys(updates).length === 0) {
          logger.info(chalk.yellow('\nNo changes specified. Nothing to update.'));
          return;
        }

        // 显示要更新的字段
        logger.info('\nUpdates to apply:');
        Object.entries(updates).forEach(([key, value]) => {
          logger.info(`  ${key}: ${chalk.green(JSON.stringify(value))}`);
        });

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Apply these updates?',
            default: true,
          },
        ]);

        if (!confirm) {
          logger.info('Cancelled.');
          return;
        }

        // 更新工作项
        const updateSpinner = ora('Updating workitem...').start();
        try {
          await client.updateWorkitem(workitemId, updates);
          updateSpinner.succeed(`Workitem ${chalk.green(workitemId)} updated successfully`);

          // 提示查看详情
          logger.info(`\nView details: ${chalk.cyan(`yunxiao workitem view ${workitemId}`)}`);
        } catch (error) {
          updateSpinner.fail('Failed to update workitem');
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
