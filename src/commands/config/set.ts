/**
 * 设置配置值命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../../utils/config';
import { logger } from '../../utils/logger';

export function createSetCommand(): Command {
  const cmd = new Command('set');

  cmd
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key (e.g., defaults.output_format)')
    .argument('<value>', 'Configuration value')
    .action((key: string, value: string) => {
      try {
        const config = configManager.getAll();
        const parsedValue = parseValue(value);

        setNestedValue(config as unknown as Record<string, unknown>, key, parsedValue);

        // 保存整个配置
        configManager.clear();
        Object.keys(config).forEach((k) => {
          const key = k as keyof typeof config;
          configManager.set(key, config[key]);
        });

        logger.success(`Set ${chalk.cyan(key)} = ${chalk.green(formatDisplayValue(parsedValue))}`);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Error: ${error.message}`);
        }
        process.exit(1);
      }
    });

  return cmd;
}

function parseValue(value: string): unknown {
  // 尝试解析 JSON
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

  // 尝试解析 JSON 对象/数组
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

function formatDisplayValue(value: unknown): string {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
