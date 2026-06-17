/**
 * 显示配置文件路径命令
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../../utils/config';

export function createPathCommand(): Command {
  const cmd = new Command('path');

  cmd.description('Show configuration file path').action(() => {
    const path = configManager.getConfigPath();
    console.log(chalk.cyan(path));
  });

  return cmd;
}
