/**
 * 获取配置值命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../../utils/config';
import { logger } from '../../utils/logger';

export function createGetCommand(): Command {
  const cmd = new Command('get');

  cmd
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key (e.g., defaults.output_format, auth.organization_id)')
    .action((key: string) => {
      try {
        const config = configManager.getAll();
        const value = getNestedValue(config as unknown as Record<string, unknown>, key);

        if (value === undefined) {
          logger.warn(`Configuration key "${chalk.yellow(key)}" not found`);
          process.exit(1);
        }

        // 隐藏敏感信息
        if (key.includes('token') || key.includes('password')) {
          logger.info(`${key} = ${chalk.gray('[hidden]')}`);
        } else {
          logger.info(`${key} = ${chalk.cyan(formatValue(value))}`);
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

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function formatValue(value: unknown): string {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
