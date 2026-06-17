/**
 * 列出所有配置命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { configManager } from '../../utils/config';
import { logger } from '../../utils/logger';

interface ListConfigOptions {
  json?: boolean;
}

export function createListCommand(): Command {
  const cmd = new Command('list');

  cmd
    .alias('ls')
    .description('List all configuration')
    .option('-j, --json', 'Output as JSON')
    .action((options: ListConfigOptions) => {
      try {
        const config = configManager.getAll();

        if (options.json) {
          // 隐藏敏感信息
          const sanitized = sanitizeConfig(config as unknown as Record<string, unknown>);
          console.log(JSON.stringify(sanitized, null, 2));
        } else {
          // 表格格式
          const table = new Table({
            head: [chalk.cyan('Key'), chalk.cyan('Value')],
            colWidths: [40, 60],
            wordWrap: true,
          });

          const flattened = flattenObject(config as unknown as Record<string, unknown>);
          Object.entries(flattened).forEach(([key, value]) => {
            // 隐藏敏感信息
            if (key.includes('token') || key.includes('password')) {
              table.push([key, chalk.gray('[hidden]')]);
            } else {
              table.push([key, formatValue(value)]);
            }
          });

          console.log(table.toString());
          logger.info(`\nConfig file: ${chalk.cyan(configManager.getConfigPath())}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }
    });

  return cmd;
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  });

  return result;
}

function sanitizeConfig(config: Record<string, unknown>): Record<string, unknown> {
  const sanitized = JSON.parse(JSON.stringify(config));

  const hideValue = (obj: Record<string, unknown>) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((k) => {
        if (k.includes('token') || k.includes('password')) {
          obj[k] = '[hidden]';
        } else if (typeof obj[k] === 'object' && obj[k] !== null) {
          hideValue(obj[k] as Record<string, unknown>);
        }
      });
    }
  };

  hideValue(sanitized);
  return sanitized;
}

function formatValue(value: unknown): string {
  if (value === null) return chalk.gray('null');
  if (value === undefined) return chalk.gray('undefined');
  if (typeof value === 'boolean') return value ? chalk.green('true') : chalk.red('false');
  if (typeof value === 'number') return chalk.yellow(String(value));
  if (Array.isArray(value)) return chalk.cyan(JSON.stringify(value));
  if (typeof value === 'object') return chalk.cyan(JSON.stringify(value));
  return String(value);
}
