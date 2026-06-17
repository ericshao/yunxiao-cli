/**
 * Config 命令组
 */

import { Command } from 'commander';
import { createGetCommand } from './get';
import { createSetCommand } from './set';
import { createListCommand } from './list';
import { createPathCommand } from './path';

export function createConfigCommand(): Command {
  const cmd = new Command('config');

  cmd
    .description('Manage CLI configuration')
    .addCommand(createGetCommand())
    .addCommand(createSetCommand())
    .addCommand(createListCommand())
    .addCommand(createPathCommand());

  return cmd;
}
