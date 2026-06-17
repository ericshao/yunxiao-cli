/**
 * 创建工作项命令
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { configManager } from '../../utils/config';
import { CreateWorkitemRequest } from '../../types/yunxiao';

interface CreateWorkitemOptions {
  spaceId?: string;
  type?: string;
  assignedTo?: string;
  sprint?: string;
  labels?: string;
  parent?: string;
  interactive?: boolean;
}

export function createCreateCommand(): Command {
  const cmd = new Command('create');

  cmd
    .description('Create a new workitem')
    .option('-s, --space-id <id>', 'Space ID')
    .option('-t, --type <type>', 'Workitem type ID')
    .option('-a, --assigned-to <user>', 'Assign to user ID')
    .option('--sprint <sprint>', 'Sprint ID')
    .option('-l, --labels <labels>', 'Comma-separated labels')
    .option('-p, --parent <id>', 'Parent workitem ID')
    .option('-i, --interactive', 'Use interactive mode', true)
    .action(async (options: CreateWorkitemOptions) => {
      try {
        const client = await getAuthenticatedClient();

        // 准备创建参数
        let workitemData: CreateWorkitemRequest;

        if (options.interactive !== false) {
          // 交互式模式
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'spaceId',
              message: 'Space ID:',
              default: options.spaceId || configManager.getDefaults()?.space_id,
              validate: (input: string) => (input ? true : 'Space ID is required'),
            },
            {
              type: 'input',
              name: 'workitemTypeId',
              message: 'Workitem Type ID:',
              default: options.type,
              validate: (input: string) => (input ? true : 'Workitem type is required'),
            },
            {
              type: 'input',
              name: 'subject',
              message: 'Subject:',
              validate: (input: string) => (input ? true : 'Subject is required'),
            },
            {
              type: 'editor',
              name: 'description',
              message: 'Description (press Enter to open editor):',
              default: '',
            },
            {
              type: 'input',
              name: 'assignedTo',
              message: 'Assigned to (user ID):',
              default: options.assignedTo,
            },
            {
              type: 'input',
              name: 'sprint',
              message: 'Sprint ID (optional):',
              default: options.sprint,
            },
            {
              type: 'input',
              name: 'labels',
              message: 'Labels (comma-separated):',
              default: options.labels,
            },
            {
              type: 'input',
              name: 'parentId',
              message: 'Parent workitem ID (optional):',
              default: options.parent,
            },
          ]);

          workitemData = {
            spaceId: answers.spaceId,
            workitemTypeId: answers.workitemTypeId,
            subject: answers.subject,
            description: answers.description || undefined,
            assignedTo: answers.assignedTo || undefined,
            sprint: answers.sprint || undefined,
            labels: answers.labels ? answers.labels.split(',').map((l: string) => l.trim()) : [],
            parentId: answers.parentId || undefined,
          };
        } else {
          // 非交互式模式，使用命令行参数
          if (!options.spaceId && !configManager.getDefaults()?.space_id) {
            throw new Error('Space ID is required. Use --space-id or set defaults.space_id');
          }
          if (!options.type) {
            throw new Error('Workitem type is required. Use --type');
          }

          // 读取标题和描述
          const { subject, description } = await inquirer.prompt([
            {
              type: 'input',
              name: 'subject',
              message: 'Subject:',
              validate: (input: string) => (input ? true : 'Subject is required'),
            },
            {
              type: 'editor',
              name: 'description',
              message: 'Description (optional, press Enter to skip):',
              default: '',
            },
          ]);

          workitemData = {
            spaceId: options.spaceId || configManager.getDefaults()?.space_id || '',
            workitemTypeId: options.type,
            subject,
            description: description || undefined,
            assignedTo: options.assignedTo,
            sprint: options.sprint,
            labels: options.labels ? options.labels.split(',').map((l) => l.trim()) : [],
            parentId: options.parent,
          };
        }

        // 显示确认信息
        logger.info('\nWorkitem to create:');
        logger.info(`  Space ID: ${chalk.cyan(workitemData.spaceId)}`);
        logger.info(`  Type: ${chalk.cyan(workitemData.workitemTypeId)}`);
        logger.info(`  Subject: ${chalk.cyan(workitemData.subject)}`);
        if (workitemData.description) {
          const preview =
            workitemData.description.length > 100
              ? workitemData.description.substring(0, 100) + '...'
              : workitemData.description;
          logger.info(`  Description: ${chalk.gray(preview)}`);
        }
        if (workitemData.assignedTo) {
          logger.info(`  Assigned to: ${chalk.cyan(workitemData.assignedTo)}`);
        }
        if (workitemData.sprint) {
          logger.info(`  Sprint: ${chalk.cyan(workitemData.sprint)}`);
        }
        if (workitemData.labels && workitemData.labels.length > 0) {
          logger.info(`  Labels: ${chalk.cyan(workitemData.labels.join(', '))}`);
        }
        if (workitemData.parentId) {
          logger.info(`  Parent: ${chalk.cyan(workitemData.parentId)}`);
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Create this workitem?',
            default: true,
          },
        ]);

        if (!confirm) {
          logger.info('Cancelled.');
          return;
        }

        // 创建工作项
        const spinner = ora('Creating workitem...').start();
        try {
          const response = await client.createWorkitem(workitemData);
          spinner.succeed(`Workitem created successfully: ${chalk.green(response.id)}`);

          // 提示查看详情
          logger.info(`\nView details: ${chalk.cyan(`yunxiao workitem view ${response.id}`)}`);
        } catch (error) {
          spinner.fail('Failed to create workitem');
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
